#!/usr/bin/node

var fs = require("fs");

function getFiles(dir){
	return fs.readdirSync(dir).sort(function(a, b) {
		return fs.statSync(dir + a).mtime.getTime() - fs.statSync(dir + b).mtime.getTime();
	});
}

console.log(getFiles("./Data/"));
