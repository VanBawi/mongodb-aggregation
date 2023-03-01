const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
  },
  redeemed: {
    type: Boolean,
    default: false,
  },
  amount: {
    type: Number,
  },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  approved: { type: Boolean, default: false },
  occupiedBy: {
    name: { type: String },
    number: { type: String },
    date: { type: Date },
  },
  redeemedDate: { type: Date },
});

const Voucher = mongoose.model('Voucher', rewardSchema);

module.exports = Voucher;
