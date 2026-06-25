import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cleanData } from "@/lib/cleanData";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = await adminAuth().verifyIdToken(token);

    const providerSnap = await adminDb().collection("providers").doc(decoded.uid).get();
    if (!providerSnap.exists || providerSnap.data()?.status !== "approved") {
      return NextResponse.json({ error: "Provider not approved" }, { status: 403 });
    }

    const { categorySlug, subcategory, title, description, price, priceType } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const svcRef = adminDb().collection("services").doc();
    await svcRef.set(cleanData({
      providerId: decoded.uid,
      providerName: providerSnap.data()!.displayName,
      categorySlug,
      subcategory: subcategory ?? "",
      title,
      description: description ?? "",
      price: price ?? 0,
      priceType: priceType ?? "fixed",
      priceUnit: "INR",
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }));

    return NextResponse.json({ success: true, serviceId: svcRef.id });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
