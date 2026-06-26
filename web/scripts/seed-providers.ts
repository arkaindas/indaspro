/**
 * One-time bulk provider seed script.
 *
 * Prerequisites (from web/ directory):
 *   npm install -D ts-node dotenv      ← already added to devDependencies
 *
 * Run:
 *   cd web
 *   npx ts-node --project scripts/tsconfig.scripts.json scripts/seed-providers.ts
 *
 * Reads:  scripts/seed-data.json
 * Writes: Firestore collections — providers, services
 * Skips:  providers whose phone number already exists in Firestore
 */

import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ── env ──────────────────────────────────────────────────────────────────────

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const { FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY } = process.env;

if (!FIREBASE_ADMIN_PROJECT_ID || !FIREBASE_ADMIN_CLIENT_EMAIL || !FIREBASE_ADMIN_PRIVATE_KEY) {
  console.error(
    "❌  Missing env vars. Ensure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL " +
    "and FIREBASE_ADMIN_PRIVATE_KEY are set in web/.env.local"
  );
  process.exit(1);
}

// ── firebase init ─────────────────────────────────────────────────────────────

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// ── types ─────────────────────────────────────────────────────────────────────

interface SeedService {
  subcategory: string;
  title: string;
  description: string;
  price: number;
  priceType: "fixed" | "hourly" | "negotiable";
}

interface SeedProvider {
  displayName: string;
  phone: string;
  whatsapp: string;
  address: string;
  area: string;
  pinCode: string | null;
  categorySlug: string;
  services: SeedService[];
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function phoneExists(phone: string): Promise<boolean> {
  const snap = await db.collection("providers").where("phone", "==", phone).limit(1).get();
  return !snap.empty;
}

async function seedProvider(p: SeedProvider, index: number, total: number): Promise<"seeded" | "skipped" | "failed"> {
  const tag = `[${index}/${total}] ${p.displayName} (${p.phone})`;

  if (await phoneExists(p.phone)) {
    console.log(`⏭  Skip   ${tag} — phone already exists`);
    return "skipped";
  }

  try {
    const now = FieldValue.serverTimestamp();
    const batch = db.batch();

    const provRef = db.collection("providers").doc();

    batch.set(provRef, {
      uid: provRef.id,
      displayName: p.displayName,
      phone: p.phone,
      whatsapp: p.whatsapp,
      email: "",
      photoURL: null,
      address: p.address,
      area: p.area,
      pinCode: p.pinCode ?? null,
      status: "approved",
      availability: "available",
      role: "provider",
      source: "seeded",
      seededBy: null,
      claimedAt: null,
      termsAcceptedAt: now,
      onboardingStep: 4,
      createdAt: now,
      approvedAt: now,
    });

    for (const svc of p.services) {
      const svcRef = db.collection("services").doc();
      batch.set(svcRef, {
        id: svcRef.id,
        providerId: provRef.id,
        providerName: p.displayName,
        categorySlug: p.categorySlug,
        subcategory: svc.subcategory,
        title: svc.title,
        description: svc.description,
        price: svc.price,
        priceType: svc.priceType,
        priceUnit: "INR",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    await batch.commit();
    console.log(`✅ Seeded  ${tag} — ${p.services.length} service(s) in [${p.categorySlug}]`);
    return "seeded";
  } catch (err) {
    console.error(`❌ Failed  ${tag}`, err instanceof Error ? err.message : err);
    return "failed";
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  const dataPath = path.resolve(__dirname, "seed-data.json");

  if (!fs.existsSync(dataPath)) {
    console.error(`❌  seed-data.json not found at ${dataPath}`);
    process.exit(1);
  }

  const providers: SeedProvider[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const total = providers.length;

  console.log(`\n🌱  Starting seed — ${total} provider(s) in seed-data.json\n`);

  let seeded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < providers.length; i++) {
    const result = await seedProvider(providers[i]!, i + 1, total);
    if (result === "seeded") seeded++;
    else if (result === "skipped") skipped++;
    else failed++;
  }

  console.log(`
──────────────────────────────────
  Seeded:  ${seeded}
  Skipped: ${skipped}
  Failed:  ${failed}
  Total:   ${total}
──────────────────────────────────`);

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
