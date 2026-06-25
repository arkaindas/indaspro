# Indaspro — Hyperlocal Home Services Platform

## Project Overview
Indaspro is a hyperlocal home services marketplace targeting small towns in West Bengal, India.
Visitors find and contact local service providers (electricians, plumbers, etc.) without login.
Providers register via Google login, list their services with pricing, and manage availability.
Admins approve/reject providers and can seed provider data manually.

**App Name:** Indaspro
**Firebase Project ID:** indaspro-80195
**GitHub Repo:** arkaindas/indaspro
**Default Language:** English (with Bengali toggle)
**Target:** Zero monthly cost pilot

---

## Architecture

### Two Frontends, One Backend

```
├── web/                  → Next.js 14 (App Router, TypeScript, Tailwind CSS)
│                           Hosted on Vercel (free)
│                           SSR for SEO on public pages
│
├── mobile/               → Expo React Native (Expo Router, TypeScript)
│                           APK via EAS Build
│                           Native Android app
│
└── shared/               → Types, constants, i18n, utils
                            Copied/symlinked between web and mobile
```

### Data Flow Rule
- **All READS** → Firebase Client SDK (real-time listeners for availability, direct queries for listings)
- **All WRITES** → Next.js API Routes with Firebase Admin SDK (validation, denormalization, notifications)
- The Expo app calls the Next.js API routes for writes via `fetch()`

### Services Used (All Free Tier)
- Firebase Auth (Google login — unlimited users)
- Firestore Spark plan (50K reads/day, 20K writes/day, 1GB storage)
- Firebase Cloud Messaging (push notifications)
- Firebase Analytics (mobile event tracking)
- Vercel (hosting + analytics, 100GB bandwidth/month)

### NOT Using
- Firebase Storage (no image uploads)
- Firebase Cloud Functions (no Blaze plan)
- Google Maps / Geolocation APIs
- Any payment gateway
- SMS/OTP services

---

## Tech Stack

### Web (Next.js)
- Next.js 14, App Router, TypeScript strict mode
- Tailwind CSS + shadcn/ui components
- Firebase Client SDK v10+ (modular/tree-shakable imports only)
- Firebase Admin SDK (in API routes only)
- `next-seo` or `generateMetadata` for OG tags

### Mobile (Expo)
- Expo SDK 52+ (or latest stable)
- Expo Router (file-based routing)
- TypeScript strict mode
- `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`
- `expo-notifications` for FCM push
- `expo-firebase-analytics` for event tracking

### Shared
- TypeScript interfaces in `shared/types/`
- i18n JSON files in `shared/i18n/`
- Constants in `shared/constants/`
- Pure utility functions in `shared/utils/`

---

## Project Structure

