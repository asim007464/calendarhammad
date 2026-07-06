# Vercel Deployment Guide

## Fix 404 NOT_FOUND error

This error means Vercel is **not serving your Next.js app**. Fix these settings:

### In Vercel → Project → Settings → General → Build & Development Settings

| Setting | Correct value |
|---------|----------------|
| **Framework Preset** | `Next.js` |
| **Root Directory** | *(leave empty)* |
| **Build Command** | `npm run build` |
| **Output Directory** | *(leave empty — do NOT set `out`, `public`, or `.next`)* |
| **Install Command** | `npm install` |

> **Most common mistake:** Output Directory is set to something. Clear it completely for Next.js.

### Redeploy correctly

1. Delete the old Vercel project (or create a new one)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import **https://github.com/asim007464/calendarhammad**
4. Confirm Framework shows **Next.js**
5. Add environment variables (step 2 below)
6. Click **Deploy**

### Custom domain 404

If `www.qsodates.com` shows 404 but `your-app.vercel.app` works:
- Vercel → Project → **Settings → Domains** → add the domain
- Update DNS at your registrar to point to Vercel

---

## Environment Variables (required)

Vercel → **Settings → Environment Variables** → add for Production, Preview, Development:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xphancbkmcbswyhoatzh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `NEXT_PUBLIC_SITE_URL` | `https://www.qsodates.com` |
| `SMTP_EMAIL` | Gmail address used to send OTP emails |
| `SMTP_APP_PASSWORD` | Gmail [App Password](https://myaccount.google.com/apppasswords) (16 chars, no spaces needed) |
| `ADMIN_EMAIL` | Super-admin email for admin panel |
| `DEVELOPER_UNLOCK_SECRET` | Emergency site unlock secret |
| `OPENAI_API_KEY` | Optional — AI chat assistant |

Copy from local `.env.local`, then **Redeploy**.

---

## Verify deployment succeeded

1. Vercel → **Deployments** → latest should show **Ready** (green)
2. Click the deployment → **Building** log should end with `Build Completed`
3. Open the **`.vercel.app`** URL from the deployment (not a custom domain until DNS is set)

---

## Still failing?

Send a screenshot of:
- Vercel **Build & Development Settings**
- The **Build log** (last 20 lines)
