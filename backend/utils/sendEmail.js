import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create a transporter using Gmail.
  // The user needs to set EMAIL_USER and EMAIL_PASS in their .env
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'renishs.22msc@kongu.edu',
      pass: process.env.EMAIL_PASS, // User must provide an app password
    },
  });

  const mailOptions = {
    from: `PingChat <${process.env.EMAIL_USER || 'renishs.22msc@kongu.edu'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional HTML message
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
