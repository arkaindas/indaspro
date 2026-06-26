import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { generateUniqueSlug } from "@/lib/slugUtils";

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const token = authHeader.slice(7);
  const decoded = await adminAuth().verifyIdToken(token);
  const adminSnap = await adminDb().collection("admins").doc(decoded.uid).get();
  if (!adminSnap.exists) throw new Error("Forbidden");
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const db = adminDb();

    // Find providers without a slug
    const snap = await db.collection("providers").get();
    const missing = snap.docs.filter((d) => !d.data().slug);

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const provDoc of missing) {
      try {
        const data = provDoc.data();
        const displayName: string = data.displayName ?? "provider";

        // Find the provider's primary category from their services
        const svcSnap = await db
          .collection("services")
          .where("providerId", "==", provDoc.id)
          .limit(1)
          .get();
        const categorySlug: string = svcSnap.docs[0]?.data()?.categorySlug ?? "provider";

        const slug = await generateUniqueSlug(db, displayName, categorySlug, provDoc.id);
        await provDoc.ref.update({ slug });
        updated++;
      } catch (err) {
        failed++;
        errors.push(`${provDoc.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return NextResponse.json({ success: true, total: missing.length, updated, failed, errors });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" || msg === "Forbidden" ? 403 : 500 });
  }
}
