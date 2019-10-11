#!/usr/bin/env node

var fs = require('fs');
var MorkParser = require('../lib/MorkParser.js');

//Command line arguments
var srcfile = process.argv[2];
var dstfile = process.argv[3];
if (!srcfile || !dstfile) {
  console.log("Usage: mork2json <srcfile> <dstfile>");
  process.exit(1);
}

//Read mork file
var content = fs.readFileSync(srcfile, "utf-8");

//Parse mork file
var mork = new MorkParser();
var list = mork.parse(content);

//Print to console (may be too long output)
//var count = list.length;
//for (let item of list) {
//  console.log(item);
//}

//Save JSON to a file
var json = JSON.stringify(list, " ", 2);
fs.writeFileSync(dstfile, json);
console.log("File saved: " + dstfile);

console.log("Done!");