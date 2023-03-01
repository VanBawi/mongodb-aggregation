const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
    trim: true,
  },
  number: {
    type: String,
    required: true,
  },
  expired: {
    type: Date,
    expires: 600,
    default: Date.now,
  },
});

const OTP = mongoose.model('OTP', OTPSchema);
module.exports = OTP;
