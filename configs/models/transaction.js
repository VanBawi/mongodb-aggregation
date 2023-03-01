const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    customer: {
      number: { type: String, required: true },
      name: { type: String, required: true },
    },
    storeCode: { type: String },
    storeName: { type: String },
    chain: { type: String },
    receipt: {
      invoiceNo: { type: String },
      receiptKey: { type: String }, // receipt image
      amount: { type: String },
      receiptDate: { type: Date },
      status: { type: String },
    },
    product: {
      ensure: { type: Number, default: 0 },
      glucerna: { type: Number, default: 0 },
      isomilPlus: { type: Number, default: 0 },
      pediasureBib: { type: Number, default: 0 },
      pediasureTin: { type: Number, default: 0 },
      pediasure10: { type: Number, default: 0 },
      stc3: { type: Number, default: 0 },
      stc4: { type: Number, default: 0 },
      similacGainKidBib: { type: Number, default: 0 },
      similacGainKidTin: { type: Number, default: 0 },
      similacGainPlusBib: { type: Number, default: 0 },
      similacGainPlusTin: { type: Number, default: 0 },
      similacMom: { type: Number, default: 0 },
      similacComfort: { type: Number, default: 0 },
    },
    purchasedChannel: { type: String },
    allocation: { type: Number, default: 1 },
    tier: { type: Number, default: 0 },
    reason: { type: String },
    assigned: { type: Boolean, default: false },
    s3url: { type: String },
    expired: { type: Date },
    receipt1: {
      invoiceNo: { type: String, default: '' },
      amount: { type: String, default: '' },
      receiptDate: { type: String, default: '' },
    },
    receipt2: {
      invoiceNo: { type: String, default: '' },
      amount: { type: String, default: '' },
      receiptDate: { type: String, default: '' },
    },
    receipt3: {
      invoiceNo: { type: String, default: '' },
      amount: { type: String, default: '' },
      receiptDate: { type: String, default: '' },
    },
    receipt4: {
      invoiceNo: { type: String, default: '' },
      amount: { type: String, default: '' },
      receiptDate: { type: String, default: '' },
    },
  },

  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
