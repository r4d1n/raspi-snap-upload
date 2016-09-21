'use strict'

const fs = require('fs')
const exec = require('child_process').exec

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

const config = JSON.parse(fs.readFileSync(`${__dirname}/config.json`))

const bucket = config.bucket
const height = config.height
const width = config.width
const tmpDir = `${__dirname}/${config.tmpDir}`

const timestamp = new Date().getTime()
const name = `${timestamp}.jpg`

function upload(directory, filename) {
  return new Promise((resolve,reject) => {
    fs.stat(`${directory}/${filename}`, (err, info) => { // to get file content length
      if (err) console.warn(err)

      let params = {
        Bucket: bucket,
        Key: `${config.s3Prefix}/${filename}`,
        ContentLength: info.size,
        Body: fs.createReadStream(`${directory}/${filename}`)
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

function cleanup(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.warn(err)
        reject(err)
      }
      files.forEach((file) => {
        console.log(`removing file ${file}`)
        fs.unlink(`${dir}/${file}`)
      })
      resolve()
    })
  })
}

// run it
console.log(`#### making a new exposure #### ${name}`)

exec(`fswebcam -r ${config.width}x${config.height} --no-banner ${tmpDir}/${name}`, (err, stdout, stderr) => {
  if (err) {
    console.error(err)
    return
  }

  upload(tmpDir, name)
  .then((data) => {
    console.log('Upload Succeeded')
    console.log('AWS Response:', data)
    return cleanup(tmpDir)
  })
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.warn(err)
    process.exit(1)
  })
})
