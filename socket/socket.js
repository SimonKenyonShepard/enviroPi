exports = module.exports = function(io,sensorCCS811, sensorBME280){

  io.sockets.on('connection', function (socket) {
    console.log('Socket connection is up');
    socket.on('disconnect',function(){
      console.log('Socket disconnected')
      });

    //read data each second(as the driver mode programmed)
    setInterval(function(){
      bme280.readSensorData()
      .then((data) => {
        // temperature_C, pressure_hPa, and humidity are returned by default.
        // I'll also calculate some unit conversions for display purposes.
        //
        data.temperature_F = BME280.convertCelciusToFahrenheit(data.temperature_C);
        data.pressure_inHg = BME280.convertHectopascalToInchesOfMercury(data.pressure_hPa);
        
        sensorCCS811.read_data();
        //print data in console(true) and a log file(sensor_log.txt)
        sensorCCS811.print_data(true,'sensor_log.txt');
        let sensor_data = sensorCCS811.get_data();
        socket.emit('sensor_data',sensor_data)
        console.log(`data = ${JSON.stringify(data, null, 2)}`);
      })
      .catch((err) => {
        console.log(`BME280 read error: ${err}`);

      });
    },1000)

  })
}


