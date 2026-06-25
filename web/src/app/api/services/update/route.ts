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
    const { serviceId, subcategory, title, description, price, priceType } = await req.json();

    if (!serviceId || !title?.trim()) {
      return NextResponse.json({ error: "serviceId and title required" }, { status: 400 });
    }

    const svcRef = adminDb().collection("services").doc(serviceId);
    const svcSnap = await svcRef.get();
    if (!svcSnap.exists || svcSnap.data()?.providerId !== decoded.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await svcRef.update(cleanData({
      subcategory,
      title,
      description,
      price,
      priceType,
      updatedAt: FieldValue.serverTimestamp(),
    }));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
