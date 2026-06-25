# Indaspro

Hyperlocal home services marketplace for small towns in West Bengal (Bankura / Bishnupur / Durgapur). Single PWA covering Customer, Provider, and Admin roles in one codebase, built for a zero-cost pilot on Firebase Spark.

**Tagline:** আপনার ঘরের সেবা, এক ক্লিকে (Your home service, one click away)

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript strict)
- **Styling:** Tailwind CSS + shadcn/ui-style components
- **Backend:** Firebase Spark — Firestore + Phone Auth (no Cloud Storage, no payment gateway)
- **PWA:** next-pwa (installable, offline fallback)
- **Forms:** react-hook-form + zod
- **i18n:** Bengali (primary) / Hindi / English, via a lightweight custom dictionary context
- **Payments:** UPI QR (client-generated) + cash, manually reconciled by admin

See [CLAUDE.md](./CLAUDE.md) for the full product/technical specification (data model, screens, security rules, seed data).

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # fill in your Firebase project credentials
npm run dev
```

App runs at `http://localhost:3000`.

### Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=indaspro-80195.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=indaspro-80195
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_UPI_ID=indaspro@okicici
NEXT_PUBLIC_PLATFORM_FEE=19
NEXT_PUBLIC_COMMISSION_PERCENT=12
```

### Firebase Setup

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Rules and composite indexes live in `firestore.rules` / `firestore.indexes.json`.

## Scripts

| Command         | Description                          |
|-----------------|---------------------------------------|
| `npm run dev`   | Start the dev server                  |
| `npm run build` | Production build (type-checked + linted) |
| `npm run start` | Start the production server           |
| `npm run lint`  | Run ESLint                            |

## Project Structure

```
src/
├── app/            # Next.js App Router routes (landing, login, customer/*, provider/*, admin/*)
├── components/      # ui/ (primitives), landing/, auth/, customer/, provider/, admin/, shared/, layout/
├── lib/             # firebase.ts, auth.ts, firestore.ts (typed CRUD + cleanData), constants.ts, utils.ts
├── hooks/           # useAuth, useUser, useRole, useBooking, useProvider, useServices, useRealtimeBooking
├── context/         # AuthContext, RoleContext, LanguageContext
├── types/           # Firestore document interfaces
└── i18n/            # bn.json (primary), hi.json, en.json
```

## Roles

A single account can hold one or more roles (`customer`, `provider`, `admin`) and switches between Customer/Provider modes from the profile screen. Admin access is granted manually in Firestore (`users/{uid}.roles` includes `"admin"`).

- **Customer:** browse services → book (address, schedule, cash/UPI) → track in real time → review
- **Provider:** register (categories, areas — verified in person, no Aadhaar/bank info collected in the pilot) → accept jobs → run the job stepper (on the way → arrived/OTP → in progress → payment) → track earnings
- **Admin:** dashboard, user/provider verification, services & categories CRUD, bookings, UPI payment verification, settlements (paid out manually/offline in the pilot), coupons, reports, platform settings

## Notes

- No photo uploads or Cloud Storage — avatars are initials-based, provider ID verification is done in person.
- No payment gateway — UPI QR codes are generated client-side; customers submit a UTR number, and admin reconciles against the bank statement.
- Provider payouts are currently manual/offline (no UPI/bank details stored) until a gateway is integrated.
