const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message, company } = req.body || {};

  // Honeypot: real visitors never fill this hidden field, bots often do.
  if (company) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    await resend.emails.send({
      from: 'Eclipse Website <website@mail.eclipse-it.co.za>',
      to: ['info@eclipse-it.co.za'],
      replyTo: email,
      subject: `New enquiry (${subject || 'General Inquiry'}) from ${name}`,
      text:
        `New contact form submission from eclipse-it.co.za\n\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Subject: ${subject || 'General Inquiry'}\n\n` +
        `Message:\n${message}`,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend send failed:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
