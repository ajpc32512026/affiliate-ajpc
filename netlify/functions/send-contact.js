const nodemailer = require('nodemailer');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }
  try {
    const data = JSON.parse(event.body);
    // Honeypot trap
    if (data['bot-field']) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Submission received (bot ignored).' }),
      };
    }
    const name = data.name?.trim();
    const email = data.email?.trim();
    const message = data.message?.trim();
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'All fields are required.' }),
      };
    }
    // Rudimentary email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Please enter a valid email address.' }),
      };
    }
    const MAX_CHARS = 3000;
    const nonSpaceCount = message.replace(/\s/g, '').length;
    if (nonSpaceCount > MAX_CHARS) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Message exceeds ${MAX_CHARS} non-space characters.` }),
      };
    }
    // SMTP setup (Brevo / Sendinblue)
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: 'b20b03001@smtp-brevo.com',
        pass: process.env.BREVO_SMTP_KEY,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000, // 10 seconds timeout safeguard
    });
    const senderEmail = 'hello@cozzycollections.com.au';
    const recipientEmail = 'sales.aud26@gmail.com';
    const mailOptions = {
      from: `"Cozzy Collections" <${senderEmail}>`,
      to: recipientEmail,
      subject: `📩 New Contact Message from ${name}`,
      text: `
You have a new message from Cozzy Collections:
Name: ${name}
Email: ${email}
Message:
${message}
      `.trim(),
      replyTo: email,
    };
    await transporter.sendMail(mailOptions);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Message sent successfully.' }),
    };
  } catch (error) {
    console.error('[send-contact.js] Fatal error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error. Please try again later.' }),
    };
  }
};
