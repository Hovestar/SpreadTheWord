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
    process.exit(0);
  });

  peripheral.connect(function(error) {
    peripheral.discoverServices([], function(error, services) {
      var serviceIndex = 0;

      async.whilst(
        function () {
          return (serviceIndex < services.length);
        },
        function(callback) {
          var service = services[serviceIndex];
          service.discoverCharacteristics([], function(error, characteristics) {
            var characteristicIndex = 0;
            async.whilst(
              function () {
                return (characteristicIndex < characteristics.length);
              },
              function(callback) {
                var characteristic = characteristics[characteristicIndex];
                  if (characteristic.properties.indexOf('read') !== -1) {
                    characteristic.read(function(error, data) {
                      if (data) {
                        console.log(data.toString('ascii'));
                      }
                    });
                  }
                characteristicIndex++;
              },
              function(error) {
                characteisticIndex++;
                callback();
              }
            );
          });
          serviceIndex++;
        },
        function (err) {
          peripheral.disconnect();
        }
      );
    });
  });
}
