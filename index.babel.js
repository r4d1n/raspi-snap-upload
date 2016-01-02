'use strict'

const RaspiCam = require('raspicam')
const moment = require('moment')

const timestamp = moment().format()
const path = `/home/pi/camera/${timestamp}`

console.log('#### timestamp ####', timestamp)

const camera = new RaspiCam({
  mode: 'photo',
  output: path,
  quality: 100,
  width: 1000,
  height: 700,
  timeout: 2000,
  encoding: 'jpg',
  awb: 'auto'
})

camera.on("read", (err, timestamp, filename) => {
  if (err) console.error(err)
  console.log('callback timestamp and filename', timestamp, filename)
  console.log('took a picture')
  process.exit(0)
})

camera.on("started", () => {
  console.log('camera start', moment().format())
})

camera.on("exited", () => {
  console.log('camera exit', moment().format())
})

camera.start()
