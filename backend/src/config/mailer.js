// backend/src/config/mailer.js
const nodemailer = require('nodemailer');

const isSmtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true para puerto 465, false para otros
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  // Transporter de desarrollo / fallback simulado si no hay credenciales SMTP en el entorno
  transporter = nodemailer.createTransport({
    jsonTransport: true,
  });
  console.warn(
    '[Mailer] Variables SMTP no configuradas. El envío de correos se simulará en consola.'
  );
}

const defaultFrom =
  process.env.EMAIL_FROM ||
  process.env.SMTP_FROM ||
  '"SkillUp Campus" <home.help.pf2025@gmail.com>';

module.exports = {
  transporter,
  defaultFrom,
  isSmtpConfigured,
};

