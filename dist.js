'use strict';

var fs = require('fs');
var RaspiCam = require('raspicam');
var moment = require('moment');

var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var bucket = require('./aws.json').bucket; // config file

var path = './tmp/';
var timestamp = moment().format("YYYY-MM-DD@HH:mm");
var name = timestamp + '.jpg';

console.log('#### name ####', name);

var camera = new RaspiCam({
  mode: 'photo',
  output: path + name,
  quality: 100,
  width: 1000,
  height: 700,
  encoding: 'jpg',
  awb: 'auto',
  timeout: 0
});

// camera event handler
camera.on("read", function (err, timestamp, filename) {
  if (err) console.error(err);

  console.log('read event filename: ' + filename);

  if (!filename.match(/~$/)) {
    // ignore non-photo file
    putImage(path, filename).then(function (data) {
      console.log('Upload Succeeded');
      console.log('AWS Response:', data);
      return cleanCapturedImages(path, filename);
    }).then(function () {
      process.exit(0);
    }).catch(function (err) {
      console.error(err);
      process.exit(1);
    });
  }
});

camera.start(); // trigger the camera

function putImage(path, filename) {
  return new Promise(function (resolve, reject) {
    fs.stat(path + filename, function (err, info) {
      // to get file content length
      if (err) console.warn(err);

      var params = {
        Bucket: bucket,
        Key: filename,
        ContentLength: info.size,
        Body: fs.createReadStream(path + filename)
      };

      s3.putObject(params, function (err, data) {
        if (err) {
          console.warn(err);
          reject(err);
        }
        resolve(data);
      });
    });
  });
}

function cleanCapturedImages(dir, filename) {
  return new Promise(function (resolve, reject) {
    fs.readdir(dir, function (err, files) {
      if (err) {
        console.warn(err);
        reject(err);
      }
      files.forEach(function (file) {
        console.log('removing file ' + file);
        fs.unlink(dir + '/' + file);
      });
      resolve();
    });
  });
}
