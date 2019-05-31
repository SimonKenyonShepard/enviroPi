'use strict';
 
const clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString,
      Message = require('azure-iot-device').Message;

exports = module.exports = function(sensorCCS811, sensorBME280){

  const connStr = 'HostName=SKS-Environment.azure-devices.net;DeviceId=EnviroPi;SharedAccessKey=koHVWSqRkPdLNY7wt99NNasT6wgVCH4JuvdhTg8yzMA=',
        client = clientFromConnectionString(connStr);

  client.open(
    function (err) {
      if (err) {
        console.log('Could not connect to IoT Hub: ' + err);
      } else {
        console.log('Client connected to IoT Hub');
     
        // Create a message and send it to the IoT Hub every second
        setInterval(function(){
          sensorBME280.readSensorData()
            .then((data) => {   
              sensorCCS811.read_data();
              let sensor_data = sensorCCS811.get_data();
              let combinedData = Object.assign({}, data, sensor_data);
              var JSONdata = JSON.stringify(combinedData);
              var telemetryMessage = new Message(JSONdata);
              console.log("Telemetry sent: " + telemetryMessage.getData());
              //client.sendEvent(telemetryMessage, (data) => console.log(data));
            })
            .catch((err) => {
              console.log(`BME280 read error: ${err}`);
            });
     
          
        }, 1000);
      }
    }
  );

}


