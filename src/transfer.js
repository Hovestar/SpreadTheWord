#!/usr/bin/node

var noble = require('noble');
var async = require('async');

//http://stackoverflow.com/questions/2686855/is-there-a-javascript-function-that-can-pad-a-string-to-get-to-a-determined-leng
function pad(pad, str, padLeft) {
	if (typeof str === 'undefined') 
		return pad;
	if (padLeft) {
		return (pad + str).slice(-pad.length);
	} else {
		return (str + pad).substring(0, pad.length);
	}
}

function periDisc(peri){//Peripherial Discovered
	//console.log("ID:"+peri.id);
	var advert = peri.advertisement;
	var name = advert.localName;
	pad_str = Array(30).join(' ');
	peri.on('disconnect', function(){console.log(peri.address+"\t"+pad(pad_str,name,false)+"\tExited");});
	peri.once('connect', function(){console.log(peri.address+"\t"+pad(pad_str,name,false)+"\tConnected");});
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

