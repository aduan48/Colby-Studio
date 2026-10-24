import nodemailer from 'nodemailer';

export const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

mailer.verify()
  .then(() => console.log('Gmail ready'))
  .catch(e => console.error('Gmail login failed:', e.message));

export const escapeHtml = s => s.replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const nl2br = s => escapeHtml(s).replace(/\n/g, '<br>');