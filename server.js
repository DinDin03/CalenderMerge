import express from 'express';
import path from 'path';
import slotsRouter from './routes/slots.js';
import { getAuthUrl, oauthCallback } from './auth.js';

const app = express();

// Set Pug as the view engine
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'pug');

// Serve static files from public/
app.use(express.static(path.join(process.cwd(), 'public')));

// OAuth routes
app.get('/auth/url', getAuthUrl);
app.get('/auth/callback', oauthCallback);

// Render the form at root
app.get('/', (req, res) => res.render('index'));

// API
app.use('/slots', slotsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

