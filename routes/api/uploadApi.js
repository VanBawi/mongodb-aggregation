require('dotenv').config();
const express = require('express');
const moment = require('moment');
const User = require('../../configs/models/user');
const Transaction = require('../../configs/models/transaction');
const Voucher = require('../../configs/models/voucher');
const Store = require('../../configs/models/retailer');
const { uploadtos3 } = require('../../configs/function/aws');
const { makeid } = require('../../configs/function/misc');

const router = express.Router();
// /api/upload/receipt
router.post('/receipt', async (req, res) => {
  const { number, products, invoiceNo, receiptDate, filetype, uri, amount } =
    req.body;

  if (
    !number ||
    !products ||
    !receiptDate ||
    !invoiceNo ||
    !filetype ||
    !amount ||
    !uri
  ) {
    return res.status(400).json({ error: 'Sorry. missing some field.' });
  }

  if (amount < 500) {
    return res.status(400).json({ error: 'Amount must be above RM500.' });
  }

  try {
    const regex = /^data:image\/\w+;base64,/;
    const body = Buffer.from(uri.replace(regex, ''), 'base64');
    const tempId = makeid(6);

    const usr = await User.findOne({ number, verified: true });

    if (usr) {
      const uploads = await Transaction.find({
        'customer.number': number,
        'receipt.status': { $ne: 'Rejected' },
      });

      if (uploads.length >= 2) {
        return res.status(400).json({
          error: 'Sorry. you can only upload a maximum of 2 receipts.',
        });
      }
      //check user invoice have "Approved" before
      const store = await Store.findOne({ _id: usr.storeId });

      if (!store) {
        return res.status(400).json({ error: 'Sorry. store does not exist.' });
      }

      const newIsoDate = receiptDate && new Date(receiptDate).toISOString();
      const newIsoDate2 = receiptDate && moment(receiptDate).add(1, 'days');

      // console.log('receipt date', receiptDate, newIsoDate, newIsoDate2);
      const dubCheckTransaction = await Transaction.findOne({
        storeCode: store._id,
        'receipt.invoiceNo': invoiceNo,
        'receipt.status': { $ne: 'Rejected' },
        $or: [
          {
            'receipt.invoiceNo': new RegExp(invoiceNo, 'i'),
            'receipt.amount': amount,
            'receipt.receiptDate': {
              $gte: newIsoDate,
              $lte: newIsoDate2,
            },
          },
          {
            'receipt1.invoiceNo': new RegExp(invoiceNo, 'i'),
            'receipt1.amount': amount,
            'receipt1.receiptDate': receiptDate,
          },
          {
            'receipt2.invoiceNo': new RegExp(invoiceNo, 'i'),
            'receipt2.amount': amount,
            'receipt2.receiptDate': receiptDate,
          },
          {
            'receipt3.invoiceNo': new RegExp(invoiceNo, 'i'),
            'receipt3.amount': amount,
            'receipt3.receiptDate': receiptDate,
          },
          {
            'receipt4.invoiceNo': new RegExp(invoiceNo, 'i'),
            'receipt4.amount': amount,
            'receipt4.receiptDate': receiptDate,
          },
        ],
      });

      if (dubCheckTransaction) {
        return res.status(400).json({ error: 'Duplicate receipt upload.' });
      }

      const newTransaction = {
        customer: {
          name: usr.name,
          number,
        },

        receipt: {
          invoiceNo: '',
          receiptDate: '',
          amount: '',
          receiptKey:
            process.env.ENVIRONMENT === 'dev'
              ? `sandbox/receipts/${number}/${tempId}`
              : `production/receipts/${number}/${tempId}`,
          status: 'Pending',
        },
        receipt1: {
          invoiceNo,
          amount,
          receiptDate,
        },

        product: products,
      };
      newTransaction.storeCode = store._id;
      newTransaction.storeName = store.name;
      newTransaction.chain = store.chain;

      uploadtos3(
        newTransaction.receipt.receiptKey,
        body,
        'base64',
        filetype,
        (status) => {
          console.log(status);
          if (status === 'failed') {
            console.error('S3 image upload failed.');
            return res.status(400).json({ error: 'Image Upload Failed' });
          }
          Transaction.create(newTransaction, (err, tran) => {
            if (err) {
              console.log(err);
              return res
                .status(400)
                .json({ error: 'Cannot create New Upload.' });
            }
            return res.status(200).json({ data: tran });
          });
        }
      );
    } else {
      return res.status(400).json({ error: 'User Not Found.' });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'Internal error.' });
  }
});

router.post('/getRewards', async (req, res) => {
  const { number } = req.body;
  // console.log(req.body);

  const pendingReceipts = await Transaction.find({
    'customer.number': number,
    $or: [{ 'receipt.status': 'Pending' }, { 'receipt.status': 'Issue' }],
  }).limit(2);

  const rejectedReceipts = await Transaction.find({
    'customer.number': number,
    'receipt.status': 'Rejected',
  }).limit(2);

  const approvedReceipts = await Transaction.find({
    'customer.number': number,
    'receipt.status': 'Approved',
  }).limit(2);

  const pending = !approvedReceipts.length ? pendingReceipts : [];
  const approvedWithPending =
    approvedReceipts.length &&
    approvedReceipts.length === 1 &&
    pendingReceipts.length
      ? [pendingReceipts[0]]
      : [];

  const rejected = !approvedReceipts.length ? rejectedReceipts : [];
  const receiptsWithRejected =
    approvedReceipts.length &&
    approvedReceipts.length === 1 &&
    rejectedReceipts.length
      ? [rejectedReceipts[0]]
      : [];

  const rewards = await Voucher.find({ 'occupiedBy.number': number });

  return res.status(200).json({
    data: rewards,
    pendingReceipts: pending.length ? pending : approvedWithPending,
    rejectedReceipts: rejected.length ? rejected : receiptsWithRejected,
  });
});

router.post('/updateReward', async (req, res) => {
  const { rewardId, number } = req.body;
  // console.log(req.body);
  const user = await User.findOne({ number, verified: true });

  const voucher = await Voucher.findOne({ _id: rewardId });
  if (voucher && voucher.redeemed) {
    const rewards = await Voucher.find({ 'customer.number': number });
    return res.status(200).json({ data: rewards });
  }

  if (!user) {
    return res.status(400).json({ error: 'User does not exist' });
  }
  const reward = await Voucher.findByIdAndUpdate(
    rewardId,
    {
      redeemed: true,
      redeemedDate: new Date(),
    },
    { new: true }
  );
  if (!reward) {
    return res.status(400).json({ error: 'Reward does not exist' });
  }
  const rewards = await Voucher.find({ 'customer.number': number });
  return res.status(200).json({ data: rewards });
});

module.exports = router;
