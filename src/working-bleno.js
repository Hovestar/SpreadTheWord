var bleno = require('bleno');

var EchoCharacteristic = require('./characteristic');

console.log('bleno - echo');

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

