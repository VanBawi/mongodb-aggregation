require('dotenv').config();
const express = require('express');
const Store = require('../../configs/models/retailer');

const router = express.Router();

router.post('/getUserStore', async (req, res) => {
  const { storeId } = req.body;
  // console.log('store id', storeId);
  const store = await Store.findById(storeId);

  if (!store) {
    return res.status(400).json({ error: 'Store does not exist.' });
  }

  return res.status(200).json({ data: store });
});

router.post('/updateStore', async (req, res) => {
  const stores = await Store.find();
  stores.forEach(async (each) => {
    await Store.findByIdAndUpdate(each._id, { allocation: 0 });
  });

  return res.status(200).json({ data: stores });
});

router.post('/getStoreById', async (req, res) => {
  const { storeId } = req.body;

  await Store.findOne({ _id: storeId });

  return res.status(400).json({ error: 'Store does not exist.' });
});

module.exports = router;
