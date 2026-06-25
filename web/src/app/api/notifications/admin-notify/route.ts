import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, adminMessaging } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    await adminAuth().verifyIdToken(token);

    const { title, body } = await req.json();
    if (!title || !body) return NextResponse.json({ error: "title and body required" }, { status: 400 });

    const adminsSnap = await adminDb().collection("admins").get();
    const tokens: string[] = [];
    adminsSnap.docs.forEach((d) => {
      const data = d.data();
      if (data.fcmTokens?.length) tokens.push(...data.fcmTokens);
    });

    if (tokens.length === 0) return NextResponse.json({ success: true, sent: 0 });

    const result = await adminMessaging().sendEachForMulticast({ tokens, notification: { title, body } });
    return NextResponse.json({ success: true, sent: result.successCount });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
