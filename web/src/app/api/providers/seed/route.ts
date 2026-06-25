import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cleanData } from "@/lib/cleanData";
import { FieldValue } from "firebase-admin/firestore";

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
    const adminUid = await requireAdmin(req);
    const { displayName, phone, whatsapp, area, address, categorySlug, services } = await req.json();

    if (!displayName || !phone || !area || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = adminDb();
    const providerRef = db.collection("providers").doc();
    const batch = db.batch();

    batch.set(providerRef, cleanData({
      uid: providerRef.id,
      displayName,
      phone,
      whatsapp: whatsapp || phone,
      email: "",
      photoURL: null,
      area,
      address,
      pinCode: null,
      status: "approved",
      availability: "available",
      role: "provider",
      source: "seeded",
      seededBy: adminUid,
      claimedAt: null,
      termsAcceptedAt: FieldValue.serverTimestamp(),
      onboardingStep: 4,
      createdAt: FieldValue.serverTimestamp(),
      approvedAt: FieldValue.serverTimestamp(),
    }));

    if (services?.length > 0) {
      for (const svc of services) {
        if (!svc.title?.trim()) continue;
        const svcRef = db.collection("services").doc();
        batch.set(svcRef, cleanData({
          providerId: providerRef.id,
          providerName: displayName,
          categorySlug: categorySlug ?? "electrician",
          subcategory: svc.subcategory ?? "",
          title: svc.title,
          description: "",
          price: svc.price ?? 0,
          priceType: svc.priceType ?? "fixed",
          priceUnit: "INR",
          isActive: true,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        }));
      }
    }

    await batch.commit();
    return NextResponse.json({ success: true, providerId: providerRef.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" || msg === "Forbidden" ? 403 : 500 });
  }
}
