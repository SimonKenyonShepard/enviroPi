let i2c = require('i2c-bus'),
    i2c1 = i2c.openSync(1);

let SLAVE = 0x5b,
    RESET_REG = 0xFF,
    RESET_VALUES = [0x11,0xE5,0x72,0x8A];


// Reset sensor_data
/////////////////////////////
let reset_sensor = () => {
  console.log('trying to reset')
  let reset_buffer = Buffer.from(RESET_VALUES,0,4)
  i2c1.writeI2cBlockSync(SLAVE,RESET_REG,4,reset_buffer)
}

reset_sensor()
