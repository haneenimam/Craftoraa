const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }

  try {
    // Same Gmail account as the password-reset emails
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Gmail only sends "from" the signed-in account, so the visitor goes in replyTo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      replyTo: `"${name}" <${email}>`,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      text: `From: ${name}\nEmail: ${email}\n\n${message}`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent:', info.messageId);

    res.status(200).json({ message: 'Message sent successfully.' });

  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});


module.exports = router;
