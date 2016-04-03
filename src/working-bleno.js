var bleno = require('bleno');

var EchoCharacteristic = require('./characteristic');

console.log('bleno - echo');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    var C = new bleno.Characteristic({
      uuid: 'ca00',
      properties: ['read'],
      value: 'Characteristic',
    });
    var service1 = new bleno.PrimaryService({
      uuid:'beef',
      properties: ['notify','read'],
      characteristics: [C]
    });
      
    
    var services = [service1];

    bleno.setServices(services);

    bleno.startAdvertising('spartacus', ['beef']);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
  if (!error) {
   /* bleno.setServices([
      new BlenoPrimaryService({
        uuid: '0001',
        descriptors: [
          new bleno.Descriptor({
            uuid: '0001',
            value: 'Test.'
          })
        ],
        characteristics: [
          //new EchoCharacteristic()
        ]
      })
    ]);
*/
  }
});

