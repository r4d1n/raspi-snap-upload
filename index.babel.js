'use strict'

const RaspiCam = require('raspicam')
const moment = require('moment')

const timestamp = moment().format()
const path = `/home/pi/camera/${timestamp}`

console.log('#### timestamp ####', timestamp)

const camera = new RaspiCam({
  mode: 'photo',
  output: path
})


camera.on("read", (err, timestamp, filename) => {
    if (err) console.error(err)
    console.log('took a picture')
    console.log('callback timestamp and filename', timestamp, filename)
});