```
indaspro/
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/              # Visitor pages (no auth required)
│   │   │   │   ├── page.tsx           # Homepage — search + category grid
│   │   │   │   ├── services/
│   │   │   │   │   └── [category]/
│   │   │   │   │       └── page.tsx   # Category listing — provider cards
│   │   │   │   └── provider/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx   # Provider detail page
│   │   │   ├── (provider)/            # Provider dashboard (auth required)
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx       # Provider home — services list + availability toggle
│   │   │   │   ├── onboarding/
│   │   │   │   │   └── page.tsx       # 4-step onboarding wizard
│   │   │   │   └── services/
│   │   │   │       ├── new/
│   │   │   │       │   └── page.tsx   # Add service form
│   │   │   │       └── [id]/
│   │   │   │           └── edit/
│   │   │   │               └── page.tsx # Edit service
│   │   │   ├── (admin)/               # Admin panel (auth + admin role required)
│   │   │   │   └── admin/
│   │   │   │       ├── page.tsx       # Pending providers list
│   │   │   │       ├── providers/
│   │   │   │       │   └── page.tsx   # All providers list
│   │   │   │       └── seed/
│   │   │   │           └── page.tsx   # Seed provider form
│   │   │   ├── api/
│   │   │   │   ├── providers/
│   │   │   │   │   ├── register/route.ts
│   │   │   │   │   ├── update/route.ts
│   │   │   │   │   ├── approve/route.ts
│   │   │   │   │   ├── reject/route.ts
│   │   │   │   │   ├── availability/route.ts
│   │   │   │   │   └── seed/route.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── create/route.ts
│   │   │   │   │   ├── update/route.ts
│   │   │   │   │   └── delete/route.ts
│   │   │   │   └── notifications/
│   │   │   │       └── admin-notify/route.ts
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx           # Privacy Policy (bilingual)
│   │   │   ├── terms/
│   │   │   │   └── page.tsx           # Terms of Service (bilingual)
│   │   │   ├── layout.tsx             # Root layout — providers, navbar
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx         # Top nav with language toggle + auth
│   │   │   │   ├── Footer.tsx         # Links to privacy, terms
│   │   │   │   └── NetworkBanner.tsx  # Offline detection banner
│   │   │   ├── home/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── AreaSelector.tsx   # Area dropdown/chip filter
│   │   │   │   └── CategoryGrid.tsx   # Visual grid of service categories
│   │   │   ├── providers/
│   │   │   │   ├── ProviderCard.tsx   # Card with photo/initials, services, call/whatsapp/share
│   │   │   │   ├── ProviderList.tsx   # List of provider cards
│   │   │   │   ├── AvatarWithFallback.tsx  # Auth photo → initials fallback
│   │   │   │   ├── AvailabilityBadge.tsx   # Green/yellow/grey dot + text
│   │   │   │   └── ShareMenu.tsx      # WhatsApp + Facebook share bottom sheet
│   │   │   ├── provider-dashboard/
│   │   │   │   ├── OnboardingWizard.tsx    # 4-step wizard component
│   │   │   │   ├── ServiceForm.tsx         # Add/edit service form
│   │   │   │   ├── AvailabilityToggle.tsx  # Toggle available/busy/offline
│   │   │   │   └── MyServicesList.tsx
│   │   │   ├── admin/
│   │   │   │   ├── PendingProviders.tsx
│   │   │   │   ├── AllProviders.tsx
│   │   │   │   └── SeedProviderForm.tsx
│   │   │   └── common/
│   │   │       ├── SkeletonCard.tsx        # Skeleton loader for cards
│   │   │       ├── SkeletonGrid.tsx        # Skeleton loader for grids
│   │   │       └── EmptyState.tsx          # "No results found" with icon
│   │   ├── lib/
│   │   │   ├── firebase-client.ts     # Client SDK init (auth, firestore)
│   │   │   ├── firebase-admin.ts      # Admin SDK init (API routes only)
│   │   │   ├── auth-context.tsx       # AuthProvider + useAuth hook
│   │   │   └── analytics.ts           # Custom event tracking helpers
│   │   └── hooks/
│   │       ├── useTranslation.ts      # i18n hook (reads from shared/i18n)
│   │       ├── useOnlineStatus.ts     # Online/offline detection
│   │       └── useProviders.ts        # Firestore query hooks
│   ├── public/
│   │   ├── icons/                     # Category icons (SVGs)
│   │   └── og-banner.png             # Default OG image (1200x630)
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.local                     # Firebase config (not committed)
│
├── mobile/
│   ├── app/                           # Expo Router screens
│   │   ├── (tabs)/
│   │   │   ├── index.tsx              # Home — search + categories
│   │   │   ├── search.tsx             # Search results
│   │   │   └── profile.tsx            # Provider dashboard OR login prompt
│   │   ├── services/
│   │   │   └── [category].tsx         # Category listing
│   │   ├── provider/
│   │   │   └── [id].tsx               # Provider detail
│   │   ├── onboarding/
│   │   │   └── index.tsx              # 4-step onboarding wizard
│   │   ├── dashboard/
│   │   │   ├── index.tsx              # Provider dashboard home
│   │   │   ├── add-service.tsx
│   │   │   └── edit-service/[id].tsx
│   │   ├── admin/
│   │   │   ├── index.tsx              # Admin pending list
│   │   │   ├── providers.tsx          # All providers
│   │   │   └── seed.tsx               # Seed provider form
│   │   └── _layout.tsx                # Root layout
│   ├── components/                    # React Native equivalents of web components
│   ├── lib/
│   │   ├── firebase.ts                # Client SDK config
│   │   └── api.ts                     # API client — calls web/api/* routes
│   ├── app.json
│   ├── eas.json
│   ├── tsconfig.json
│   └── package.json
│
└── shared/
    ├── types/
    │   ├── provider.ts
    │   ├── service.ts
    │   ├── category.ts
    │   └── admin.ts
    ├── constants/
    │   ├── categories.ts              # All categories with icons + Bengali names
    │   └── areas.ts                   # Pilot area list
    ├── i18n/
    │   ├── en.json
    │   ├── bn.json
    │   └── types.ts                   # TypeScript key autocomplete
    └── utils/
        ├── price.ts                   # Format ₹2,500/hr
        ├── phone.ts                   # Indian phone number validation
        ├── avatar.ts                  # Initials generation + color hash
        ├── share.ts                   # WhatsApp/Facebook share URL builders
        └── search.ts                  # Client-side fuzzy filter
```

---

## Firestore Schema

