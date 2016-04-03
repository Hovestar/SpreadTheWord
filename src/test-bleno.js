var bleno = require('bleno'),
    async = require('async'),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8888;
var messages = ["This", "Is", "A", "Test of something really cool!"];
var EchoCharacteristic = require('./characteristic');

console.log('bleno - echo');

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

