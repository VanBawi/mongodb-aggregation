const AWS = require('aws-sdk');
require('dotenv').config();

const region = 'ap-southeast-1';
const accessKeyId = process.env.ACCESS_KEYID;
const secretAccessKey = process.env.SECRET_ACCESSKEY;

AWS.config.update({
  accessKeyId,
  secretAccessKey,
  region,
});

const s3 = new AWS.S3();
const uploadtos3 = (key, body, encoding, fileType, callback) => {
  console.log('test');
  const param = {
    Bucket: process.env.BUCKETNAME,
    Key: key,
    Body: body,
    ContentEncoding: encoding,
    ContentType: fileType,
  };
  s3.putObject(param, (err, data) => {
    if (err) {
      console.log('Some error occured during uploading to AWS S3');
      console.log(err);

      console.log('Responding back to client site ...');
      console.log({ error: 'Please try again later' });
      console.log('Responded back to client site');
      callback('failed');
    } else {
      console.log('Uploaded successfully');
      console.log({ data });
      console.log({ success: true });
      console.log(param);
      callback('success');
    }
  });
};

const getSignedUrl = (key, callback) => {
  console.log(key);
  const s3 = new AWS.S3();
  const s3Param = {
    Bucket: process.env.BUCKETNAME,
    Key: key,
    Expires: 7200,
  };
  s3.getSignedUrl('getObject', s3Param, (err, url) => {
    if (err) {
      console.log('Error when get signed url in validations list : ');
      console.log(err);
      callback('failed');
    }
    // let url = 'temp'
    callback('success', url);
  });
};

const checkExpiration = (key, callback) => {
  console.log(key);

  const s3Param = {
    Bucket: process.env.BUCKETNAME,
    Key: key,
    Expires: 7200,
  };
  s3.getSignedUrl('getObject', s3Param, (err, url) => {
    if (err) {
      console.log('Error when get signed url in validations list : ');
      console.log(err);
      callback('failed');
    }
    // let url = 'temp'
    callback('success', url);
  });
};

module.exports = {
  uploadtos3,
  getSignedUrl,
  checkExpiration,
};
