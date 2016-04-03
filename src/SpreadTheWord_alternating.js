var async = require('async'),
    bleno = require('bleno'),
    noble = require('noble'),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8888,
    messages = ["This", "Is", "A", "Test of something really cool!"];
var EchoCharacteristic = require('./characteristic');
/* this section handles sending messages */
bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    numMessages = 0;
    charList = [];
    while (numMessages < messages.length) {
      charList.push(
        new bleno.Characteristic({
          uuid: '000' + numMessages,
          properties: ['read'],
          value: messages[numMessages],
        })
      );
      numMessages++;
    }
    var service1 = new bleno.PrimaryService({
      uuid:'13333333333333333333333333330004',
      properties: ['notify','read'],
      characteristics: charList
    });
      
    
    var services = [service1];

    bleno.setServices(services);

    bleno.startAdvertising('spartacus', ['13333333333333333333333333330003']);
  } else {
    bleno.stopAdvertising();
  }
});


bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
  if (!error) {
}});

/* This section handles recieving messages*/
noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  if (peripheral.advertisement.localName === 'spartacus') {
    noble.stopScanning();
    explore(peripheral);
  }
});


function explore(peripheral) {
  peripheral.on('disconnect', function() {
    process.exit(0);
  }); 

  peripheral.connect(function(error) {
    peripheral.discoverServices([], function(error, services) {
      var serviceIndex = 2;

      async.whilst(
        function () {
          return (serviceIndex < services.length);
        },
        function(callback) {
          var service = services[serviceIndex];
          var serviceInfo = service.uuid;

          service.discoverCharacteristics([], function(error, characteristics) {
            var characteristicIndex = 0;

            async.whilst(
              function () {
                return (characteristicIndex < characteristics.length);
              },
              function(callback) {
                var characteristic = characteristics[characteristicIndex];
                async.series([
                  function(callback) {
                    characteristic.discoverDescriptors(function(error, descriptors) {
                      async.detect(
                        descriptors,
                        function(descriptor, callback) {
                          return callback(descriptor.uuid === '2901');
                        },
                        function(userDescriptionDescriptor){
                          if (userDescriptionDescriptor) {
                            userDescriptionDescriptor.readValue(function(error, data) {
                              callback();
                            });
                          } else {
                            callback();
                          }
                        }
                      );
                    });
                  },
                  function(callback) {
                    if (characteristic.properties.indexOf('read') !== -1) {
                      characteristic.read(function(error, data) {
                        if (data) {
                          console.log(data.toString('ascii'));

                        }
                        callback();
                      });
                    } else {
                      callback();
                    }
                  },
                  function() {
                    characteristicIndex++;
                    callback();
                  }
                ]);
              },
              function(error) {
                serviceIndex++;
                callback();
              }
            );
          });
        },
        function (err) {
          peripheral.disconnect();
        }
      );
    });
  });
}

function updateList(message) {
  console.log('Messages updated!');

  messages.push(message);
  if (bleno.state === 'poweredOn') {
    bleno.stopAdvertising();
    
    console.log("Stopped advertising!");
    numMessages = 0;
    charList = [];
    while (numMessages < messages.length) {
      console.log("Advertising " + messages[numMessages] + "!"); 
      charList.push(
        new bleno.Characteristic({
          uuid: '000' + numMessages,
          properties: ['read'],
          value: messages[numMessages],
        })
      );
      numMessages++;
    }
    var service = new bleno.PrimaryService({
      uuid:'13333333333333333333333333330004',
      properties: ['notify','read'],
      characteristics: charList
    }); 
    var services = [service];
    bleno.setServices(services);
    console.log("About to start advertising again!");
    bleno.startAdvertising('spartacus', ['13333333333333333333333333330003']);
    console.log("Started updating!");
  }
}
/* this section hosts the website */

http.createServer(function(request, response) {

  if(request.method.toLowerCase() == 'get'){
    if(request.url[1] == "?"){
      var ind = request.url.search("=");
      var message = request.url.substr(ind+1)
      //console.log(message);
      updateList(message);
      }
  }

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
  };

  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      var headers = {};
      var contentType = contentTypesByExtension[path.extname(filename)];
      if (contentType) headers["Content-Type"] = contentType;
      response.writeHead(200, headers);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
