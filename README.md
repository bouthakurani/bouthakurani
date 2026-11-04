# Bouthakurani Restaurant Platform

A Next.js + Node.js + PostgreSQL starter application for Bouthakurani.

## Included and working
- Public restaurant landing page and menu
- Reservation request form persisted to PostgreSQL
- Catering enquiry form persisted to PostgreSQL
- Customer review submission with moderation default (not publicly displayed until approved)
- Admin login with hashed password and HTTP-only signed session cookie
- Admin dashboard with live database counts and completed revenue
- Admin menu categories and items with add, edit, hide/show, image, availability and safe delete controls
- Public menu search, category filters, verified food images and responsive mobile browse/cart navigation
- Persistent cart, scheduled delivery address/time, and server-verified Razorpay checkout
- Admin order, reservation, catering, customer and review lists
- Admin order list with delivery schedule and payment status
- Responsive light-theme admin layout

## Production setup notes
Advanced POS, kitchen/bar display, stock/recipe accounting, full billing/GST workflows, customer segmentation, staff permissions, WhatsApp/SMS delivery, printer support, and moderation actions require further implementation. Razorpay checkout is implemented but requires provider keys and an active payment account. Do not rely on this starter for regulated alcohol sales.

## 1. Requirements
- Node.js 20.9+ (Node 22 recommended)
- PostgreSQL database (Neon recommended)
- GitHub account
- Vercel account

## 2. Run locally
1. Extract ZIP.
2. Open the folder in VS Code.
3. Copy `.env.example` to `.env`.
4. Set `DATABASE_URL` to your Neon/PostgreSQL connection string.
5. Set a strong `JWT_SECRET` (32+ random characters).
6. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
7. Run:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000 and sign in at `/admin/login`.

Default seed email: `admin@bouthakurani.in`. The password is whatever you set as `ADMIN_PASSWORD`. Set a unique password in `.env`; no default password is shipped.

## 3. Online ordering
The seed adds the 24 requested banquet selections with images and a price of `0` because no prices were supplied. Set actual prices and review images in Admin → Menu before accepting orders; unpriced, hidden, or unavailable items cannot be checked out.

Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env` for local payments and in the deployment environment for production. The server verifies payment signatures before confirming orders. Delivery can be scheduled at least one hour ahead and up to 30 days out. Delivery charges are not configured, so online payment currently covers the item subtotal only.

## 4. Deploy to Vercel
1. Push this project to a private GitHub repository.
2. In Vercel, choose Add New → Project and import the repository.
3. Add all required environment variables from `.env.example` in Vercel Project Settings → Environment Variables.
4. Set `DATABASE_URL` to your Neon pooled connection string (include SSL mode).
5. Set `JWT_SECRET` to a long random secret.
6. Set `ADMIN_EMAIL` and a new strong `ADMIN_PASSWORD`.
7. Deploy.
8. After deployment, run database setup from a local terminal connected to the production database:

```bash
npx prisma db push
npm run db:seed
```

For a controlled production migration workflow, create and commit Prisma migrations rather than using `db push` for every future schema change.

## 5. Security
- Never commit `.env`.
- Rotate the example password before deployment.
- Use a unique production JWT secret.
- Keep provider credentials in Vercel environment variables.
- Restrict admin access and configure backups.
- Add rate limiting/WAF protection before public promotion.
- Add a password-change workflow before using this as a production admin system.

## 6. Important
WhatsApp Cloud API, SMS, Razorpay and Cloudinary credentials are not included. Provider onboarding, template approval, webhook configuration, DLT registration and payment account activation are external requirements. Never publish secret keys in browser code.