### Collection: `categories`
Pre-seeded, ~20 docs. Read-only for clients.

```typescript
interface Category {
  slug: string;              // Document ID — "electrician"
  name: string;              // "Electrician"
  nameBn: string;            // "ইলেকট্রিশিয়ান"
  icon: string;              // Emoji — "⚡"
  order: number;             // Display order
  serviceCount: number;      // Denormalized count of active services
  searchTerms: string[];     // ["electrician", "wiring", "ইলেকট্রিশিয়ান", "তার"]
}
```

### Collection: `providers`
Document ID = Firebase Auth UID.

```typescript
interface Provider {
  uid: string;
  displayName: string;
  phone: string;                     // "+919876543210"
  whatsapp: string;                  // "+919876543210"
  email: string;
  photoURL: string | null;           // From Google auth, nullable
  address: string;                   // Free text — "Ward 5, Station Road, Bankura"
  area: string;                      // Slug from PILOT_AREAS — "bankura"
  pinCode: string | null;
  status: "pending_profile" | "pending_approval" | "approved" | "rejected";
  availability: "available" | "busy" | "offline";
  role: "provider";
  source: "self" | "seeded";
  seededBy: string | null;           // Admin UID who seeded
  claimedAt: Timestamp | null;       // When seeded provider claims account
  termsAcceptedAt: Timestamp;
  onboardingStep: number;            // 1-4, tracks progress
  createdAt: Timestamp;
  approvedAt: Timestamp | null;
}
```

### Collection: `services`
Flat collection, one doc per service offering.

