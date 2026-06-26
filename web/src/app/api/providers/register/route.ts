import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cleanData } from "@/lib/cleanData";
import { generateUniqueSlug } from "@/lib/slugUtils";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = await adminAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const body = await req.json();
    const { displayName, phone, whatsapp, address, pinCode, categorySlug, services, termsAcceptedAt } = body;

    if (!displayName || !phone || !address || !categorySlug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = adminDb();
    const slug = await generateUniqueSlug(db, displayName, categorySlug, uid);
    const batch = db.batch();

    const providerRef = db.collection("providers").doc(uid);
    batch.set(providerRef, cleanData({
      uid,
      slug,
      displayName,
      phone,
      whatsapp,
      email: decoded.email ?? "",
      photoURL: decoded.picture ?? null,
      address,
      pinCode: pinCode ?? null,
      status: "pending_approval",
      availability: "available",
      role: "provider",
      source: "self",
      seededBy: null,
      claimedAt: null,
      termsAcceptedAt: new Date(termsAcceptedAt),
      onboardingStep: 4,
      createdAt: FieldValue.serverTimestamp(),
      approvedAt: null,
    }));

    if (services?.length > 0) {
      for (const svc of services) {
        if (!svc.title?.trim()) continue;
        const svcRef = db.collection("services").doc();
        batch.set(svcRef, cleanData({
          providerId: uid,
          providerName: displayName,
          categorySlug,
          subcategory: svc.subcategory ?? "",
          title: svc.title,
          description: svc.description ?? "",
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

    // Notify admins
    try {
      const adminsSnap = await db.collection("admins").get();
      const tokens: string[] = [];
      adminsSnap.docs.forEach((d) => {
        const adminData = d.data();
        if (adminData.fcmTokens?.length) tokens.push(...adminData.fcmTokens);
      });

      if (tokens.length > 0) {
        const { adminMessaging } = await import("@/lib/firebase-admin");
        await adminMessaging().sendEachForMulticast({
          tokens,
          notification: { title: "New provider registration", body: `${displayName} has registered` },
        });
      }
    } catch {
      // Notification failure is non-fatal
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
