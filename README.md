# Florinaa - Sleep in Style

Premium website and protected admin dashboard for Florinaa.

## What is included

- Cinematic landing page with parallax hero, scroll reveals, horizontal product showcase, counters, product filters, product detail modal, lead-capture catalogue download, maps, inquiry form, and floating WhatsApp CTA.
- Secure `/admin` dashboard with httpOnly cookie auth, brute-force login protection, product CRUD, category CRUD with drag reorder, inquiry/lead status management, content updates, catalogue URL updates, and CSV export.
- Zero-dependency Node server with JSON persistence in `data/db.json`, so the project runs immediately and can later be swapped to MongoDB/Cloudinary without rewriting the UI.

## Setup

1. Create a local environment file:

```bash
cp .env.example .env
```

2. Edit `.env` and set real values:

```bash
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-strong-password
ADMIN_JWT_SECRET=a-long-random-secret
```

3. Start the app:

```bash
npm run dev
```

4. Open:

- Website: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Email notifications

Set `EMAIL_WEBHOOK_URL` to a webhook relay such as Make, Zapier, n8n, or a small Nodemailer endpoint. Inquiry and catalogue lead events are posted as JSON with the event name and payload.

## Production notes

- Replace placeholder Unsplash images and `public/catalogue-placeholder.pdf` with final brand assets.
- Move `data/db.json` to MongoDB Atlas, PostgreSQL, or Supabase for multi-user production.
- Move image/PDF storage to Cloudinary or S3-compatible storage.
- Keep `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_JWT_SECRET` in deployment environment variables only.