```typescript
interface Service {
  id: string;                        // Auto-generated doc ID
  providerId: string;                // Provider's Auth UID
  providerName: string;              // Denormalized — "Ramesh Shaw"
  categorySlug: string;              // "electrician"
  subcategory: string;               // "Wiring"
  title: string;                     // "Full House Wiring"
  description: string;
  price: number;                     // 2500
  priceType: "fixed" | "hourly" | "negotiable";
  priceUnit: "INR";
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `admins`
Document ID = Firebase Auth UID. Simple role lookup.

```typescript
interface Admin {
  uid: string;
  role: "superadmin" | "moderator";
  email: string;
  fcmTokens: string[];              // For push notifications
}
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Categories — anyone can read, no client writes
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if false;  // Written via Admin SDK in API routes
    }

    // Providers — anyone can read approved, providers edit own, admin manages
    match /providers/{providerId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == providerId;
      allow update: if request.auth != null && (
        request.auth.uid == providerId ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
      allow delete: if false;  // Only via Admin SDK
    }

    // Services — anyone reads active, providers manage own
    match /services/{serviceId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.providerId == request.auth.uid;
      allow update, delete: if request.auth != null
        && resource.data.providerId == request.auth.uid;
    }

    // Admins — only readable by the admin themselves
    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
      allow write: if false;  // Manually managed in Firebase Console
    }
  }
}
```

---

## Seed Data

### Categories (pre-seed in Firestore)

```typescript
export const CATEGORIES: Category[] = [
  { slug: "electrician", name: "Electrician", nameBn: "ইলেকট্রিশিয়ান", icon: "⚡", order: 1, serviceCount: 0, searchTerms: ["electrician", "wiring", "electric", "ইলেকট্রিশিয়ান", "তার", "বৈদ্যুতিক"] },
  { slug: "plumber", name: "Plumber", nameBn: "প্লাম্বার", icon: "🔧", order: 2, serviceCount: 0, searchTerms: ["plumber", "plumbing", "pipe", "প্লাম্বার", "পাইপ", "জল"] },
  { slug: "carpenter", name: "Carpenter", nameBn: "মিস্ত্রি", icon: "🪚", order: 3, serviceCount: 0, searchTerms: ["carpenter", "wood", "furniture", "মিস্ত্রি", "কাঠ", "আসবাবপত্র"] },
  { slug: "painter", name: "Painter", nameBn: "রংমিস্ত্রি", icon: "🎨", order: 4, serviceCount: 0, searchTerms: ["painter", "painting", "wall", "রংমিস্ত্রি", "রং", "দেওয়াল"] },
  { slug: "cleaner", name: "House Cleaning", nameBn: "ঘর পরিষ্কার", icon: "🧹", order: 5, serviceCount: 0, searchTerms: ["cleaning", "cleaner", "housekeeping", "পরিষ্কার", "ঘর", "সাফাই"] },
  { slug: "ac-repair", name: "AC Repair", nameBn: "এসি মেরামত", icon: "❄️", order: 6, serviceCount: 0, searchTerms: ["ac", "air conditioner", "cooling", "এসি", "মেরামত", "ঠান্ডা"] },
  { slug: "pest-control", name: "Pest Control", nameBn: "কীটপতঙ্গ নিয়ন্ত্রণ", icon: "🐛", order: 7, serviceCount: 0, searchTerms: ["pest", "cockroach", "termite", "কীটপতঙ্গ", "তেলাপোকা", "উইপোকা"] },
  { slug: "appliance", name: "Appliance Repair", nameBn: "যন্ত্র মেরামত", icon: "🔌", order: 8, serviceCount: 0, searchTerms: ["appliance", "repair", "washing machine", "fridge", "যন্ত্র", "মেরামত"] },
  { slug: "mason", name: "Mason", nameBn: "রাজমিস্ত্রি", icon: "🧱", order: 9, serviceCount: 0, searchTerms: ["mason", "brick", "construction", "রাজমিস্ত্রি", "ইট", "গাঁথনি"] },
  { slug: "welder", name: "Welder", nameBn: "ওয়েল্ডার", icon: "🔥", order: 10, serviceCount: 0, searchTerms: ["welder", "welding", "iron", "ওয়েল্ডার", "ঝালাই", "লোহা"] },
  { slug: "tutor", name: "Home Tutor", nameBn: "গৃহশিক্ষক", icon: "📚", order: 11, serviceCount: 0, searchTerms: ["tutor", "teacher", "tuition", "গৃহশিক্ষক", "টিউশন", "পড়ানো"] },
  { slug: "salon", name: "Salon at Home", nameBn: "বাড়িতে সেলুন", icon: "💇", order: 12, serviceCount: 0, searchTerms: ["salon", "haircut", "beauty", "সেলুন", "চুল কাটা", "রূপচর্চা"] },
  { slug: "gardener", name: "Gardener", nameBn: "মালী", icon: "🌿", order: 13, serviceCount: 0, searchTerms: ["gardener", "garden", "plant", "মালী", "বাগান", "গাছ"] },
  { slug: "driver", name: "Driver", nameBn: "ড্রাইভার", icon: "🚗", order: 14, serviceCount: 0, searchTerms: ["driver", "car", "driving", "ড্রাইভার", "গাড়ি", "চালক"] },
  { slug: "tailor", name: "Tailor", nameBn: "দর্জি", icon: "🧵", order: 15, serviceCount: 0, searchTerms: ["tailor", "stitching", "alteration", "দর্জি", "সেলাই", "জামা"] },
];
```

### Pilot Areas

```typescript
export const PILOT_AREAS = [
  { slug: "bankura", name: "Bankura", nameBn: "বাঁকুড়া" },
  { slug: "bishnupur", name: "Bishnupur", nameBn: "বিষ্ণুপুর" },
  { slug: "sonamukhi", name: "Sonamukhi", nameBn: "সোনামুখী" },
  { slug: "durgapur", name: "Durgapur", nameBn: "দুর্গাপুর" },
  { slug: "asansol", name: "Asansol", nameBn: "আসানসোল" },
  { slug: "bardhaman", name: "Bardhaman", nameBn: "বর্ধমান" },
  { slug: "kolkata", name: "Kolkata", nameBn: "কলকাতা" },
  { slug: "howrah", name: "Howrah", nameBn: "হাওড়া" },
];
```

---

## i18n Translation Files

### en.json

```json
{
  "app": {
    "name": "Indaspro",
    "tagline": "Home services at your doorstep",
    "taglineLong": "Find trusted electricians, plumbers & more near you"
  },
  "nav": {
    "home": "Home",
    "search": "Search",
    "myServices": "My Services",
    "admin": "Admin Panel",
    "login": "Login",
    "logout": "Logout"
  },
  "search": {
    "placeholder": "Search electrician, plumber...",
    "noResults": "No services found in this area",
    "tryAnother": "Try a different area or category",
    "allAreas": "All Areas"
  },
  "provider": {
    "available": "Available",
    "busy": "Busy",
    "offline": "Offline",
    "call": "Call",
    "whatsapp": "WhatsApp",
    "share": "Share",
    "shareVia": "Share via",
    "shareWhatsapp": "WhatsApp",
    "shareFacebook": "Facebook",
    "viewServices": "View Services",
    "services": "Services",
    "address": "Address"
  },
  "onboarding": {
    "step1Title": "Welcome to Indaspro",
    "step1Subtitle": "Sign in to list your services",
    "step2Title": "Your Details",
    "step2Subtitle": "How customers will reach you",
    "step3Title": "Your Services",
    "step3Subtitle": "What do you offer?",
    "step4Title": "Your Location",
    "step4Subtitle": "Where do you provide services?",
    "nameLabel": "Full Name",
    "phoneLabel": "Phone Number",
    "whatsappLabel": "WhatsApp Number",
    "sameAsPhone": "Same as phone number",
    "selectCategory": "Select your service category",
    "addService": "Add a service",
    "addAnother": "Add another service",
    "serviceTitle": "Service name",
    "serviceDescription": "Brief description",
    "servicePrice": "Price (₹)",
    "selectPriceType": "Price type",
    "selectArea": "Select your area",
    "addressLabel": "Full address (landmark based)",
    "pinCodeLabel": "PIN Code",
    "submit": "Submit for Approval",
    "submitted": "Your application has been submitted",
    "waitApproval": "Please wait for admin approval",
    "step": "Step",
    "of": "of"
  },
  "dashboard": {
    "title": "My Dashboard",
    "availability": "Your Availability",
    "toggleAvailable": "I'm Available",
    "toggleBusy": "I'm Busy",
    "toggleOffline": "Go Offline",
    "myServices": "My Services",
    "addService": "Add Service",
    "editService": "Edit Service",
    "deleteService": "Delete Service",
    "confirmDelete": "Are you sure you want to delete this service?",
    "noServices": "You haven't added any services yet",
    "pendingApproval": "Your account is pending approval",
    "rejected": "Your account has been rejected. Contact admin."
  },
  "admin": {
    "title": "Admin Panel",
    "pending": "Pending Approval",
    "allProviders": "All Providers",
    "seedProvider": "Seed Provider",
    "approve": "Approve",
    "reject": "Reject",
    "approved": "Approved",
    "rejected": "Rejected",
    "noPending": "No pending providers",
    "providerCount": "Total Providers",
    "seedForm": "Add provider manually",
    "seeded": "Seeded"
  },
  "pricing": {
    "fixed": "Fixed",
    "hourly": "/hr",
    "negotiable": "Negotiable",
    "startingFrom": "From"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "back": "Back",
    "next": "Next",
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Retry",
    "offline": "You're offline — showing last saved data",
    "loginWithGoogle": "Continue with Google",
    "termsAgree": "I agree to the Terms of Service and Privacy Policy",
    "termsOfService": "Terms of Service",
    "privacyPolicy": "Privacy Policy"
  }
}
```

### bn.json

```json
{
  "app": {
    "name": "Indaspro",
    "tagline": "আপনার দোরগোড়ায় ঘরের পরিষেবা",
    "taglineLong": "আপনার কাছের বিশ্বস্ত ইলেকট্রিশিয়ান, প্লাম্বার এবং আরও অনেক কিছু খুঁজুন"
  },
  "nav": {
    "home": "হোম",
    "search": "খুঁজুন",
    "myServices": "আমার পরিষেবা",
    "admin": "অ্যাডমিন প্যানেল",
    "login": "লগইন",
    "logout": "লগআউট"
  },
  "search": {
    "placeholder": "ইলেকট্রিশিয়ান, প্লাম্বার খুঁজুন...",
    "noResults": "এই এলাকায় কোনো পরিষেবা পাওয়া যায়নি",
    "tryAnother": "অন্য এলাকা বা বিভাগ চেষ্টা করুন",
    "allAreas": "সব এলাকা"
  },
  "provider": {
    "available": "উপলব্ধ",
    "busy": "ব্যস্ত",
    "offline": "অফলাইন",
    "call": "কল করুন",
    "whatsapp": "হোয়াটসঅ্যাপ",
    "share": "শেয়ার",
    "shareVia": "শেয়ার করুন",
    "shareWhatsapp": "হোয়াটসঅ্যাপ",
    "shareFacebook": "ফেসবুক",
    "viewServices": "পরিষেবা দেখুন",
    "services": "পরিষেবা",
    "address": "ঠিকানা"
  },
  "onboarding": {
    "step1Title": "Indaspro-তে স্বাগতম",
    "step1Subtitle": "আপনার পরিষেবা তালিকাভুক্ত করতে সাইন ইন করুন",
    "step2Title": "আপনার তথ্য",
    "step2Subtitle": "গ্রাহকরা কীভাবে আপনার সাথে যোগাযোগ করবে",
    "step3Title": "আপনার পরিষেবা",
    "step3Subtitle": "আপনি কী অফার করেন?",
    "step4Title": "আপনার অবস্থান",
    "step4Subtitle": "আপনি কোথায় পরিষেবা দেন?",
    "nameLabel": "পুরো নাম",
    "phoneLabel": "ফোন নম্বর",
    "whatsappLabel": "হোয়াটসঅ্যাপ নম্বর",
    "sameAsPhone": "ফোন নম্বরের মতো একই",
    "selectCategory": "আপনার পরিষেবার বিভাগ নির্বাচন করুন",
    "addService": "একটি পরিষেবা যোগ করুন",
    "addAnother": "আরেকটি পরিষেবা যোগ করুন",
    "serviceTitle": "পরিষেবার নাম",
    "serviceDescription": "সংক্ষিপ্ত বিবরণ",
    "servicePrice": "মূল্য (₹)",
    "selectPriceType": "মূল্যের ধরন",
    "selectArea": "আপনার এলাকা নির্বাচন করুন",
    "addressLabel": "সম্পূর্ণ ঠিকানা (ল্যান্ডমার্ক ভিত্তিক)",
    "pinCodeLabel": "পিন কোড",
    "submit": "অনুমোদনের জন্য জমা দিন",
    "submitted": "আপনার আবেদন জমা হয়েছে",
    "waitApproval": "অনুগ্রহ করে অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন",
    "step": "ধাপ",
    "of": "এর মধ্যে"
  },
  "dashboard": {
    "title": "আমার ড্যাশবোর্ড",
    "availability": "আপনার উপলব্ধতা",
    "toggleAvailable": "আমি উপলব্ধ",
    "toggleBusy": "আমি ব্যস্ত",
    "toggleOffline": "অফলাইন যান",
    "myServices": "আমার পরিষেবা",
    "addService": "পরিষেবা যোগ করুন",
    "editService": "পরিষেবা সম্পাদনা করুন",
    "deleteService": "পরিষেবা মুছে ফেলুন",
    "confirmDelete": "আপনি কি এই পরিষেবাটি মুছে ফেলতে চান?",
    "noServices": "আপনি এখনও কোনো পরিষেবা যোগ করেননি",
    "pendingApproval": "আপনার অ্যাকাউন্ট অনুমোদনের অপেক্ষায় আছে",
    "rejected": "আপনার অ্যাকাউন্ট প্রত্যাখ্যান করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।"
  },
  "admin": {
    "title": "অ্যাডমিন প্যানেল",
    "pending": "অনুমোদনের অপেক্ষায়",
    "allProviders": "সব পরিষেবা প্রদানকারী",
    "seedProvider": "প্রদানকারী যোগ করুন",
    "approve": "অনুমোদন",
    "reject": "প্রত্যাখ্যান",
    "approved": "অনুমোদিত",
    "rejected": "প্রত্যাখ্যাত",
    "noPending": "কোনো অপেক্ষমাণ প্রদানকারী নেই",
    "providerCount": "মোট প্রদানকারী",
    "seedForm": "ম্যানুয়ালি প্রদানকারী যোগ করুন",
    "seeded": "যোগ করা হয়েছে"
  },
  "pricing": {
    "fixed": "নির্দিষ্ট",
    "hourly": "/ঘন্টা",
    "negotiable": "আলোচনা সাপেক্ষ",
    "startingFrom": "শুরু"
  },
  "common": {
    "save": "সেভ করুন",
    "cancel": "বাতিল",
    "delete": "মুছে ফেলুন",
    "edit": "সম্পাদনা",
    "back": "পিছনে",
    "next": "পরবর্তী",
    "loading": "লোড হচ্ছে...",
    "error": "কিছু ভুল হয়েছে",
    "retry": "আবার চেষ্টা করুন",
    "offline": "আপনি অফলাইন আছেন — সর্বশেষ সংরক্ষিত তথ্য দেখাচ্ছে",
    "loginWithGoogle": "Google দিয়ে লগইন করুন",
    "termsAgree": "আমি শর্তাবলী এবং গোপনীয়তা নীতি মেনে নিচ্ছি",
    "termsOfService": "শর্তাবলী",
    "privacyPolicy": "গোপনীয়তা নীতি"
  }
}
```

---

## Screen Specifications

### PUBLIC SCREENS (No Auth)

#### 1. Homepage (`/`)
**Layout:**
- Top: Navbar with Indaspro logo (text), language toggle (EN | বাং), login button
- Hero: Search bar (full width, prominent) + Area selector dropdown
- Below: Category grid — 3 columns on mobile, 4 on desktop
  - Each cell: emoji icon + category name (in current language)
  - Tap → navigates to `/services/[categorySlug]`
- Footer: Links to Privacy Policy, Terms of Service

**OG Meta:**
```
og:title = "Indaspro — Home services at your doorstep"
og:description = "Find trusted electricians, plumbers & more near you"
og:image = "/og-banner.png"
og:type = "website"
```

#### 2. Category Listing (`/services/[category]`)
**Layout:**
- Top: Back button + Category name (with emoji) + Area selector
- List of ProviderCards (see card design below)
- If no providers: EmptyState component with illustration
- Skeleton cards shown while loading

**Queries:**
```
providers WHERE area == selectedArea AND status == "approved" (real-time listener)
services WHERE categorySlug == category AND providerId IN providerIds
```

#### 3. Provider Detail (`/provider/[id]`)
**Layout:**
- Provider photo (from auth) or initials avatar (large)
- Name, availability badge, address
- List of all services with prices
- Action buttons: Call, WhatsApp, Share
- Share opens bottom sheet: WhatsApp | Facebook

**OG Meta (dynamic per provider):**
```
og:title = "{providerName} — {categoryName} — Indaspro"
og:description = "{subcategory1}, {subcategory2} | ₹{price} onwards | {area}"
og:image = "/og-banner.png"
```

### PROVIDER CARD DESIGN

```
┌─────────────────────────────────────────┐
│  [Photo/Initials]  Provider Name    🟢  │
│                    Category Name        │
│                    📍 Address text      │
│─────────────────────────────────────────│
│  ⚡ Service Title 1           ₹2,500   │
│  ⚡ Service Title 2            ₹400    │
│  ⚡ Service Title 3         আলোচনা সাপেক্ষ │
│─────────────────────────────────────────│
│  [📞 Call]  [💬 WhatsApp]  [📤 Share]  │
└─────────────────────────────────────────┘
```

- Photo: `<img src={photoURL} onError={showInitials} />`
- Initials: First letter of first + last name, background color from `name.charCodeAt(0) % 8` mapped to 8 predefined colors
- Availability dot: 🟢 green = available, 🟡 yellow = busy, ⚫ grey = offline
- Call: `<a href="tel:+91XXXXXXXXXX">`
- WhatsApp: `<a href="https://wa.me/91XXXXXXXXXX?text=Hi, I found you on Indaspro">`
- Share: Opens bottom sheet with WhatsApp and Facebook options

### SHARE URLS

**WhatsApp:**
```
https://wa.me/?text={providerName} — {category} — {address}%0A{tagline}%0A{providerURL}
```

**Facebook:**
```
https://www.facebook.com/sharer/sharer.php?u={providerURL}
```

### PROVIDER SCREENS (Auth Required)

#### 4. Onboarding Wizard (`/onboarding`)
4-step wizard, one screen per step, progress bar at top.

**Step 1 — Login:**
- Google login button (large, full width)
- Bengali subtitle if device language is bn
- Terms checkbox with links to /privacy and /terms

**Step 2 — Basic Info:**
- Name (pre-filled from Google auth)
- Phone (numeric keypad, required, validate Indian number +91)
- WhatsApp (checkbox "Same as phone", if unchecked show separate field)

**Step 3 — Services:**
- Visual category grid (same as homepage but single-select)
- After selecting category, show "Add service" form:
  - Title (text)
  - Description (textarea, optional)
  - Price (number)
  - Price type (radio: Fixed / Hourly / Negotiable)
- "Add another service" button
- Minimum 1 service required to proceed

**Step 4 — Location:**
- Area dropdown (from PILOT_AREAS)
- Address text field (placeholder: "e.g. Ward 5, near State Bank, Station Road")
- PIN code (6 digits, optional)
- Submit button
- On submit: API call to `/api/providers/register` → shows success screen

**After submit:** Provider doc status = "pending_approval". Show message in current language. Push notification sent to admin.

#### 5. Provider Dashboard (`/dashboard`)
- Top: Availability toggle (Available / Busy / Offline) — large toggle, one-tap
- My Services list — each item editable/deletable
- "Add Service" button
- If status = "pending_approval": Show yellow banner "আপনার অ্যাকাউন্ট অনুমোদনের অপেক্ষায় আছে"
- If status = "rejected": Show red banner with message

#### 6. Add/Edit Service (`/services/new`, `/services/[id]/edit`)
- Category (read-only, from profile)
- Subcategory (text input)
- Title
- Description
- Price
- Price type
- Save/Cancel buttons

### ADMIN SCREENS (Auth + Admin Role Required)

#### 7. Admin Dashboard (`/admin`)
- Tab: Pending Providers — list of providers with status "pending_approval"
  - Each row: Name, phone, area, category, registration date
  - Action buttons: Approve / Reject
- Tab: All Providers — full list with status filter

#### 8. Seed Provider (`/admin/seed`)
- Form to create provider on behalf (skips approval):
  - Name, phone, WhatsApp, area, address, category
  - Services (title + price + type)
  - Submit → creates provider with status "approved" and source "seeded"

---

## Analytics Events

Track these from both web and mobile:

```typescript
type AnalyticsEvent =
  | { name: "search_performed"; params: { query: string; language: string; resultsCount: number } }
  | { name: "category_tapped"; params: { categorySlug: string } }
  | { name: "provider_viewed"; params: { providerId: string; categorySlug: string } }
  | { name: "call_tapped"; params: { providerId: string } }
  | { name: "whatsapp_tapped"; params: { providerId: string } }
  | { name: "share_tapped"; params: { providerId: string; platform: "whatsapp" | "facebook" } }
  | { name: "provider_signup_started"; params: { step: number } }
  | { name: "provider_signup_completed"; params: { providerId: string } }
  | { name: "service_added"; params: { categorySlug: string; priceType: string } }
  | { name: "availability_toggled"; params: { newStatus: string } }
  | { name: "admin_approved"; params: { providerId: string } }
  | { name: "admin_rejected"; params: { providerId: string } }
  | { name: "language_switched"; params: { from: string; to: string } }
  | { name: "area_selected"; params: { area: string } };
