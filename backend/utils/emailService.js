const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // Gmail from .env
    pass: process.env.EMAIL_PASSWORD   // App password from .env
  }
});

// Function to send notification email
const sendNotificationEmail = async (contactData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: `New Message from ${contactData.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Message:</strong></p>
        <p>${contactData.message}</p>
        <br>
        <p>Received at: ${new Date().toLocaleString()}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email notification sent successfully!');
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

module.exports = { sendNotificationEmail };
