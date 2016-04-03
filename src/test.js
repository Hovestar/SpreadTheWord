var inputTime = 5;
var outputTime = 10;
var sleep = require('sleep');

var timeout = 0;
var mode = 0;
console.log('Running input');
var b = require('./input.js');
sleep.sleep(10);
console.log('Running output');
b = require('./output.js');
sleep.sleep(10);
console.log('Running input');
var b = require('./input.js');
sleep.sleep(10);
