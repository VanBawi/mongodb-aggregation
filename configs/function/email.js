require('dotenv').config();
const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');

// initialize nodemailer
const sendEmail = (userEmail, content) => {
  const transporter = nodemailer.createTransport({
    host: 'mail.clickservices.biz',
    port: 465,
    secure: true,
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
    name: 'mail.clickservices.biz',
  });

  // point to the template folder
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve('./configs/email/'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./configs/email/'),
    extname: '.handlebars',
  };

  // use a template file with nodemailer
  transporter.use('compile', hbs(handlebarOptions));

  const mailOptions = {
    from: 'superjackpower85@gmail.com', // sender address
    to: userEmail, // list of receivers
    subject: 'MT5 Allocation Utilization Report',
    template: 'email', // the name of the template file i.e email.handlebars
    context: content,
  };

  // trigger the sending of the E-mail
  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    return console.log(`Message sent: ${info.response}`);
  });
};

module.exports = { sendEmail };
