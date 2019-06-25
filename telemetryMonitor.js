'use strict';
 
const dataClient = require('./dataClient.js');

const telemetryStoreTimeout = 5000;

exports = module.exports = function(sensorCCS811, sensorBME280){

    // Create a message and send it to the IoT Hub every second
    setInterval(function(){
      sensorBME280.readSensorData()
        .then((data) => {   
          sensorCCS811.read_data();
          let sensor_data = sensorCCS811.get_data();
          let combinedData = Object.assign({}, data, sensor_data);
          console.log("Telemetry sent: " + JSON.stringify(combinedData));
          if(combinedData.eCO2 < 5000) {
            dataClient.appendToEndpoint('a74e06387e0a810f68bebd409211c17fc632f4715e9ef40245e60dfaed16ffad', combinedData);
          }

        })
        .catch((err) => {
          console.log(`BME280 read error: ${err}`);
        });
  
      
    }, telemetryStoreTimeout);

}


