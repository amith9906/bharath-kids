const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const verifyEmailConfig = async () => {
  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.verify();
      console.log('Email configuration verified successfully.');
    } else {
      console.log('Email configuration not set. Skipping verification.');
    }
  } catch (error) {
    console.error('Email configuration error:', error.message);
  }
};

module.exports = { transporter, verifyEmailConfig };
