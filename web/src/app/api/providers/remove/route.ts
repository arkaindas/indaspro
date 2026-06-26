import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const token = authHeader.slice(7);
  const decoded = await adminAuth().verifyIdToken(token);
  const adminSnap = await adminDb().collection("admins").doc(decoded.uid).get();
  if (!adminSnap.exists) throw new Error("Forbidden");
  return decoded.uid;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { providerId } = await req.json();
    if (!providerId) return NextResponse.json({ error: "Missing providerId" }, { status: 400 });

    const db = adminDb();

    // Delete all services for this provider
    const servicesSnap = await db.collection("services").where("providerId", "==", providerId).get();
    const batch = db.batch();
    servicesSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(db.collection("providers").doc(providerId));
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" || msg === "Forbidden" ? 403 : 500 });
  }
}
