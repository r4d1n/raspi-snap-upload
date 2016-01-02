'use strict'

const fs = require('fs')
const RaspiCam = require('raspicam')
const moment = require('moment')

const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const bucket = require('./aws.json').bucket; // config file

const path = `/home/pi/camera/`
const timestamp = moment().format()
const name = `${timestamp}.jpg`

console.log('#### timestamp ####', timestamp)

const camera = new RaspiCam({
  mode: 'photo',
  output: path + name,
  quality: 100,
  width: 1000,
  height: 700,
  encoding: 'jpg',
  awb: 'auto',
  timeout: 0
})

// camera event handler
camera.on("read", (err, timestamp, filename) => {
  if (err) console.error(err)

  console.log('took a picture', filename)

  if (!filename.match(/~$/)) { // don't try to upload strange non-photo file
    putImage(path, filename)
    .then((data) => {
      console.log('Successful upload')
      console.log('AWS Data Res:', data)
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
  }
})

camera.start() // trigger the camera

function putImage(path, filename) {
  return new Promise((resolve,reject) => {
    fs.stat(path + filename, (err, info) => { // to get file content length
      if (err) {
        console.warn(err)
        // reject(err)
      }

      let params = {
        Bucket: bucket,
        Key: filename,
        ContentLength: info.size,
        Body: fs.createReadStream(path + filename)
      };

      s3.putObject(params, (err, data) => {
        if (err) {
          console.warn(err)
          reject(err)
        }
        resolve(data)
      })
    })
  })
}
