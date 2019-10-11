var assert = require('assert');

var fs = require('fs');
var MorkParser = require('../lib/MorkParser.js');

describe('Parsing Thunderbird Address Book', function() {
  it('should complete without errors', function() {
    
    //Read mork file
    var srcfile = "./test/fixtures/abook.mab";
    var content = fs.readFileSync(srcfile, "utf-8");

    //Parse mork file
    var mork = new MorkParser();
    var records = mork.parse(content);
    
    //Asserts
    assert.ok(typeof records != "undefined", "Expected a parsed result");
    assert.equal(records.length, 1, "Expected exactly 1 item in the array");
    assert.equal(records[0].DisplayName, "Foo Bar", "Expected display name");
    assert.equal(records[0].PrimaryEmail, "foo.bar@example.com", "Expected e-mail address");
    
  });
});

describe('Parsing Thunderbird message folder', function() {
  it('should parse UTF-8 chars', function() {
    
    //Read mork file
    var srcfile = "./test/fixtures/Trash.msf";
    var content = fs.readFileSync(srcfile, "utf-8");

    //Parse mork file
    var mork = new MorkParser();
    var records = mork.parse(content);
    
    //Asserts
    assert.ok(typeof records != "undefined", "Expected a parsed result");
    assert.equal(records.length, 1, "Expected exactly 1 item in the array");
    assert.equal(records[0].folderName, "Koš", "Expected UTF-8 char");
    
  });
});