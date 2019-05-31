import { openSync } from 'i2c-bus';
import CCS811 from './CCS811.js';
import BME280 from './BME280.js';
import TelemetryMonitor from './telemetryMonitor.js';

const i2c1 = openSync(1);
let sensorCCS811 = new CCS811(),
    sensorBME280 = new BME280();

function exitHandler(options, err) {
    if (options.cleanup){
        i2c1.closeSync()
        console.log('clean');
    }

    if (err){
      console.log('exit with error')
      i2c1.closeSync()
      console.log(err.stack);
    }
    if (options.exit){
      console.log(' App stoped: now it will reset the sensor and close the i2c ')
      sensorCCS811.reset_sensor()
      i2c1.closeSync()
      process.exit();
    }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catch ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

  sensorBME280.init()
  .then((i2c1, sensorCCS811, sensorBME280) => {
    console.log('BME280 initialization succeeded');
    try{

      sensorCCS811.check_id()         //check if the sensor is a CCS811

      sensorCCS811.check_app_valid()  //check if application is valid

      sensorCCS811.start()            //change from boot mode in application mode

      sensorCCS811.set_driver_mode(1) //set driver mode to one second(1) or ten seconds(10)

      const sensorDataMonitor = new TelemetryMonitor(sensorCCS811, sensorBME280);

    } catch(e){       // catch errors
        i2c1.closeSync() //close the file
        console.log(e.message,e.name)
        return
    }
  })
  .catch((err) => console.error(`BME280 initialization failed: ${err} `));

server.listen(port,function(req){
  console.log('app is up at port ' , port)
});
