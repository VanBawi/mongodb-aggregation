require('dotenv').config();
const fetch = require('node-fetch');
const Otp = require('../models/otp');

const sendOtp = (number, message, callback) => {
  callback('');
  //console.log(message);
  // callback()
};

const generateOtp = (number, message, otp, res) => {
  // console.log(message);
  Otp.findOne({ number })
    .then((foundOtp) => {
      if (!foundOtp) {
        // otp expired or never exist, create new otp
        const newOtp = new Otp({
          number,
          otp,
        });

        newOtp
          .save()
          .then(() =>
            sendOtp(number, message, () =>
              res.status(200).json({ identity: 'login', number })
            )
          )
          .catch((err) => {
            console.error('Error when saving new otp');
            console.error(err);
            return res.status(400).json({ error: 'Internal Error' });
          });
      } else {
        // update otp
        console.log(foundOtp);
        foundOtp.otp = otp;
        foundOtp.createdAt = Date.now();
        foundOtp
          .save()
          .then(() =>
            sendOtp(number, message, () =>
              res.status(200).json({ identity: 'login', number })
            )
          )
          .catch((err) => {
            console.error('Error when updating otp');
            console.error(err);
            return res.status(400).json({ error: 'Internal Error' });
          });
      }
    })
    .catch((err) => {
      console.error('Error when finding otp : ', number);
      console.error(err);
      return res.status(400).json({ error: 'Internal Error' });
    });
};

const resendOtp = (number, message, res) => {
  const max = 9999;
  const min = 1111;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  Otp.findOne({ number })
    .then((foundOtp) => {
      if (!foundOtp) {
        const newOtp = new Otp({
          number,
          otp,
        });

        message += otp;

        newOtp
          .save()
          .then(() =>
            sendOtp(number, message, () =>
              res.status(200).json({ status: 'Ok', number })
            )
          )
          .catch((err) => {
            console.error(
              'Error when saving new otp when resend otp : \n',
              err
            );
            return res.status(400).json({ error: 'Internal Error' });
          });
      } else {
        message += foundOtp.otp;
        sendOtp(foundOtp.number, message, () =>
          res.status(200).json({ status: 'Success', number })
        );
      }
    })
    .catch((err) => {
      console.error('Error when finding otp when resend otp : \n', err);
      return res.status(400).json({ error: 'Internal Error' });
    });
};

module.exports = {
  generateOtp,
  sendOtp,
  resendOtp,
};