```

---

## Environment Variables

### web/.env.local
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=indaspro-80195.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=indaspro-80195
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (for API routes)
FIREBASE_ADMIN_PROJECT_ID=indaspro-80195
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# App config
NEXT_PUBLIC_APP_URL=https://indaspro.vercel.app
NEXT_PUBLIC_DEFAULT_AREA=bankura
```

### mobile/.env
```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=indaspro-80195.firebaseapp.com
FIREBASE_PROJECT_ID=indaspro-80195
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
API_BASE_URL=https://indaspro.vercel.app/api
```

---

## Design Tokens

### Colors
```
Primary:        #2563EB (blue-600) — trust, reliability
Primary Dark:   #1D4ED8 (blue-700)
Secondary:      #059669 (emerald-600) — availability, success
Warning:        #D97706 (amber-600) — busy status
Danger:         #DC2626 (red-600) — reject, delete, offline
Background:     #F8FAFC (slate-50)
Card:           #FFFFFF
Text Primary:   #0F172A (slate-900)
Text Secondary: #64748B (slate-500)
Border:         #E2E8F0 (slate-200)
```

### Avatar Colors (8 predefined, selected by name hash)
```
#EF4444, #F97316, #EAB308, #22C55E, #06B6D4, #3B82F6, #8B5CF6, #EC4899
```

