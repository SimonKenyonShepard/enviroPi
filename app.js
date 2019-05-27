// BASE SETUP ( require modules)
// ==============================================
  const express = require('express');
  const app = express();

  const server = require('http').createServer(app)
  const io = require('socket.io')(server)
  const port = process.env.PORT || 8080 //app port

  const path = require('path')
  const hbs = require('express-handlebars'); //require hbs - template engine

  const i2c = require('i2c-bus');
  const i2c1 = i2c.openSync(1);  //set ut the i2c 1

  const index_route = require('./routes/index_route.js') //routes

// VIEW ENGINE
// ==============================================
  //set hbs as template engine and default layout as layout.hbs from /views/layouts
  app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');


// app setup
// ==============================================
  app.use(express.static(path.join(__dirname, 'public')));

//Get ccs811 object and make an instance
// ==============================================
  let CCS811 = require('./CCS811.js'),
      sensorCCS811 = new CCS811();

  let BME280 = require('./BME280.js'),
      sensorBME280 = new BME280();


//Set up an exitHandler when the user press CTRL+C or the program finish execution
// ==============================================

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


// routes setup
// ==============================================
    app.use('/',index_route);

// Set up the sensors
// ==============================================


 // Initialize the BME280 sensor
      //
  sensorBME280.init()
    .then((i2c1, sensorCCS811, sensorBME280) => {
      console.log('BME280 initialization succeeded');
      try{
  
        sensorCCS811.check_id()         //check if the sensor is a CCS811
  
        sensorCCS811.check_app_valid()  //check if application is valid
  
        sensorCCS811.start()            //change from boot mode in application mode
  
        sensorCCS811.set_driver_mode(1) //set driver mode to one second(1) or ten seconds(10)
  
        const socket = require('./socket/socket.js')(io,sensorCCS811, sensorBME280) //socket
  
  
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
