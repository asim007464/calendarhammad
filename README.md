# QSO Dates — Amateur Radio Activity Calendar

Next.js + Supabase platform for [www.qsodates.com](https://www.qsodates.com), inspired by OpenRepeater.org.

## Features

- **Activity calendar** — month grid & list views, UTC scheduling
- **Activity types API** — `/api/activity-types` (system + user-created types)
- **Schedule API** — `/api/schedule?period=weekly|monthly`
- **Custom activity fields** — users add extra fields per activity
- **Activity logos** — logo URL per activity (+ Supabase Storage bucket)
- **Social auto-post** — Facebook, Instagram, X on activity publish
- **Admin dashboard** — users, support, activities, broadcasts, social log
- **User dashboard** — profile, external feeds (eHamHub, CQHams), analytics
- **Google Analytics** (`G-6SH5MHBQBP`) + **Microsoft Clarity** (`xex69937yv`)

## Social Links

- GitHub: https://github.com/QSODates
- Facebook: https://www.facebook.com/profile.php?id=61591527421511
- Instagram: https://www.instagram.com/qsodates/
- X: https://x.com/QSODates
- WhatsApp: +1 803-364-6918

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   ```
   Add your Supabase URL, anon key, and service role key.

3. **Run Supabase migration**
   - Open [Supabase SQL Editor](https://supabase.com/dashboard)
   - Paste and run `supabase/migrations/001_initial.sql`
   - Create a public storage bucket named `activity-logos`

4. **Add logo**
   - Replace `public/logo.svg` with your QSO Dates logo image

5. **Start dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Admin

- URL: `/admin`
- Default password: `hamcaladmin` (set `ADMIN_PASSWORD` in `.env.local`)

## Social Auto-Post

Configure in `.env.local`:
- `FACEBOOK_PAGE_ID`, `FACEBOOK_ACCESS_TOKEN`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`, `INSTAGRAM_ACCESS_TOKEN`
- `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET`

Posts are queued in `social_posts` table and logged in admin.

## Deploy

Deploy to Vercel and point `www.qsodates.com` to your deployment. Set all env vars in Vercel project settings.
