import nodemailer from 'nodemailer';

/**
 * Shared email transport for the server, sending through a Gmail account.
 *
 * Credentials come from environment variables, so they're never committed to the repo:
 *   GMAIL_USER          the Gmail address used to sign in
 *   GMAIL_APP_PASSWORD  a Google App Password (not the account's normal password).
 *                       Requires 2-Step Verification on the account.
 */
export const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

// Check the Gmail login once at startup, so bad credentials show up in the server logs
// immediately instead of on the first booking
mailer.verify()
  .then(() => console.log('Gmail ready'))
  .catch(e => console.error('Gmail login failed:', e.message));

/**
 * Escapes the characters that have special meaning in HTML, so user-submitted text
 * is shown as plain text in an email instead of being interpreted as markup.
 * e.g. '<b>Hi</b>' → '&lt;b&gt;Hi&lt;/b&gt;'
 *
 * @param {string} s - Untrusted text, such as a name from the booking form
 * @returns {string} The same text, safe to insert into HTML
 */
export const escapeHtml = s => s.replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Makes multi-line user text safe for HTML and keeps its line breaks.
 * Escapes the text first, then turns each newline into a <br> tag.
 * e.g. 'Drums\nBass' → 'Drums<br>Bass'
 *
 * @param {string} s - Untrusted multi-line text, such as a textarea response
 * @returns {string} Escaped HTML with line breaks preserved
 */
export const nl2br = s => escapeHtml(s).replace(/\n/g, '<br>');