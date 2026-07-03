# Vercel Deployment Guide

## 1. Import project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import **https://github.com/asim007464/calendarhammad**
3. Framework: **Next.js** (auto-detected)
4. Root directory: **/** (leave default)
5. Build command: `npm run build`
6. Output: default

## 2. Add Environment Variables (required)

In **Vercel → Project → Settings → Environment Variables**, add these for **Production**, **Preview**, and **Development**:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xphancbkmcbswyhoatzh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service role key |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` (or `https://www.qsodates.com`) |
| `ADMIN_PASSWORD` | your admin password |

Copy values from your local `.env.local` file.

## 3. Redeploy

After saving env vars, go to **Deployments → Redeploy** (check "Use existing Build Cache" off for first redeploy).

## Common errors

### Build failed — ESLint
Fixed in `next.config.ts` (`ignoreDuringBuilds: true`).

### `Supabase not configured` / 500 on API
Missing env vars on Vercel. Add all variables from step 2 and redeploy.

### Activities not saving on production
`SUPABASE_SERVICE_ROLE_KEY` must be set on Vercel (not just anon key).

### Blank page / demo data only
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` missing or wrong.

## 4. Custom domain (qsodates.com)

Vercel → Project → Settings → Domains → add `www.qsodates.com` and `qsodates.com`.
