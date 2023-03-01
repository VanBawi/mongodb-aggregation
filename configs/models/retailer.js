const mongoose = require('mongoose');

const retailerSchema = new mongoose.Schema({
  name: { type: String },
  outlet: { type: String },
  region: { type: String },
  category: { type: String },
  //
  chain: { type: String },
  qrcode: { type: String },
  allocation: {
    type: Number,
  },
});

const Store = mongoose.model('Store', retailerSchema);

module.exports = Store;
