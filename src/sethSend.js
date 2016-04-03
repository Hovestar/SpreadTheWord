var bleno = require('bleno');

console.log('bleno - echo');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    var C = new bleno.Characteristic({
      uuid: 'ca00',
      properties: ['read'],
      value: 'Characteristic',
      serviceData: [
        {
            uuid: "ca00",
            data: "HEY SETH"
        }
    ]
    });
    var service1 = new bleno.PrimaryService({
      uuid:'dead',
      properties: ['notify','read'],
      characteristics: [C]
    });
      
    
    var services = [service1];

    bleno.setServices(services);

    bleno.startAdvertising('spartacus1', ['dead']);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
});
