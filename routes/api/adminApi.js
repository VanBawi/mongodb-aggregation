require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const User = require('../../configs/models/user');
const Transaction = require('../../configs/models/transaction');
const Voucher = require('../../configs/models/voucher');
const Store = require('../../configs/models/retailer');

const Bucket = process.env.BUCKETNAME;
dotenv.config();
const router = express.Router();

const pubKey = fs.readFileSync(path.join(__dirname, '.pubKey.pem'), 'utf8');
const signOptions = { expiresIn: '10h', algorithm: 'RS256' };

function getImageUrl(bucket, key) {
  const s3 = new AWS.S3();
  return new Promise((resolve, reject) => {
    const params2 = { Bucket: bucket, Key: key, Expires: 72000 }; // 20 hours
    s3.getSignedUrl('getObject', params2, (error, url) => {
      if (error) {
        resolve('');
        console.log('s3 get error 2', error);
      } else {
        resolve(url);
      }
    });
  });
}

router.post('/dashboardData', async (req, res) => {
  const { token, startDate, endDate, status } = req.body;

  console.log('req.body admin', req.body);

  let stDate = '';
  let edDate = '';
  let queryChain = { region: 'General' };
  let userQuery = { verified: true };
  if (status !== 'All') {
    queryChain = { name: status };
  }
  let tranQuery = { 'receipt.status': 'Approved' };

  if (!startDate && !endDate) {
    stDate = new Date(`2021-08-01`).setHours(0, 0, 0, 0);
    edDate = new Date().setHours(23, 59, 59, 999);
  } else {
    stDate = new Date(startDate).setHours(0, 0, 0, 0);
    edDate = new Date(endDate).setHours(23, 59, 59, 999);
    userQuery = {
      verified: true,
      createdAt: { $gte: stDate, $lte: edDate },
    };
  }
  const allStore = await Store.find(queryChain);

  // console.log('allStore', allStore);

  if (status === 'All') {
    tranQuery = {
      createdAt: { $gte: new Date(stDate), $lte: new Date(edDate) },
      'receipt.status': 'Approved',
    };
  } else if (status !== 'All') {
    tranQuery = {
      createdAt: { $gte: new Date(stDate), $lte: new Date(edDate) },
      'receipt.status': 'Approved',
      chain: status,
    };
    userQuery = { ...userQuery, chain: status };
  }

  const users = await User.find(userQuery).select('chain number');
  const transactions = await Transaction.find({
    'receipt.status': 'Approved',
  }).select('storeCode  customer chain');
  // console.log('users, transactions', users.length);

  jwt.verify(token, pubKey, signOptions, async (err, decoded) => {
    // console.log('decoded', decoded);
    if (pubKey && token) {
      const storeData = {};

      allStore.map(async (store) => {
        const resTotal = users.filter((e) => e.chain === store.chain);

        const activeTransactions = transactions.filter(
          (transaction) => transaction.chain === store.chain
        );
        // console.log('activeTransactions', activeTransactions);
        let counter = 0;
        if (resTotal.length) {
          resTotal.forEach((user) => {
            const exist = activeTransactions.find(
              (tran) => tran.customer.number === user.number
            );

            if (exist) {
              counter += 1;
            }
          });
        }
        // console.log('counter', counter);
        storeData[store._id] = {};
        storeData[store._id]._id = store._id;
        storeData[store._id].storeName = store.name;
        storeData[store._id].outlet = store.outlet;
        storeData[store._id].storeQR = store.qrcode;
        storeData[store._id].category = store.category;
        storeData[store._id].chain = store.chain;
        storeData[store._id].registeredUsers = resTotal.length;
        storeData[store._id].activeUsers = counter;
      });

      const allTransactions = await Transaction.aggregate([
        {
          $match: {
            $and: [tranQuery],
          },
        },
        {
          // group by customer number for data extraction
          $group: {
            _id: '$chain',
            totalSales: { $sum: { $toDouble: '$receipt.amount' } },

            ensure: {
              $sum: '$product.ensure',
            },
            glucerna: {
              $sum: '$product.glucerna',
            },
            isomilPlus: {
              $sum: '$product.isomilPlus',
            },
            pediasureBib: {
              $sum: '$product.pediasureBib',
            },
            pediasureTin: {
              $sum: '$product.pediasureTin',
            },
            pediasure10: {
              $sum: '$product.pediasure10',
            },
            stc3: {
              $sum: '$product.stc3',
            },
            stc4: {
              $sum: '$product.stc4',
            },
            similacGainKidBib: {
              $sum: '$product.similacGainKidBib',
            },
            similacGainKidTin: {
              $sum: '$product.similacGainKidTin',
            },
            similacGainPlusBib: {
              $sum: '$product.similacGainPlusBib',
            },
            similacGainPlusTin: {
              $sum: '$product.similacGainPlusTin',
            },
            similacMom: {
              $sum: '$product.similacMom',
            },
            similacComfort: {
              $sum: '$product.similacComfort',
            },
            tier1: {
              $sum: {
                $cond: {
                  if: {
                    $lte: [{ $toDouble: '$receipt.amount' }, 999],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            tier2: {
              $sum: {
                $cond: {
                  if: {
                    $gte: [{ $toDouble: '$receipt.amount' }, 1000],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },

        {
          $addFields: {
            status: {
              $cond: {
                if: {
                  $gte: ['$totalSales', 1],
                },
                then: 'Active',
                else: 'Inactive',
              },
            },

            chain: '$_id',
            totalSoldUnits: {
              $sum: {
                $add: [
                  '$ensure',
                  '$glucerna',
                  '$isomilPlus',
                  '$pediasureBib',
                  '$pediasureTin',
                  '$pediasure10',
                  '$stc3',
                  '$stc4',
                  '$similacGainKidBib',
                  '$similacGainKidTin',
                  '$similacGainPlusBib',
                  '$similacGainPlusTin',
                  '$similacMom',
                  '$similacComfort',
                ],
              },
            },
          },
        },
      ]);

      const mapData = Object.values(storeData).map((store) => {
        const curStoreTran = allTransactions.find(
          (tran) => String(tran.chain) === String(store.chain)
        );

        let activeUsersPercent = 0;
        // console.log('curStoreTran, curStoreTran', store);
        if (curStoreTran) {
          const times = store.activeUsers * 100;
          activeUsersPercent = store.registeredUsers
            ? times / store.registeredUsers
            : 0;
        }

        // console.log('curStoreTran.totalSales', curStoreTran);

        let data;
        if (curStoreTran) {
          data = {
            ...curStoreTran,
            ...store,
            totalSales: curStoreTran.totalSales.toFixed(2),
            activeUsersPercent: `${Math.round(activeUsersPercent * 100) / 100}`,
          };
        } else {
          data = {
            ...store,
            activeUsersPercent: 0,
            totalSales: 0,
            totalSoldUnits: 0,
            ensure: 0,
            glucerna: 0,
            isomilPlus: 0,
            pediasureBib: 0,
            pediasureTin: 0,
            pediasure10: 0,
            stc3: 0,
            stc4: 0,
            similacGainKidBib: 0,
            similacGainKidTin: 0,
            similacGainPlusBib: 0,
            similacGainPlusTin: 0,
            similacMom: 0,
            similacComfort: 0,
            tier1: 0,
            tier2: 0,
            status: 'Inactive',
            activeUsers: 0,
          };
        }
        return data;
      });

      return res.status(200).json({ data: mapData });
    }

    return res.status(400).json({ error: 'Invalid Credentials' });
  });
});

router.post('/promoterPerformance', async (req, res) => {
  const { token, startDate, endDate, status } = req.body;

  // console.log('req.body admin', req.body);
  let stDate = '';
  let edDate = '';
  let queryChain = {};
  if (status !== 'All') {
    queryChain = { chain: status };
  }
  let userQuery = {};
  let tranQuery = {};
  if (!startDate && !endDate) {
    stDate = new Date(`2022-08-01`).setHours(0, 0, 0, 0);
    edDate = new Date().setHours(23, 59, 59, 999);
  } else {
    stDate = new Date(startDate).setHours(0, 0, 0, 0);
    edDate = new Date(endDate).setHours(23, 59, 59, 999);
    userQuery = { createdAt: { $gte: stDate, $lte: edDate }, verified: true };
  }
  const allStore = await Store.find(queryChain);

  if (status === 'All') {
    tranQuery = {
      createdAt: { $gte: new Date(stDate), $lte: new Date(edDate) },
      'receipt.status': 'Approved',
    };
    userQuery = { createdAt: { $gte: stDate, $lte: edDate }, verified: true };
  } else if (status !== 'All') {
    tranQuery = {
      createdAt: { $gte: new Date(stDate), $lte: new Date(edDate) },
      'receipt.status': 'Approved',
      chain: status,
    };
    userQuery = { ...userQuery, chain: status };
  }

  const users = await User.find(userQuery).select('storeId number chain');

  // console.log('users', users.length);
  const transactions = await Transaction.find({
    'receipt.status': 'Approved',
  }).select('storeCode  customer chain');

  // const stores = await Store.find({});

  // const db = [];
  // users.forEach((transaction) => {
  //   const storeExist = stores.find(
  //     (store) => store._id == String(transaction.storeId)
  //   );
  //   if (!storeExist) {
  //     db.push(transaction);
  //   }
  // });
  // console.log('db', db);

  jwt.verify(token, pubKey, signOptions, async (err, decoded) => {
    // console.log('decoded', decoded);
    if (pubKey && token) {
      const storeData = {};

      allStore.map(async (store) => {
        // console.log('store', store);
        const usersArr = users.filter(
          (user) => String(user.storeId) === String(store._id)
        );

        const activeTransactions = transactions.filter(
          (transaction) => String(transaction.storeCode) === String(store._id)
        );

        let counter = 0;
        if (usersArr.length) {
          usersArr.forEach((user) => {
            const exist = activeTransactions.find(
              (tran) => tran.customer.number === user.number
            );
            if (exist) {
              counter += 1;
            }
          });
        }

        // console.log(activeTransactions.length);
        storeData[store._id] = {};
        storeData[store._id]._id = store._id;
        storeData[store._id].storeName = store.name;
        storeData[store._id].outlet = store.outlet;
        storeData[store._id].region = store.region;
        storeData[store._id].storeQR = store.qrcode;
        storeData[store._id].category = store.category;
        storeData[store._id].registeredUsers = usersArr.length;
        storeData[store._id].activeUsers = counter;
      });

      const allTransactions = await Transaction.aggregate([
        {
          $match: {
            $and: [tranQuery],
          },
        },
        {
          // group by customer number for data extraction
          $group: {
            _id: '$storeCode',
            totalSales: { $sum: { $toDouble: '$receipt.amount' } },
            activeUsers: { $addToSet: '$customer.number' },

            ensure: {
              $sum: '$product.ensure',
            },
            glucerna: {
              $sum: '$product.glucerna',
            },
            isomilPlus: {
              $sum: '$product.isomilPlus',
            },
            pediasureBib: {
              $sum: '$product.pediasureBib',
            },
            pediasureTin: {
              $sum: '$product.pediasureTin',
            },
            pediasure10: {
              $sum: '$product.pediasure10',
            },
            stc3: {
              $sum: '$product.stc3',
            },
            stc4: {
              $sum: '$product.stc4',
            },
            similacGainKidBib: {
              $sum: '$product.similacGainKidBib',
            },
            similacGainKidTin: {
              $sum: '$product.similacGainKidTin',
            },
            similacGainPlusBib: {
              $sum: '$product.similacGainPlusBib',
            },
            similacGainPlusTin: {
              $sum: '$product.similacGainPlusTin',
            },
            similacMom: {
              $sum: '$product.similacMom',
            },
            similacComfort: {
              $sum: '$product.similacComfort',
            },
            tier1: {
              $sum: {
                $cond: {
                  if: {
                    $lte: [{ $toDouble: '$receipt.amount' }, 999],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            tier2: {
              $sum: {
                $cond: {
                  if: {
                    $gte: [{ $toDouble: '$receipt.amount' }, 1000],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },

        {
          $addFields: {
            status: {
              $cond: {
                if: {
                  $gte: ['$totalSales', 1],
                },
                then: 'Active',
                else: 'Inactive',
              },
            },
            totalSoldUnits: {
              $sum: {
                $add: [
                  '$ensure',
                  '$glucerna',
                  '$isomilPlus',
                  '$pediasureBib',
                  '$pediasureTin',
                  '$pediasure10',
                  '$stc3',
                  '$stc4',
                  '$similacGainKidBib',
                  '$similacGainKidTin',
                  '$similacGainPlusBib',
                  '$similacGainPlusTin',
                  '$similacMom',
                  '$similacComfort',
                ],
              },
            },
          },
        },
      ]);

      const mapData = Object.values(storeData).map((store) => {
        const curStoreTran = allTransactions.find(
          (tran) => String(tran._id) === String(store._id)
        );
        let activeUsersPercent = 0;

        if (curStoreTran) {
          const times = store.activeUsers * 100;
          activeUsersPercent = store.registeredUsers
            ? Number(times) / Number(store.registeredUsers)
            : 0;
        }

        // console.log('store', store.activeUsers);

        let data;
        if (curStoreTran) {
          data = {
            ...curStoreTran,
            ...store,
            totalSales: curStoreTran.totalSales.toFixed(2),
            activeUsersPercent: `${Math.round(activeUsersPercent * 100) / 100}`,
          };
        } else {
          data = {
            ...store,
            activeUsersPercent: 0,
            totalSales: 0,
            totalSoldUnits: 0,
            ensure: '-',
            glucerna: '-',
            isomilPlus: '-',
            pediasureBib: '-',
            pediasureTin: '-',
            pediasure10: '-',
            stc3: '-',
            stc4: '-',
            similacGainKidBib: '-',
            similacGainKidTin: '-',
            similacGainPlusBib: '-',
            similacGainPlusTin: '-',
            similacMom: '-',
            similacComfort: '-',
            tier1: 0,
            tier2: 0,
            status: 'Inactive',
            activeUsers: 0,
          };
        }
        return data;
      });

      return res.status(200).json({ data: mapData });
    }

    return res.status(400).json({ error: 'Invalid Credentials' });
  });
});

router.post('/customerPerformance', async (req, res) => {
  const { token, startDate, endDate, status } = req.body;

  console.log('req.body', req.body);

  let stDate = '';
  let edDate = '';
  let stDate1 = '';
  let edDate1 = '';
  let userQuery = { verified: true };

  let tranQuery = {};

  if (!startDate && !endDate) {
    stDate = new Date(`2022-08-01`).setHours(0, 0, 0, 0);
    edDate = new Date().setHours(23, 59, 59, 999);

    stDate1 = new Date(`2022-08-01`).setHours(0, 0, 0, 0);
    edDate1 = new Date().setHours(23, 59, 59, 999);
  } else {
    stDate = new Date(startDate).setHours(0, 0, 0, 0);
    edDate = new Date(endDate).setHours(23, 59, 59, 999);
    stDate1 = new Date(startDate).setHours(0, 0, 0, 0);
    edDate1 = new Date(endDate).setHours(23, 59, 59, 999);
    userQuery = { createdAt: { $gte: stDate, $lte: edDate }, verified: true };
  }

  if (status === 'All') {
    userQuery = { createdAt: { $gte: stDate, $lte: edDate }, verified: true };
    tranQuery = {
      createdAt: { $gte: new Date(stDate1), $lte: new Date(edDate1) },
      'receipt.status': 'Approved',
    };
  } else if (status !== 'All') {
    userQuery = { ...userQuery, chain: status };
    tranQuery = {
      createdAt: { $gte: new Date(stDate1), $lte: new Date(edDate1) },
      'receipt.status': 'Approved',
      chain: status,
    };
  }

  jwt.verify(token, pubKey, signOptions, async (err, decoded) => {
    if (pubKey && token) {
      const users = await User.find(userQuery).populate('storeId');
      // console.log('tranQuery', stDate1, edDate1);

      // const trans = await Transaction.find(tranQuery);
      const allTransactions = await Transaction.aggregate([
        {
          $match: tranQuery,
        },
        {
          // group by customer number for data extraction
          $group: {
            _id: '$customer.number',
            totalSubmittedReceipts: { $sum: 1 },
            totalSales: {
              $sum: {
                $cond: {
                  if: {
                    $eq: ['$receipt.status', 'Approved'],
                  },
                  then: {
                    $toDouble: '$receipt.amount',
                  },
                  else: 0,
                },
              },
            },

            tierOne: {
              $sum: {
                $cond: {
                  if: {
                    $lte: [{ $toDouble: '$receipt.amount' }, 999],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            tierTwo: {
              $sum: {
                $cond: {
                  if: {
                    $gte: [{ $toDouble: '$receipt.amount' }, 1000],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            ensure: {
              $sum: '$product.ensure',
            },
            glucerna: {
              $sum: '$product.glucerna',
            },
            isomilPlus: {
              $sum: '$product.isomilPlus',
            },
            pediasureBib: {
              $sum: '$product.pediasureBib',
            },
            pediasureTin: {
              $sum: '$product.pediasureTin',
            },
            pediasure10: {
              $sum: '$product.pediasure10',
            },
            stc3: {
              $sum: '$product.stc3',
            },
            stc4: {
              $sum: '$product.stc4',
            },
            similacGainKidBib: {
              $sum: '$product.similacGainKidBib',
            },
            similacGainKidTin: {
              $sum: '$product.similacGainKidTin',
            },
            similacGainPlusBib: {
              $sum: '$product.similacGainPlusBib',
            },
            similacGainPlusTin: {
              $sum: '$product.similacGainPlusTin',
            },
            similacMom: {
              $sum: '$product.similacMom',
            },
            similacComfort: {
              $sum: '$product.similacComfort',
            },
          },
        },
        {
          $addFields: {
            status: 'Active',
            totalPurchasedQty: {
              $sum: {
                $add: [
                  '$ensure',
                  '$glucerna',
                  '$isomilPlus',
                  '$pediasureBib',
                  '$pediasureTin',
                  '$pediasure10',
                  '$stc3',
                  '$stc4',
                  '$similacGainKidBib',
                  '$similacGainKidTin',
                  '$similacGainPlusBib',
                  '$similacGainPlusTin',
                  '$similacMom',
                  '$similacComfort',
                ],
              },
            },
          },
        },
      ]);

      // console.log('allTransactions', allTransactions.length);
      const data = users.map((user) => {
        const curCalData = allTransactions.find(
          (transaction) => transaction._id === user.number
        );

        if (curCalData) {
          if (!curCalData.totalSales) {
            console.log('cur', curCalData._id);
          }
          // console.log(curCalData, curCalData);
          return {
            ...curCalData,
            name: user.name,
            number: user.number,
            storeName: user.storeId.name,
            registeredChannel: user.storeId.chain,
            createdAt: moment(user.createdAt).format('DD/MM/YYYY'),
          };
        }
        return {
          name: user.name,
          number: user.number,
          storeName: user.storeId && user.storeId.name,
          registeredChannel: user.storeId && user.storeId.chain,
          createdAt: moment(user.createdAt).format('DD/MM/YYYY'),
          status: 'Inactive',
          totalSubmittedReceipts: '-',
          totalSales: '-',
          totalPurchasedQty: '-',
          ensure: '-',
          glucerna: '-',
          isomilPlus: '-',
          pediasureBib: '-',
          pediasureTin: '-',
          pediasure10: '-',
          stc3: '-',
          stc4: '-',
          similacGainKidBib: '-',
          similacGainKidTin: '-',
          similacGainPlusBib: '-',
          similacGainPlusTin: '-',
          similacMom: '-',
          similacComfort: '-',
          tierOne: '-',
          tierTwo: '-',
        };
      });

      // console.log('data', data);
      res.status(200).json({ data: data });
    } else {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }
  });
});

router.post('/validationList', async (req, res) => {
  const { startDate, endDate, status } = req.body;
  // console.log('req.body', req.body);
  if (!status) {
    console.log('No status is provided');
    return res.status(400).json({ error: 'No status is selected.' });
  }

  let stDate = '';
  let edDate = '';
  let query = {
    'receipt.status': status,
  };

  if (!startDate && !endDate) {
    stDate = new Date('2021-08-01').setHours(0, 0, 0, 0);
    edDate = new Date().setHours(23, 59, 59, 999);
  } else {
    stDate = new Date(startDate).setHours(0, 0, 0, 0);
    edDate = new Date(endDate).setHours(23, 59, 59, 999);
    query = {
      'receipt.status': status,
      createdAt: { $gte: stDate, $lte: edDate },
    };
  }

  const transactions = await Transaction.find(query);
  const stores = await Store.find({});

  const data = transactions.map(async (trans) => {
    // 'sandbox/receipts/0182548020/OM2TM3/receipt'
    let url = '';
    const curStore = stores.find(
      (store) => String(store._id) === String(trans.storeCode)
    );
    if (trans.receipt.receiptKey) {
      if (trans.expired) {
        // check expiration time
        const expiration = new Date(trans.expired) < new Date();
        // console.log('expiration', expiration);
        if (expiration) {
          url = await getImageUrl(Bucket, trans.receipt.receiptKey);

          if (url) {
            // console.log('update the url here');
            await Transaction.findByIdAndUpdate(trans._id, {
              s3url: url,
              expired: moment().add(19, 'hours'),
            });
            // console.log('get url', updatedData);
          }
        } else {
          // console.log('use old url');
          url = trans.s3url;
        }
      } else {
        //
        url = await getImageUrl(Bucket, trans.receipt.receiptKey);

        if (url) {
          // console.log('date');
          await Transaction.findByIdAndUpdate(trans._id, {
            s3url: url,
            expired: moment().add(19, 'hours'),
          });
          // console.log('get url', updatedData);
        }
      }
    }

    const vouchers = await Voucher.find({
      'occupiedBy.number': trans.customer.number,
    });

    let voucherCode = '';
    if (vouchers.length) {
      if (status === 'Approved') {
        voucherCode = vouchers.find(
          (vch) =>
            String(vch.transactionId) == trans._id &&
            vch.occupiedBy.number == trans.customer.number
        );
      }
    }

    const {
      ensure,
      glucerna,
      isomilPlus,
      pediasureBib,
      pediasureTin,
      pediasure10,
      stc3,
      stc4,
      similacGainKidBib,
      similacGainKidTin,
      similacGainPlusBib,
      similacGainPlusTin,
      similacMom,
      similacComfort,
    } = trans.product;

    // console.log('trans.product', trans.product);
    const qtyTotal =
      ensure +
      glucerna +
      isomilPlus +
      pediasureBib +
      pediasureTin +
      pediasure10 +
      stc3 +
      stc4 +
      similacGainKidBib +
      similacGainKidTin +
      similacGainPlusBib +
      similacGainPlusTin +
      similacMom +
      similacComfort;
    const { receipt1, receipt2, receipt3, receipt4 } = trans;
    // console.log('trans', trans);

    const curAmount = `${trans.receipt.amount ? trans.receipt.amount : ''}`;
    const curReceiptNo = `${trans.receipt.invoiceNo} ${receipt1.invoiceNo} ${receipt2.invoiceNo} ${receipt3.invoiceNo} ${receipt4.invoiceNo}`;
    const curReceiptDate = `${
      trans.receipt.receiptDate && trans.receipt.receiptDate !== null
        ? moment(trans.receipt.receiptDate).format('DD/MM/YYYY')
        : ''
    } ${
      receipt1.receiptDate && receipt1.receiptDate !== null
        ? moment(receipt1.receiptDate).format('DD/MM/YYYY')
        : ''
    } ${
      receipt2.receiptDate && receipt2.receiptDate !== null
        ? moment(receipt2.receiptDate).format('DD/MM/YYYY')
        : ''
    } ${
      receipt3.receiptDate && receipt3.receiptDate !== null
        ? moment(receipt3.receiptDate).format('DD/MM/YYYY')
        : ''
    } ${
      receipt4.receiptDate && receipt4.receiptDate !== null
        ? moment(receipt4.receiptDate).format('DD/MM/YYYY')
        : ''
    }`;

    const amount = trans.receipt.amount
      ? Number(trans.receipt.amount)
      : Number(receipt1.amount) +
        Number(receipt2.amount) +
        Number(receipt3.amount) +
        Number(receipt4.amount);

    return {
      id: trans._id,
      name: trans.customer.name,
      number: trans.customer.number,
      storeName: curStore && curStore.outlet,
      storeId: curStore && curStore._id,
      uploadDate: moment(trans.createdAt).format('DD/MM/YYYY'),
      receiptImage: url,
      // product
      ensure: ensure,
      glucerna: glucerna,
      isomilPlus: isomilPlus,
      pediasureBib: pediasureBib,
      pediasureTin: pediasureTin,
      pediasure10: pediasure10,
      stc3: stc3,
      stc4: stc4,
      similacGainKidBib: similacGainKidBib,
      similacGainKidTin: similacGainKidTin,
      similacGainPlusBib: similacGainPlusBib,
      similacGainPlusTin: similacGainPlusTin,
      similacMom: similacMom,
      similacComfort: similacComfort,
      tngAmount: amount < 1000 ? 25 : 60,
      quantity: qtyTotal,
      amount: curAmount,
      receiptNo: curReceiptNo,
      receiptDate: curReceiptDate,
      status: trans.receipt.status,
      reason: trans.receipt.status !== 'Approved' ? trans.reason : '',
      tngCode: voucherCode ? voucherCode.code : '',
      receipt1: receipt1,
      receipt2: receipt2,
      receipt3: receipt3,
      receipt4: receipt4,
    };
  });
  const allData = await Promise.all(data);

  // console.log('allData', allData);
  res.status(200).json({ data: allData });
});

router.post('/validate', async (req, res) => {
  const {
    id,
    number,
    status,
    reason,
    ensure,
    glucerna,
    isomilPlus,
    pediasureBib,
    pediasureTin,
    pediasure10,
    stc3,
    stc4,
    similacGainKidBib,
    similacGainKidTin,
    similacGainPlusBib,
    similacGainPlusTin,
    similacMom,
    similacComfort,
    storeId,
    receipt1,
    receipt2,
    receipt3,
    receipt4,
  } = req.body;

  const amount =
    Number(receipt1.amount) +
    Number(receipt2.amount) +
    Number(receipt3.amount) +
    Number(receipt4.amount);
  // console.log('req.body =======', req.body, amount);
  if (!id) {
    return res.status(400).json({ error: 'Voucher not found.' });
  }

  if (receipt1) {
    let data = 0;
    Object.entries(receipt1).forEach(([key, value]) => {
      if (value) {
        data += 1;
      }
    });

    if (data > 1 && data < 3) {
      if (data) {
        return res.status(400).json({ error: 'Receipt 1 missing value.' });
      }
    }
  }

  if (receipt2) {
    let data = 0;
    Object.entries(receipt2).forEach(([key, value]) => {
      if (value) {
        data += 1;
      }
    });

    if (data > 1 && data < 3) {
      if (data) {
        return res.status(400).json({ error: 'Receipt 2 missing value.' });
      }
    }
  }

  if (receipt3) {
    let data = 0;
    Object.entries(receipt3).forEach(([key, value]) => {
      if (value) {
        data += 1;
      }
    });

    if (data > 1 && data < 3) {
      if (data) {
        return res.status(400).json({ error: 'Receipt 3 missing value.' });
      }
    }
  }

  if (receipt4) {
    let data = 0;
    Object.entries(receipt4).forEach(([key, value]) => {
      if (value) {
        data += 1;
      }
    });

    if (data > 1 && data < 3) {
      if (data) {
        return res.status(400).json({ error: 'Receipt 4 missing value.' });
      }
    }
  }

  if (status === 'Approved' && Number(amount) < 500) {
    return res
      .status(400)
      .json({ error: 'The min receipt amount required is RM500.' });
  }

  const transaction = await Transaction.findOne({ _id: id });

  // get all user transactions

  const reApprove = await Transaction.findOne({
    'customer.number': number,
    'receipt.status': 'Approved',
    _id: id,
  });

  if (reApprove) {
    return res
      .status(400)
      .json({ error: 'You have approved the transaction before.' });
  }

  const transactions = await Transaction.find({
    'customer.number': number,
    'receipt.status': 'Approved',
  });

  const store = await Store.findOne({ _id: storeId }); // get allocation

  if (!store) {
    return res.status(400).json({ error: 'Sorry, Invalid store ID provided.' }); // check with
  }

  const approvedReceipts = await Transaction.find({
    'receipt.status': 'Approved',
    chain: store.chain,
  }).select('storeCode');

  const approvedVouchers = await Voucher.find({
    'occupiedBy.number': number,
  });

  if (transaction) {
    if (status === 'Approved') {
      if (transactions && transactions.length === 2) {
        return res
          .status(400)
          .json({ error: 'Sorry, you have approved 2 receipts already.' }); // check with nicole the wording
      }

      if (approvedVouchers && approvedVouchers.length === 2) {
        return res
          .status(400)
          .json({ error: 'Sorry, this number has 2 vouchers already.' }); // check with nicole the wording
      }

      const amountTran = Number(amount) >= 1000 ? 60 : 25;
      const voucher = await Voucher.findOne({
        amount: amountTran,
        redeemed: false,
        'occupiedBy.number': { $exists: false },
      });

      if (!voucher) {
        return res.status(400).json({ error: 'Voucher used up.' });
      }

      if (receipt1) {
        const rounded1 = Math.round(receipt1.amount * 100) / 100;

        const newIsoDate =
          receipt1.receiptDate && new Date(receipt1.receiptDate).toISOString();
        const newIsoDate2 =
          receipt1.receiptDate && moment(receipt1.receiptDate).add(1, 'days');
        const dupReceipt1 = await Transaction.findOne({
          'receipt.status': 'Approved',
          storeCode: transaction.storeCode,
          $or: [
            {
              'receipt.invoiceNo': new RegExp(receipt1.invoiceNo, 'i'),
              'receipt.amount': rounded1,
              'receipt.receiptDate': {
                $gte: newIsoDate,
                $lte: newIsoDate2,
              },
            },
            {
              'receipt1.invoiceNo': new RegExp(receipt1.invoiceNo, 'i'),
              'receipt1.amount': rounded1,
              'receipt1.receiptDate': receipt1.receiptDate,
            },
            {
              'receipt2.invoiceNo': new RegExp(receipt1.invoiceNo, 'i'),
              'receipt2.amount': rounded1,
              'receipt2.receiptDate': receipt1.receiptDate,
            },
            {
              'receipt3.invoiceNo': new RegExp(receipt1.invoiceNo, 'i'),
              'receipt3.amount': rounded1,
              'receipt3.receiptDate': receipt1.receiptDate,
            },
            {
              'receipt4.invoiceNo': new RegExp(receipt1.invoiceNo, 'i'),
              'receipt4.amount': rounded1,
              'receipt4.receiptDate': receipt1.receiptDate,
            },
          ],
        });
        if (dupReceipt1) {
          return res.status(400).json({ error: 'Receipt 1 is duplicated' });
        }
      }
      if (receipt2) {
        const rounded2 = Math.round(receipt2.amount * 100) / 100;
        const newIsoDate =
          receipt2.receiptDate && new Date(receipt2.receiptDate).toISOString();
        const newIsoDate2 =
          receipt2.receiptDate && moment(receipt2.receiptDate).add(1, 'days');
        const dupReceipt2 = await Transaction.findOne({
          'receipt.status': 'Approved',
          storeCode: transaction.storeCode,
          $or: [
            {
              'receipt.invoiceNo': new RegExp(receipt2.invoiceNo, 'i'),
              'receipt.amount': rounded2,
              'receipt.receiptDate': {
                $gte: newIsoDate,
                $lte: newIsoDate2,
              },
            },
            {
              'receipt1.invoiceNo': new RegExp(receipt2.invoiceNo, 'i'),
              'receipt1.amount': rounded2,
              'receipt1.receiptDate': receipt2.receiptDate,
            },
            {
              'receipt2.invoiceNo': new RegExp(receipt2.invoiceNo, 'i'),
              'receipt2.amount': rounded2,
              'receipt2.receiptDate': receipt2.receiptDate,
            },
            {
              'receipt3.invoiceNo': new RegExp(receipt2.invoiceNo, 'i'),
              'receipt3.amount': rounded2,
              'receipt3.receiptDate': receipt2.receiptDate,
            },
            {
              'receipt4.invoiceNo': new RegExp(receipt2.invoiceNo, 'i'),
              'receipt4.amount': rounded2,
              'receipt4.receiptDate': receipt2.receiptDate,
            },
          ],
        });
        if (dupReceipt2) {
          return res.status(400).json({ error: 'Receipt 2 is duplicated' });
        }
      }
      if (receipt3) {
        const rounded3 = Math.round(receipt3.amount * 100) / 100;
        const newIsoDate =
          receipt3.receiptDate && new Date(receipt3.receiptDate).toISOString();
        const newIsoDate2 =
          receipt3.receiptDate && moment(receipt3.receiptDate).add(1, 'days');
        const dupReceipt3 = await Transaction.findOne({
          'receipt.status': 'Approved',
          storeCode: transaction.storeCode,

          $or: [
            {
              'receipt.invoiceNo': new RegExp(receipt3.invoiceNo, 'i'),
              'receipt.amount': rounded3,
              'receipt.receiptDate': {
                $gte: newIsoDate,
                $lte: newIsoDate2,
              },
            },
            {
              'receipt1.invoiceNo': new RegExp(receipt3.invoiceNo, 'i'),
              'receipt1.amount': rounded3,
              'receipt1.receiptDate': receipt3.receiptDate,
            },
            {
              'receipt2.invoiceNo': new RegExp(receipt3.invoiceNo, 'i'),
              'receipt2.amount': rounded3,
              'receipt2.receiptDate': receipt3.receiptDate,
            },
            {
              'receipt3.invoiceNo': new RegExp(receipt3.invoiceNo, 'i'),
              'receipt3.amount': rounded3,
              'receipt3.receiptDate': receipt3.receiptDate,
            },
            {
              'receipt4.invoiceNo': new RegExp(receipt3.invoiceNo, 'i'),
              'receipt4.amount': rounded3,
              'receipt4.receiptDate': receipt3.receiptDate,
            },
          ],
        });
        if (dupReceipt3) {
          return res.status(400).json({ error: 'Receipt 3 is duplicated' });
        }
      }
      if (receipt4) {
        const rounded4 = Math.round(receipt4.amount * 100) / 100;
        const newIsoDate =
          receipt4.receiptDate && new Date(receipt3.receiptDate).toISOString();
        const newIsoDate2 =
          receipt4.receiptDate && moment(receipt3.receiptDate).add(1, 'days');
        const dupReceipt4 = await Transaction.findOne({
          'receipt.status': 'Approved',
          storeCode: transaction.storeCode,
          $or: [
            {
              'receipt.invoiceNo': new RegExp(receipt4.invoiceNo, 'i'),
              'receipt.amount': rounded4,
              'receipt.receiptDate': {
                $gte: newIsoDate,
                $lte: newIsoDate2,
              },
            },
            {
              'receipt1.invoiceNo': new RegExp(receipt4.invoiceNo, 'i'),
              'receipt1.amount': rounded4,
              'receipt1.receiptDate': receipt4.receiptDate,
            },
            {
              'receipt2.invoiceNo': new RegExp(receipt4.invoiceNo, 'i'),
              'receipt2.amount': rounded4,
              'receipt2.receiptDate': receipt4.receiptDate,
            },
            {
              'receipt3.invoiceNo': new RegExp(receipt4.invoiceNo, 'i'),
              'receipt3.amount': rounded4,
              'receipt3.receiptDate': receipt4.receiptDate,
            },
            {
              'receipt4.invoiceNo': new RegExp(receipt4.invoiceNo, 'i'),
              'receipt4.amount': rounded4,
              'receipt4.receiptDate': receipt4.receiptDate,
            },
          ],
        });
        if (dupReceipt4) {
          return res.status(400).json({ error: 'Receipt 4 is duplicated' });
        }
      }

      if (status === 'Approved' && Number(amount) < 500) {
        return res
          .status(400)
          .json({ error: 'The min receipt amount required is RM500.' });
      }

      // approve receipt

      // console.log('approvedReceipts', approvedReceipts);

      //  store.allocation = 20, approved 5 receipts
      if (approvedReceipts.length < 2500) {
        transaction.reason = '';
        // product
        transaction.product.ensure = ensure || 0;
        transaction.product.glucerna = glucerna || 0;
        transaction.product.isomilPlus = isomilPlus || 0;
        transaction.product.pediasureBib = pediasureBib || 0;
        transaction.product.pediasureTin = pediasureTin || 0;
        transaction.product.pediasure10 = pediasure10 || 0;
        transaction.product.stc3 = stc3 || 0;
        transaction.product.stc4 = stc4 || 0;
        transaction.product.similacGainKidBib = similacGainKidBib || 0;
        transaction.product.similacGainKidTin = similacGainKidTin || 0;
        transaction.product.similacGainPlusBib = similacGainPlusBib || 0;
        transaction.product.similacGainPlusTin = similacGainPlusTin || 0;
        transaction.product.similacMom = similacMom || 0;
        transaction.product.similacComfort = similacComfort || 0;
        // receipt
        transaction.receipt.amount = amount;
        transaction.receipt.invoiceNo = '';
        transaction.receipt.receiptDate = '';
        // 'receiptDate'
        //   ? moment(receiptDate)
        //   : transaction.receipt.receiptDate;
        transaction.receipt.status = 'Approved';
        transaction.assigned = true;

        transaction.receipt1 = {
          invoiceNo: (receipt1 && receipt1.invoiceNo) || '',
          amount: (receipt1 && receipt1.amount) || '',
          receiptDate: (receipt1 && receipt1.receiptDate) || '',
        };
        transaction.receipt2 = {
          invoiceNo: (receipt2 && receipt2.invoiceNo) || '',
          amount: (receipt2 && receipt2.amount) || '',
          receiptDate: (receipt2 && receipt2.receiptDate) || '',
        };
        transaction.receipt3 = {
          invoiceNo: (receipt3 && receipt3.invoiceNo) || '',
          amount: (receipt3 && receipt3.amount) || '',
          receiptDate: (receipt3 && receipt3.receiptDate) || '',
        };
        transaction.receipt4 = {
          invoiceNo: (receipt4 && receipt4.invoiceNo) || '',
          amount: (receipt4 && receipt4.amount) || '',
          receiptDate: (receipt4 && receipt4.receiptDate) || '',
        };

        // console.log('voucher', voucher);

        transaction.save().then((result) => {
          // console.log('transaction', transaction);
          voucher.approved = true;
          voucher.transactionId = transaction._id;
          voucher.occupiedBy.name = transaction.customer.name;
          voucher.occupiedBy.number = transaction.customer.number;
          voucher.occupiedBy.date = new Date();
          voucher
            .save()
            .then((savedVoucher) => {
              // send sms to user
              console.log('savedVoucher', savedVoucher);

              res.status(200).json({ data: transaction });
            })
            .catch((err) => {
              console.log('error send =============', err);
              return res.status(400).json({ error: err });
            });
        });
      } else {
        return res.status(400).json({
          error:
            'The allocation for this store has been used up, please reject or top up the allocation for this store.',
        });
      }
    } else if (status === 'Rejected') {
      if (!reason) {
        return res.status(400).json({ error: 'Please select a reason.' });
      }
      // reject the receipt
      transaction.receipt.status = status;
      transaction.reason = reason;

      transaction.receipt.amount = amount;
      // transaction.receipt.invoiceNo = receiptNo;
      // transaction.receipt.receiptDate = receiptDate
      //   ? moment(receiptDate)
      //   : transaction.receipt.receiptDate;

      transaction.receipt1 = {
        invoiceNo: (receipt1 && receipt1.invoiceNo) || '',
        amount: (receipt1 && receipt1.amount) || '',
        receiptDate: (receipt1 && receipt1.receiptDate) || '',
      };
      transaction.receipt2 = {
        invoiceNo: (receipt2 && receipt2.invoiceNo) || '',
        amount: (receipt2 && receipt2.amount) || '',
        receiptDate: (receipt2 && receipt2.receiptDate) || '',
      };
      transaction.receipt3 = {
        invoiceNo: (receipt3 && receipt3.invoiceNo) || '',
        amount: (receipt3 && receipt3.amount) || '',
        receiptDate: (receipt3 && receipt3.receiptDate) || '',
      };
      transaction.receipt4 = {
        invoiceNo: (receipt4 && receipt4.invoiceNo) || '',
        amount: (receipt4 && receipt4.amount) || '',
        receiptDate: (receipt4 && receipt4.receiptDate) || '',
      };
      // console.log('transaction', transaction);
      transaction.save().then(
        (result) => res.status(200).json({ data: transaction })
        // send sms to user
      );
    } else if (status === 'Issue') {
      transaction.receipt.status = 'Issue';
      transaction
        .save()
        .then((result) => res.status(200).json({ data: transaction }));
    }
  } else {
    return res.status(400).json({ error: 'Sorry, server error' });
  }
});

router.post('/summaryVouchers', async (req, res) => {
  const vouchers25 = await Voucher.find({ amount: 25 });
  const vouchers60 = await Voucher.find({ amount: 60 });

  const totalVouchers = vouchers25.length;
  const usedVouchers = vouchers25.filter((vch) => vch.redeemed).length;
  const remainingVouchers = vouchers25.filter(
    (vch) => !vch.occupiedBy.number
  ).length;
  const entitledVouchers = vouchers25.filter((vch) => vch.approved).length;

  const totalVouchers60 = vouchers60.length;
  const usedVouchers60 = vouchers60.filter((vch) => vch.redeemed).length;
  const remainingVouchers60 = vouchers60.filter(
    (vch) => !vch.occupiedBy.number
  ).length;
  const entitledVouchers60 = vouchers60.filter((vch) => vch.approved).length;

  const data25 = {
    amount: 'RM25',
    totalVouchers,
    usedVouchers,
    remainingVouchers,
    entitledVouchers,
  };
  const data60 = {
    amount: 'RM60',
    totalVouchers: totalVouchers60,
    usedVouchers: usedVouchers60,
    remainingVouchers: remainingVouchers60,
    entitledVouchers: entitledVouchers60,
  };

  return res.status(200).json({ data: [data25, data60] });
});

router.post('/summaryBarData', async (req, res) => {
  const vouchers60 = await Voucher.find({ amount: 60 });

  const totalVouchers60 = vouchers60.length;
  const usedVouchers60 = vouchers60.filter((vch) => vch.redeemed).length;
  const remainingVouchers60 = vouchers60.filter(
    (vch) => !vch.occupiedBy.number
  ).length;
  const entitledVouchers60 = vouchers60.filter((vch) => vch.approved).length;

  const data60 = {
    amount: 60,
    totalVouchers: totalVouchers60,
    usedVouchers: usedVouchers60,
    remainingVouchers: remainingVouchers60,
    entitledVouchers: entitledVouchers60,
  };

  return res.status(200).json({ data: [data60] });
});

router.post('/skuList', async (req, res) => {
  const vouchers60 = await Voucher.find({ amount: 60 });

  const totalVouchers60 = vouchers60.length;
  const usedVouchers60 = vouchers60.filter((vch) => vch.redeemed).length;
  const remainingVouchers60 = vouchers60.filter(
    (vch) => !vch.occupiedBy.number
  ).length;
  const entitledVouchers60 = vouchers60.filter((vch) => vch.approved).length;

  const data60 = {
    amount: 60,
    totalVouchers: totalVouchers60,
    usedVouchers: usedVouchers60,
    remainingVouchers: remainingVouchers60,
    entitledVouchers: entitledVouchers60,
  };

  return res.status(200).json({ data: [data60] });
});

module.exports = router;
