/** Mozilla Mork (.mab, .msf) content parser **/

//Constructor
function MorkParser() {
  var self = this;
  
  this.key_table = null;
  this.val_table = null;
  this.row_hash = null;
  this.skipped = 0;
  this.total = 0;
  
  //Returns an array of hashes
  function mork_parse_content(body) {
    //Reset global variables
    self.key_table = { };
    self.val_table = { };
    self.row_hash = { };
    self.skipped = 0;
    self.total = 0;
    
    //Local variables
    var section_end_re = null;
    var section = "top level";

    //Windows Mozilla uses \r\n
    body = body.replace(/\r\n/g, "\n");
    
    //Presumably Mac Mozilla is similarly dumb
    body = body.replace(/\r/g, "\n");

    //Sometimes backslash is quoted with a backslash; convert to hex.
    body = body.replace(/\\\\/g, "$5C");
    
    //Close-paren is quoted with a backslash; convert to hex.
    body = body.replace(/\\\)/g, "$29");
    
    //Backslash at end of line is continuation.
    body = body.replace(/\\\n/g, "");

    //Figure out what we're looking at, and parse it.
    while (body.trim().length > 0) {
      var m;
      
      //Comment
      m = /^\s*\/\/.*?\n/g.exec(body);
      if (m) {
        var captured = m[1];
        body = body.substring(m[0].length);
        //no-op
        continue;
      } 
      
      //Key table <(a=c)>
      m = /^\s*<\s*<\(a=c\)>[\S\s]+?(([^>]*))>\s*/g.exec(body);
      if (m) {
        var captured = m[1];
        body = body.replace(m[0], "");
        mork_parse_key_table(section, captured);
        continue;
      }
      
      //Values <...>
      m = /^\s*<([\S\s]*?\))>\s*/g.exec(body);
      if (m) {
        var captured = m[1];
        body = body.replace(m[0], "");
        mork_parse_value_table(section, captured);
        continue;
      }
      
      //Table {...}
      m = /^\s*\{-?[\dA-F]+:[\S\s]*?\{(([\S\s]*?\})([\S\s]*?\}))\s*/gi.exec(body);
      if (m) {
        var captured = m[1];
        body = body.replace(m[0], "");
        mork_parse_table(section, captured);
        continue;
      }
      
      //Rows (-> table) [...]
      m = /^\s*((\[[\S\s]*?\]\s*)+)/g.exec(body);
      if (m) {
        var captured = m[1];
        body = body.replace(m[0], "");
        mork_parse_table(section, captured);
        continue;
      }
      
      //Section end
      if (section_end_re) {
        m = section_end_re.exec(body);
        if (m) {
          var captured = m[1];
          body = body.replace(m[0], "");
          section_end_re = null;
          section = "top level";
          continue;
        }
      }
      
      //Section begin
      m = /\@\$\$\{([\dA-F]+)\{\@\s*/gi.exec(body);
      if (m) {
        var captured = m[1];
        section = captured;
        body = body.replace(m[0], "");
        section_end_re = new RegExp("^\\s*\\@\\$\\$\\}" + section + "\\}\\@\\s*", "g");
        continue;
      }
      
      //Unknown segment
      var segment = body.substring(0, 255 < body.length ? 255 : body.length);
      console.error(section + ": Cannot parse");
      console.error(segment);
      return [ { error: "Cannot parse!", section: section, segment: segment } ];
    }

    if (section_end_re) {
      console.error("Unterminated section " + section);
    }
    
    //Convert dictionary to array
    var list = [ ];
    var keys = Object.keys(self.row_hash);
    for (let key of keys) {
      list.push(self.row_hash[key]);
    }
    
    return list;
  }

  //Parse a row and column table
  function mork_parse_table(section, table_part) {

    //Assumption: no relevant spaces in values in this section
    table_part = table_part.replace(/\s+/g, "");
    
    //Grab each complete [...] block
    var regex = /[^[]*\[([\S\s]+?)\]/g;
    while ((m = regex.exec(table_part)) != null) {
      var hash = { };
          
      //break up the table - each line cosists of a $id and the rest are records
      var parts = m[1].split(/[()]+/);
      var id = parts[0];
      var cells = parts;

      //A long way of saying skip the line if there are no records in the cells array
      if (cells.length < 1) {
        continue;
      }

      //Trim junk
      id = id.replace(/^-/g, "");
      id = id.replace(/:[\S\s]*/g, "");

      //Check that the id number we've been given corresponds to one we pulled out from the key_table index
      if (self.row_hash[id]) {
        hash = self.row_hash[id];
      }
    
      for (var i = 1; i < cells.length; i++) {
        var cell = cells[i];
        
        //Skip empty record
        if (!cell || cell.trim().length == 0) {
          continue;
        }
            
        //Extract key and value
        var m = /^\^([-\dA-F]+)([\^=])([\S\s]*)$/gi.exec(cell);
        if (!m) {
          continue;
        }
        
        var keyi = m[1];
        var which = m[2];
        var vali = m[3];
        
        //Empty value
        if (!vali || vali.trim().length == 0) {
          //console.error("Unparsable cell: " + cell);
        }
        
        //Ignore the key if it isn't in the key table
        var key = self.key_table[keyi];
        if (!key) {
          continue;
        }
        
        var val = (which == '=' ? vali : self.val_table[vali]);
        
        //Fix character encoding
        val = mork_fix_encoding(val);
        
        hash[key] = val;
      }
      
      self.total++;
      self.row_hash[id] = hash;
    }
  }

  //Parse a values table
  function mork_parse_value_table(section, val_part) {
    if (!val_part) {
      return { };
    }

    //Extract pairs (key=value)
    var pairs = val_part.split(/\(([^\)]+)\)/g);
    
    for (let pair of pairs) {
      //Skip empty line
      if (pair.trim().length == 0) {
        continue;
      }
      
      var m = /([\dA-F]*)[\t\n ]*=[\t\n ]*([\S\s]*)/gi.exec(pair);
      if (!m) {
        continue;
      }
      
      key = m[1];
      val = m[2];
      
      if (!val || val.trim().length == 0) {
        //console.error(section + ": unparsable value: " + pair);
        //continue;
      }
      
      //Approximate wchar_t -> ASCII and remove NULs
      //val = mork_fix_encoding(val);
      
      self.val_table[key] = val;
    }
    
    return self.val_table;
  }

  //Parse a key table
  function mork_parse_key_table(section, key_part) {
    //Remove comments (starting with "//" until the end of the line)
    key_part = key_part.replace(/\s*\/\/.*$/gm, "");
    
    //Extract pairs (key=value)
    var pairs = key_part.split(/\(([^\)]+)\)/g);
    
    //Convert to dictionary object
    for (let pair of pairs) {
      //Skip empty line
      if (pair.trim().length == 0) {
        continue;
      }
      
      //Parse key-value pairs
      var m = /([\dA-F]+)\s*=\s*([\S\s]*)/gi.exec(pair);
      if (m) {
        key = m[1];
        val = m[2];
        self.key_table[key] = val;
      }
    }
    
    return self.key_table;
  }

  //Fix character encoding, e.g. remove $00 but keep \$ff (escaped with slash)
  function mork_fix_encoding(value) {
    if (value && value.indexOf("$") >= 0) {
      
      function fixASCII(m, m0, m1) {
        var n1 = parseInt(m1, 16);
        var ch = String.fromCharCode(n1); //Convert byte to ASCII
        return m0 + ch;
      }
      
      function fixUTF8(m, m0, m1, m2) {
        var n1 = parseInt(m1, 16);
        var n2 = parseInt(m2, 16);
        var ch = "?";
        
        //Convert bytes to ASCII
        //var ch = String.fromCharCode(n1, n2);
        
        //Convert bytes to UTF-8
        if (typeof Buffer != "undefined" && typeof Buffer.from == "function") {
          ch = Buffer.from([ n1, n2 ]).toString("utf-8"); //Works with node.js
        }
        else if (typeof TextDecoder != "undefined") {
          ch = new TextDecoder("utf-8").decode([ n1, n2 ]); //Works inside a web browser
        }
        else {
          console.warn("Cannot decode character " + m.substring(1));
        }
        
        return m0 + ch;
      }
      
      return value
        .replace(/([^\\])\$00/g, "$1")
        .replace(/([^\\])\$([0-9A-Z][0-9A-Z])\$([0-9A-Z][0-9A-Z])/gi, fixUTF8) //Replace non-escaped $xx$yy but ignore \$xx$yy
        .replace(/^()\$([0-9A-Z][0-9A-Z])\$([0-9A-Z][0-9A-Z])/gi, fixUTF8) //Replace value starting with $xx$yy
        .replace(/([^\\])\$([0-9A-Z][0-9A-Z])/gi, fixASCII) //Replace non-escaped $xx but ignore \$xx
        .replace(/^()\$([0-9A-Z][0-9A-Z])/gi, fixASCII); //Replace value starting with $xx
    }
    return value;
  }
  
  this._mork_parse_content = mork_parse_content;
}

//Parse mork content and return an array of objects
MorkParser.prototype.parse = function(content) {
  return this._mork_parse_content(content);
};

module.exports = MorkParser;