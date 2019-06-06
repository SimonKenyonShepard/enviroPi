
const fs = require('fs') // require fs in order to print data in a log file

let i2c = require('i2c-bus'),
    i2c1 = i2c.openSync(1);

function CCS811(){
  //set sensor address and registers
  this.SLAVE_ADDR = 0x5b;
  this.STATUS_REG = 0x00;
  this.MEAS_MODE_REG = 0x01;
  this.ALG_RESULT_DATA = 0x02;
  this.HW_ID_REG = 0x20;
  this.APP_START_REG = 0XF4;
  this.RESET_REG = 0XFF;
  this.RESET_VALUES = [0x11,0xE5,0x72,0x8A];

  //set the variables for reading the data
  this.sensor_data_buff = new Buffer(8);
  this.eCO2 = '';
  this.TVOC = '';
  this.status = '';

  //error object for sensor exceptions
  this.sensor_exception = function(message) {
     this.message = message;
     this.name = 'Sensor Exception';
  }

  //print eCO2  TVOC and time in console and a log file
  this.print_data = function(console_print,log_file){
    let header = '========================\n';
    let time = 'Time:'+ Math.floor(Date.now() / 1000) + '\n';
    let eCO2 = 'eCO2: ' + this.eCO2 + '\n';
    let TVOC = 'TVOC: ' + this.TVOC + '\n';
    let status = 'status: ' + this.status + '\n';
    let text = header + time + eCO2 + TVOC + status

    if(console_print == true) console.log(text)

    if(log_file != undefined) fs.appendFileSync(log_file, text)

  };

  //return eCO2 TVOC and time
  this.get_data = function(){
    let time = Math.floor(Date.now() / 1000),
        eCO2 = this.eCO2,
        TVOC = this.TVOC,
        data = {time,eCO2,TVOC}
    return data;
  }

  //return eCO2
  this.get_eCO2 = function(){
    return this.eCO2;
  };

  //return TVOC
  this.get_TVOC = function(){
    return this.TVOC;
  };

  //return status
  this.get_status = function(){
    return this.status;
  };

  //check if the sensor id is the 0x81
  this.check_id = function(){
    i2c1.sendByteSync(this.SLAVE_ADDR, this.HW_ID_REG);

    let hw_id = i2c1.receiveByteSync(this.SLAVE_ADDR);
    if(!(hw_id == 0x81)) throw new this.sensor_exception('Invalid sensor id(is not a CCS811):');
    else console.log('Sensor is a CCS811')
  };

  //get sensor status
  this.get_status = function(){
    i2c1.sendByteSync(this.SLAVE_ADDR, this.STATUS_REG);
    let status = i2c1.receiveByteSync(this.SLAVE_ADDR);
    return status;
  };

  this.check_app_valid = function(){
    if(!(this.get_status() == 0x10)) throw new this.sensor_exception('App not valid');
    else console.log('App is valid')
  };

  //set sensor in aplication mode
  this.start = function(){
    i2c1.sendByteSync(this.SLAVE_ADDR, this.APP_START_REG);
    if(!(this.get_status() == 0x90 )) throw new this.sensor_exception('Sensor could not start');
    else console.log('Sensor is in application mode and ready to take ADC measurements')
  };

  //set driver mode
  this.set_driver_mode = function(sec){
      switch (sec) {
        case 1:
          console.log('setting driver mode to one second')
          i2c1.writeByteSync(this.SLAVE_ADDR, this.MEAS_MODE_REG, 0x10)
          break;

        case 10:
          console.log('setting driver mode to 10 second')
          i2c1.writeByteSync(this.SLAVE_ADDR, this.MEAS_MODE_REG, 0x11)
          break;

        default: console.log('failed to set a valid driver mode')
                 throw new this.sensor_exception('Invalid driver mode timing(select one or ten seconds)');
      }
  };

  this.read_data = function(){
      while(!(this.get_status() & 0x8)) // wait for data in ALG RESULT DATA (wait the register to be at 0x98 instead of 0x90)
      i2c1.sendByteSync(this.SLAVE_ADDR, this.ALG_RESULT_DATA)
      i2c1.readI2cBlockSync(this.SLAVE_ADDR, this.ALG_RESULT_DATA, 5, this.sensor_data_buff)

      this.eCO2 = this.sensor_data_buff[0] << 8 | this.sensor_data_buff[1]
      this.TVOC = this.sensor_data_buff[2] << 8 | this.sensor_data_buff[3]
      this.status = this.sensor_data_buff[4];
      return this.sensor_data_buff;
  };

  // reset sensor to boot mode
  this.reset_sensor = function(){
    let reset_buffer = Buffer.from(this.RESET_VALUES,0,4)
    i2c1.writeI2cBlockSync(this.SLAVE_ADDR,this.RESET_REG,4,reset_buffer)
  };

};

module.exports = CCS811
