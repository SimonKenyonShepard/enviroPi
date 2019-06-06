'use strict';
 
const JsonBinClient = require('./JsonBinClient.js');

const telemetryStoreTimeout = 5000;

exports = module.exports = function(sensorCCS811, sensorBME280){

    // Create a message and send it to the IoT Hub every second
    setInterval(function(){
      sensorBME280.readSensorData()
        .then((data) => {   
          sensorCCS811.read_data();
          let sensor_data = sensorCCS811.get_data();
          let combinedData = Object.assign({}, data, sensor_data);
          console.log(data, sensor_data);
          console.log("Telemetry sent: " + JSON.stringify(combinedData));
          JsonBinClient.appendJsonBin('5cf8c37825ffcf4ba635e18d', combinedData);

        })
        .catch((err) => {
          console.log(`BME280 read error: ${err}`);
        });
  
      
    }, telemetryStoreTimeout);

}


