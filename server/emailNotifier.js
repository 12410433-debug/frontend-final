import nodemailer from 'nodemailer';

function smtpSettings() {
  const user = process.env.SMTP_USER?.trim() || '';
  const password = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, '') || '';
  return {
    user,
    password,
    configured: Boolean(user && password),
    host: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true',
  };
}

function createConfigurationError() {
  const error = new Error('Gmail SMTP belum dikonfigurasi. Isi SMTP_USER dan SMTP_APP_PASSWORD di file .env, lalu jalankan ulang server.');
  error.statusCode = 503;
  return error;
}

let transport;
let transportKey = '';

function getTransport() {
  const settings = smtpSettings();
  if (!settings.configured) throw createConfigurationError();

  const key = [settings.user, settings.password, settings.host, settings.port, settings.secure].join('|');
  if (!transport || transportKey !== key) {
    transportKey = key;
    transport = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: { user: settings.user, pass: settings.password },
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 20000,
    });
  }
  return transport;
}

export function getSmtpStatus() {
  const settings = smtpSettings();
  return {
    configured: settings.configured,
    provider: 'Gmail SMTP',
    host: settings.host,
    port: settings.port,
  };
}

export async function verifySmtpConnection() {
  await getTransport().verify();
  return { verified: true };
}

export async function sendEmail({ to, subject, text, html }) {
  const settings = smtpSettings();
  const sender = process.env.SMTP_FROM?.trim() || 'FILKOM Event Management <' + settings.user + '>';
  return getTransport().sendMail({ from: sender, to, subject, text, html });
}