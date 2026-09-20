import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';

// Force IPv4 first to prevent ENETUNREACH on environments without IPv6 routing
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

export const getTransporter = async () => {
  const { address } = await dns.promises.lookup('smtp.gmail.com', { family: 4 });
  return nodemailer.createTransport({
    host: address,
    port: 465,
    secure: true,
    tls: {
      servername: 'smtp.gmail.com'
    },
    auth: {
      user: process.env.SMTP_USER || 'YOUR_EMAIL@gmail.com',
      pass: process.env.SMTP_PASS || 'YOUR_APP_PASSWORD',
    },
  });
};

export const sendBookingConfirmation = async (email: string, name: string, referenceId: string, details: string) => {
  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: `"Café Belmirah" <${process.env.SMTP_USER || 'noreply@cafebelmirah.com'}>`,
      to: email,
      subject: 'Booking Confirmation - Café Belmirah',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #C9A84C;">Booking Confirmed!</h2>
          <p>Dear ${name},</p>
          <p>Thank you for choosing Café Belmirah. Your booking is confirmed.</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reference ID:</strong> ${referenceId}</p>
            <p style="margin: 10px 0 0 0;">${details}</p>
          </div>
          <p>You can view and download your full invoice using this link:</p>
          <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${referenceId}" style="color: #C9A84C;">View Invoice</a></p>
          <p>We look forward to hosting you!</p>
          <p>Warm regards,<br>The Café Belmirah Team</p>
        </div>
      `,
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
