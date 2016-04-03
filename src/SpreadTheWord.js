var async = require('async'),
    bleno = require('bleno'),
    noble = require('noble');

/* this section handles sending messages */
bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    var C = new bleno.Characteristic({
      uuid: 'ca00',
      properties: ['read'],
      value: 'TestString1',
    }); 
    var C2 = new bleno.Characteristic({
      uuid: 'ca01',
      properties: ['read'],
      value: 'TestString2 - by the way, these strings can be pretty long. Like, pretty damn long. This one is over 100 characters.',
    }); 
    var service1 = new bleno.PrimaryService({
      uuid:'13333333333333333333333333330004',
      properties: ['notify','read'],
      characteristics: [C,C2]
    }); 
    
    
    var services = [service1];

    bleno.setServices(services);

    bleno.startAdvertising('spartacus', ['13333333333333333333333333330003']);
  } else {
    bleno.stopAdvertising();
  }
});



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


