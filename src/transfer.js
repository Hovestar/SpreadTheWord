#!/usr/bin/node

var noble = require('noble');
var async = require('async');

function periDisc(peri){//Peripherial Discovered
	console.log("ID:"+peri.id);
	peri.once('servicesDiscover',servDisc);
	peri.on('disconnect', function(){console.log("EXITING!");process.exit(0);});
	peri.once('connect', function(){console.log("Connected!")});
	peri.connect();
	peri.discoverServices();
}

function servDisc(serv){ //Service Discovered
	console.log("Found One!");
	serv.discoverIncludedServices();
	serv.discoverCharacteristics();
	serv.once('characteristicsDiscover',charDisc);
}
function charDisc(char){ //Characteristic discovered
	console.log(char.uuid);
}

function warningHandler(mess){
	console.log("--WARNING--");
	console.log(mess);
	console.log("--/WARNING--");
}



noble.on('stateChange', function(state) {
	if (state === 'poweredOn') {
		noble.startScanning();
	} else {
		noble.stopScanning();
	}
});

noble.on('warning', warningHandler);
noble.on('discover', periDisc);

