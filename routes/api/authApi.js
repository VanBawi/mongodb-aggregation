require('dotenv').config();
const express = require('express');
const User = require('../../configs/models/user');
const Store = require('../../configs/models/retailer');
const Otp = require('../../configs/models/otp');
const { generateOtp, resendOtp } = require('../../configs/function/sms');
const { mt4StoreIds } = require('./helper');

const router = express.Router();
// console.log('mt4StoreIds', mt4StoreIds);
//user login
//@ POST /api/auth/checkUser
router.post('/checkUser', async (req, res) => {
  const { chain, name, number, email, storeId } = req.body;
  console.log('req.body', req.body);

  const foundUser = await User.findOne({ number, verified: true });
  const nonVerifiedUser = await User.findOne({ number, verified: false });
  const max = 9999;
  const min = 1111;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;

  const message = ` Your OTP verification code is: ${otp}.`;
  if (foundUser) {
    if (chain && foundUser.chain !== chain) {
      return res
        .status(400)
        .json({ error: 'Sorry you have already registered in another store.' });
    }
    generateOtp(number, message, otp, res);
    return;
  }

  if (!storeId && ((nonVerifiedUser && !chain) || (nonVerifiedUser && chain))) {
    generateOtp(number, message, otp, res);
    return;
  }

  if (!foundUser && !chain && !nonVerifiedUser) {
    return res
      .status(400)
      .json({ error: 'Please scan the store qr code to register.' });
  }

  if (storeId) {
    const curStoreId = mt4StoreIds[storeId] ? mt4StoreIds[storeId] : storeId;

    try {
      const store = await Store.findOne({ _id: String(curStoreId) });

      if (nonVerifiedUser) {
        await User.findByIdAndDelete(nonVerifiedUser._id);
      }

      const newUser = new User({
        name,
        number,
        storeId: store._id,
        chain: store.chain,
        email,
      });

      newUser
        .save()
        .then(() => {
          console.log('otp sent', otp);

          generateOtp(number, message, otp, res);
        })
        .catch((err2) => {
          console.error('error when saving new user', err2);
          return res.status(400).json({ error: 'Internal Error' });
        });
    } catch (error) {
      return res
        .status(400)
        .json({ error: 'Please scan the correct store qr code to register.' });
    }
    // general users
  } else if (chain && !storeId) {
    const store = await Store.findOne({ name: chain });

    if (!store) {
      return res
        .status(400)
        .json({ error: 'Please scan the store qr code to register.' });
    }

    const newUser = new User({
      name,
      number,
      storeId: store._id,
      chain: store.chain,
      email,
    });

    newUser
      .save()
      .then(() => {
        console.log('otp sent', otp);
        generateOtp(number, message, otp, res);
      })
      .catch((err2) => {
        console.error('error when saving new user', err2);
        return res.status(400).json({ error: 'Internal Error' });
      });
  }
});

//resend the otp
//@ POST /api/auth/resend
router.post('/resend', (req, res) => {
  const { number } = req.body;
  const message = `Your OTP verification code is: `;
  resendOtp(number, message, res);
});

//to verify the otp
router.post('/verifyOtp', async (req, res) => {
  const { number, otp } = req.body;
  console.log(req.body);

  const user = await User.findOne({ number });
  const otpNumber = await Otp.findOne({ number });

  if (!user) {
    return res.status(400).json({ error: 'Sorry, user does not exist.' });
  }

  if (!otpNumber) {
    return res.status(400).json({
      error: 'Sorry, your otp has been expired.',
    });
  }

  if (otpNumber.otp === otp) {
    //otp is correct
    console.log('otp is correct');

    return res.status(200).json({ data: user });
  }
  return res.status(400).json({
    error: 'OTP does not match. Please Try again.',
  });
});

router.post('/getUser', async (req, res) => {
  const { number } = req.body;
  // console.log(req.body);

  const user = await User.findOne({ number, verified: true }).populate(
    'storeId',
    'region wholesaler'
  );

  if (user) {
    return res.status(200).json({ data: user });
  }
  return res.status(400).json({
    error: 'User not found.',
  });
});

router.post('/updateUser', async (req, res) => {
  const { number, email, name } = req.body;
  // console.log(req.body);

  const user = await User.findOne({ number });

  if (user) {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { verified: true, email: email || '', name },
      { new: true }
    );

    return res.status(200).json({ data: updatedUser });
  }
  return res.status(400).json({
    error: 'User not found.',
  });
});

module.exports = router;
