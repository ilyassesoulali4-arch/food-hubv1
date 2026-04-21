# FoodHub — Google Authentication Setup Guide

## Project Structure

```
foodhub-auth/
├── backend/
│   ├── server.js          ← Node.js + Express auth server
│   ├── package.json
│   └── .env.example       ← Copy to .env and fill in values
└── frontend/
    ├── login.html         ← Updated login page (replace yours)
    └── app.js             ← Updated app.js (replace yours)
```

---

## How It Works (Security Flow)

```
Browser                    Backend                  Google
  │                           │                        │
  │──── User clicks "Sign     │                        │
  │     in with Google" ────► │                        │
  │                           │                        │
  │◄── Google One-Tap popup ──────────────────────────►│
  │                           │                        │
  │◄── Google returns         │                        │
  │    credential JWT ────────────────────────────────◄│
  │                           │                        │
  │──── POST /auth/google ───►│                        │
  │     { credential: JWT }   │                        │
  │                           │──── verifyIdToken() ──►│
  │                           │◄─── verified payload ──│
  │                           │                        │
  │◄── { token, user } ───────│   (backend issues      │
  │    (our own JWT)          │    its own JWT)        │
  │                           │                        │
  │  Store token in           │                        │
  │  localStorage             │                        │
  │                           │                        │
  │──── GET /profile ────────►│                        │
  │     Authorization:        │                        │
  │     Bearer <our JWT>      │                        │
  │◄── user data ─────────────│                        │
```

**Key security principle:** The Google credential JWT is sent raw to the backend and verified server-side using `google-auth-library`. The frontend never blindly trusts the payload. The backend issues its own separate JWT for the session.

---

## Step 1 — Backend Setup

### Install dependencies

```bash
cd backend
npm install
```

### Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
GOOGLE_CLIENT_ID=914536200113-91r8gjtnpatjf34uonpqp5t188s7i5a3.apps.googleusercontent.com
JWT_SECRET=your-long-random-secret-here
JWT_EXPIRES_IN=7d
ALLOWED_ORIGIN=https://food-hubv1.vercel.app
PORT=4000
```

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Run locally

```bash
npm run dev        # with auto-reload (nodemon)
# or
npm start          # without auto-reload
```

The server will start on `http://localhost:4000`.

---

## Step 2 — Frontend Setup

1. **Replace** your existing `login.html` with `frontend/login.html`
2. **Replace** your existing `app.js` with `frontend/app.js`

### Update the API_BASE URL

In **both** `login.html` and `app.js`, find and update this line:

```javascript
// Before deploying, change this to your actual backend URL:
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:4000'
  : 'https://your-backend-url.railway.app'; // ← UPDATE THIS
```

---

## Step 3 — Google Cloud Console Configuration

Your OAuth client is already configured. Verify these settings in [Google Cloud Console](https://console.cloud.google.com/):

1. Go to **APIs & Services → Credentials**
2. Click your OAuth 2.0 Client ID
3. Confirm **Authorized JavaScript Origins** includes:
   - `https://food-hubv1.vercel.app`
   - `http://localhost:3000` (for local testing)
4. Confirm **NO Redirect URIs** are set (GIS token method doesn't use them)

> **Note:** Changes to Google Console can take 5–15 minutes to propagate.

---

## Step 4 — Deploy the Backend

### Option A: Railway (Recommended — free tier available)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Set environment variables in the Railway dashboard under **Variables**.

### Option B: Render

1. Connect your GitHub repo at [render.com](https://render.com)
2. Create a new **Web Service**
3. Set **Build Command:** `npm install`
4. Set **Start Command:** `node server.js`
5. Add environment variables in the Render dashboard

### Option C: Heroku

```bash
heroku create foodhub-auth-server
heroku config:set GOOGLE_CLIENT_ID=914536200113-...
heroku config:set JWT_SECRET=your-secret
heroku config:set ALLOWED_ORIGIN=https://food-hubv1.vercel.app
git push heroku main
```

After deploying, update `API_BASE` in your frontend files with the live URL.

---

## Step 5 — Test the Integration

### Health check
```bash
curl https://your-backend-url.railway.app/health
# Expected: {"ok":true,"timestamp":"..."}
```

### Test Google login
1. Open `https://food-hubv1.vercel.app/login.html`
2. Click **Continue with Google**
3. Select your Google account
4. You should be redirected to the success state with your name and photo

### Test profile endpoint
```bash
# After logging in, copy the token from localStorage in DevTools:
# Application → Local Storage → fh_session_token

TOKEN="paste-your-token-here"
curl -H "Authorization: Bearer $TOKEN" https://your-backend-url/profile
```

---

## API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | Server health check |
| POST | `/auth/google` | None | Verify Google credential, issue session JWT |
| GET | `/profile` | Bearer JWT | Get current user's profile |
| GET | `/auth/verify` | Bearer JWT | Verify session token validity |
| POST | `/auth/logout` | Bearer JWT | Log out (notify server) |

---

## Multi-Page Auth Guard

To protect any page that requires login, add this to the page's `<script>`:

```javascript
// At the top of your page script — protects the page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth(); // defined in app.js
  if (!user) return; // requireAuth() already redirected to login.html

  // Optionally fetch fresh profile from backend
  const profile = await fetchProfileFromBackend();
  if (profile) {
    document.getElementById('userName').textContent = profile.name;
    document.getElementById('userAvatar').src = profile.picture;
  }
});
```

---

## Troubleshooting

### "Google authentication failed"
- Ensure `GOOGLE_CLIENT_ID` in `.env` exactly matches the one in `login.html`
- Verify your domain is in **Authorized JavaScript Origins** in Google Console
- Check the backend logs for the specific error

### CORS errors
- Ensure `ALLOWED_ORIGIN` in `.env` exactly matches your Vercel domain (no trailing slash)
- Check that the backend `cors()` middleware is applied before routes

### "Token expired"
- The session JWT expires after 7 days by default
- The frontend will clear the session and the user must log in again
- Adjust `JWT_EXPIRES_IN` in `.env` to change this

### Google One-Tap not showing
- One-Tap is suppressed after the user dismisses it multiple times
- Use the explicit button click flow as a fallback (it's already implemented)
- One-Tap requires the page to be served over HTTPS

---

## Security Checklist

- [x] Google token verified server-side with `google-auth-library`
- [x] `email_verified` check before accepting Google account
- [x] JWT_SECRET stored in environment variable, never in code
- [x] CORS restricted to your domain only
- [x] No secrets exposed to frontend
- [x] Invalid/expired tokens return 401
- [x] Logout notifies backend

**For production, additionally:**
- [ ] Use a real database (PostgreSQL, MongoDB) instead of in-memory Map
- [ ] Implement token revocation list for logout
- [ ] Add rate limiting (`npm install express-rate-limit`)
- [ ] Enable HTTPS on your backend host
- [ ] Add request logging (`npm install morgan`)
