const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    number: { type: String, required: true, unique: true },
    email: { type: String },
    verified: { type: Boolean, default: false },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }, //62c5383227e1b9046a5e3650
    chain: { type: String },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
