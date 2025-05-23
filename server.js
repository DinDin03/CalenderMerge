import express from 'express';
import session from 'express-session';
import path from 'path';
import slotsRouter from './routes/slots.js';
import { getAuthUrl, oauthCallback } from './auth.js';

const app = express();

// 1) Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'replace_this_with_a_strong_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// 2) View engine & static
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(process.cwd(), 'public')));

// OAuth endpoints
app.get('/auth/url', getAuthUrl);
app.get('/auth/callback', oauthCallback);

// 3) Root – if logged in, show form; otherwise kick off OAuth
app.get('/', (req, res) => {
  if (req.session && req.session.email) {
    // user is authenticated
    res.render('index', { email: req.session.email });
  } else {
    // not yet authenticated
    res.redirect('/auth/url');
  }
});

// API
app.use('/slots', slotsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
