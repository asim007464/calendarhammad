# Emergency site lockdown — recovery guide

**Save this file and your `DEVELOPER_UNLOCK_SECRET` somewhere safe (password manager, offline note).**

## What lockdown does

When an admin clicks **Shutdown website** on the admin dashboard:

- Public pages redirect to `/maintenance`
- `/admin`, `/login`, and `/api/*` still work
- Only the **developer super-admin** (`ADMIN_EMAIL` in env) can restore the site from the dashboard

Regular admins can trigger lockdown but **cannot** restore it.

## How to restore the site (developer)

### Option 1 — Admin dashboard (recommended)

1. Sign in with your super-admin email (`ADMIN_EMAIL`, e.g. `asimsajjad928@gmail.com`)
2. Open `/admin`
3. Click **Restore website (developer)**

### Option 2 — Emergency API (if locked out of admin UI)

Use your secret from `.env.local`:

```bash
curl -X POST https://www.qsodates.com/api/site/unlock \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"YOUR_DEVELOPER_UNLOCK_SECRET\"}"
```

Local dev:

```bash
curl -X POST http://localhost:3000/api/site/unlock \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"YOUR_DEVELOPER_UNLOCK_SECRET\"}"
```

## Required environment variables

Add to `.env.local` and Vercel:

```
ADMIN_EMAIL=your-developer@gmail.com
DEVELOPER_UNLOCK_SECRET=choose-a-long-random-string-here
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Generate a unlock secret (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Database setup

Run migration `supabase/migrations/005_admin_features.sql` in the Supabase SQL editor.

## Security

- Never commit API keys or unlock secrets to git.
- If an API key was shared in chat or email, rotate it in the OpenAI dashboard immediately.
