// ── FOODHUB AUTH SERVER ──
// Node.js + Express backend for Google OAuth token verification

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt        = require('jsonwebtoken');

const app    = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── MIDDLEWARE ──
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'https://food-hubv1.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ── IN-MEMORY USER STORE (replace with a real DB in production) ──
const users = new Map(); // keyed by email

// ── HELPERS ──
function generateSessionToken(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return jwt.sign(
    {
      sub   : user.googleSub,
      email : user.email,
      name  : user.name,
      picture: user.picture,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function verifySessionToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = verifySessionToken(token);
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ error: msg });
  }
}

// ── ROUTE: Health check ──
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ── ROUTE: Google Sign-In ──
// Receives the Google credential JWT from the frontend,
// verifies it server-side with google-auth-library,
// then issues our own session token.
app.post('/auth/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ error: 'Missing credential token' });
  }

  try {
    // ✅ Verify the Google ID token — this is the critical security step
    const ticket = await client.verifyIdToken({
      idToken  : credential,
      audience : process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Additional security checks
    if (!payload.email_verified) {
      return res.status(401).json({ error: 'Google account email is not verified' });
    }

    // Extract user data from the verified payload
    const userData = {
      googleSub  : payload.sub,
      email      : payload.email,
      name       : payload.name,
      firstName  : payload.given_name  || payload.name.split(' ')[0] || '',
      lastName   : payload.family_name || payload.name.split(' ').slice(1).join(' ') || '',
      picture    : payload.picture || '',
      verified   : true,
      provider   : 'google',
      lastLogin  : new Date().toISOString(),
    };

    // Upsert user in store
    const existing = users.get(userData.email);
    users.set(userData.email, { ...existing, ...userData });

    // Generate our own session JWT
    const sessionToken = generateSessionToken(userData);

    res.json({
      token : sessionToken,
      user  : {
        email     : userData.email,
        name      : userData.name,
        firstName : userData.firstName,
        lastName  : userData.lastName,
        picture   : userData.picture,
      }
    });

  } catch (err) {
    console.error('Google token verification failed:', err.message);
    // Do not reveal exact reason to client
    res.status(401).json({ error: 'Google authentication failed. Please try again.' });
  }
});

// ── ROUTE: Get current user profile (protected) ──
app.get('/profile', authMiddleware, (req, res) => {
  const stored = users.get(req.user.email) || {};
  res.json({
    email    : req.user.email,
    name     : req.user.name,
    firstName: stored.firstName || req.user.name?.split(' ')[0] || '',
    lastName : stored.lastName  || req.user.name?.split(' ').slice(1).join(' ') || '',
    picture  : req.user.picture || stored.picture || '',
    provider : stored.provider || 'google',
    lastLogin: stored.lastLogin || null,
  });
});

// ── ROUTE: Logout (client-side token clearing, but server can log it) ──
app.post('/auth/logout', authMiddleware, (req, res) => {
  // In production: add token to a blocklist / revocation store
  // For now we just acknowledge — the client will clear the token
  console.log(`User logged out: ${req.user.email}`);
  res.json({ ok: true, message: 'Logged out successfully' });
});

// ── ROUTE: Verify token (useful for page guards) ──
app.get('/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: { email: req.user.email, name: req.user.name, picture: req.user.picture } });
});

// ── START ──
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🍽️  FoodHub Auth Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   CORS origin: ${process.env.ALLOWED_ORIGIN || 'https://food-hubv1.vercel.app'}\n`);
});

module.exports = app;
