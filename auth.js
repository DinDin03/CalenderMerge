// auth.js
import 'dotenv/config';
import { google } from 'googleapis';
import db from './db.js';

const createOAuthClient = () => new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export function getAuthUrl(req, res) {
  const client = createOAuthClient();
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly','https://www.googleapis.com/auth/userinfo.email']
  });
  res.redirect(url);
}

export async function oauthCallback(req, res, next) {
  try {
    // 1) Exchange code for tokens on a new client
    const client = createOAuthClient();
    const { tokens } = await client.getToken(req.query.code);
    client.setCredentials(tokens);

    // 2) Fetch the user’s email via Userinfo
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data: userInfo } = await oauth2.userinfo.get();
    const email = userInfo.email;
    if (!email) throw new Error('Could not retrieve email from Google userinfo');

    // 3) Store or update in MySQL
    await db.query(
      `INSERT INTO users (email, google_token)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE google_token = VALUES(google_token)`,
      [email, JSON.stringify(tokens)]
    );

    res.send('Auth successful for ' + email);
  } catch (err) {
    next(err);
  }
}

/**
 * Returns an authenticated OAuth2 client for the given user email.
 */
export async function getAuthClientForUser(email) {
  const [rows] = await db.query(
    'SELECT google_token FROM users WHERE email = ?',
    [email]
  );
  if (!rows.length) throw new Error(`No tokens found for ${email}`);

  const tokens = JSON.parse(rows[0].google_token);
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials(tokens);
  return client;
}