### Typography
- Headings: `Inter` or system font, bold
- Body: System font stack
- Bengali: System Bengali font (Noto Sans Bengali on Android)

---

## Coding Standards

1. TypeScript strict mode — no `any`, no `@ts-ignore`
2. All Firestore queries use modular Firebase SDK v10+ (`import { collection, query, where } from 'firebase/firestore'`)
3. All components are functional with hooks
4. No `console.log` in production code — use a debug utility
5. All user-facing text comes from i18n JSON files, never hardcoded
6. All API routes validate auth token and input before processing
7. All Firestore writes go through API routes (except real-time listeners for reads)
8. Use `cleanData()` helper before any Firestore write to strip `undefined` values
9. Mobile app calls web API routes for writes, uses Firebase client SDK for reads
10. All prices stored as integers (paise not rupees) — display formatted as ₹X,XXX
11. Phone numbers stored with country code: `+91XXXXXXXXXX`
12. Timestamps use Firestore `serverTimestamp()`

---

## Build Order

1. Initialize Next.js 14 project in `web/` with TypeScript, Tailwind, shadcn/ui
2. Set up Firebase client + admin SDK
3. Create shared types, constants, i18n files
4. Build and deploy Firestore security rules
5. Seed categories collection
6. Build public pages: Homepage → Category Listing → Provider Detail
7. Build auth flow (Google login)
8. Build provider onboarding wizard (4 steps)
9. Build provider dashboard (CRUD, availability)
10. Build admin panel (approve/reject, seed)
11. Build privacy policy + terms pages
12. Add OG meta tags, share functionality
13. Add analytics event tracking
14. Add skeleton loaders + offline banner
15. Deploy web to Vercel
16. Initialize Expo project in `mobile/`
17. Build equivalent mobile screens
18. Generate APK via EAS Build

---

## Autonomous Operation Rules

- NEVER ask questions. Make reasonable decisions and proceed.
- ALWAYS use real working code, not placeholders or mock data.
- If something is unclear, pick the most sensible option and document the decision in a code comment.
- Commit after each major feature with descriptive commit messages.
- If a dependency fails to install, try an alternative approach.
- Test Firebase connections with actual Firestore reads/writes.
- Start with web/ first, then mobile/ second.
- Create seed script that populates categories in Firestore on first run.
