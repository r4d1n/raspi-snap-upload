# raspi-snap-upload
Take a picture with a Raspberry Pi + USB webcam and upload it to S3

Must have `fswebcam` installed (use apt-get) https://www.raspberrypi.org/documentation/usage/webcams/

Must make local version of the config.json file and tmp directory. They are left out of the repo.

example config:
```
{
  "bucket": "your-bucket",
  "height": "1080",
  "width": "1920",
  "tmpDir": "tmp",
  "s3DirPrefix": "images"
}
```
