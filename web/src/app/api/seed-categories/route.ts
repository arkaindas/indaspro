import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const CATEGORIES = [
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

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const decoded = await adminAuth().verifyIdToken(token);
    const adminSnap = await adminDb().collection("admins").doc(decoded.uid).get();
    if (!adminSnap.exists) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const db = adminDb();
    const batch = db.batch();
    for (const cat of CATEGORIES) {
      batch.set(db.collection("categories").doc(cat.slug), cat, { merge: true });
    }
    await batch.commit();
    return NextResponse.json({ success: true, count: CATEGORIES.length });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
