#!/usr/bin/node

var noble = require('noble');
var async = require('async');

function periDisc(peri){//Peripherial Discovered
	//console.log("ID:"+peri.id);
	var advert = peri.advertisement;
	var name = advert.localName;
	peri.on('disconnect', function(){console.log(peri.id+"\t"+name+"\tExited");});
	peri.once('connect', function(){console.log(peri.id+"\t"+name+"\tConnected");});
	peri.connect();
	peri.discoverServices();
}

function servDisc(serv){ //Service Discovered
	//console.log("Found One!");
	//console.log(serv);
	if(serv.length != 0)
	{
		//serv.discoverIncludedServices();
		serv.discoverCharacteristics();
		serv.once('characteristicsDiscover',charDisc);
	}
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

