require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');
const cors = require('cors');

//init app
const app = express();

//connect to mongodb
const options = {
  user: process.env.DBUSER,
  pass: process.env.PASS,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  autoIndex: false, // Don't build indexes
};

mongoose.connect(process.env.DATABASE, options, (err) => {
  if (err) throw err;
  console.log('Successfully connected to MongoDB');
  console.log(mongoose.connection.host, mongoose.connection.port);
});

//middlewares
//helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
//body parser
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: false, limit: '12mb' }));
app.use(cors());

//routes
app.use('/api/auth', require('./routes/api/authApi'));
app.use('/api/upload', require('./routes/api/uploadApi'));
app.use('/api/admin', require('./routes/api/adminApi'));
app.use('/api/store', require('./routes/api/storeApi'));

app.use('/', express.static(path.join(__dirname, 'client', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

//listen to port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
