var async = require('async');
var noble = require('noble');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  if (peripheral.advertisement.localName === 'spartacus') {
    explore(peripheral);
  }
});

function explore(peripheral) {
  peripheral.on('disconnect', function() {
    console.log('disconnected');
    return;
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
          console.log("error");
          peripheral.disconnect();
        }
      );
    });
  });
}


