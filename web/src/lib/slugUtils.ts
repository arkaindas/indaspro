import type { Firestore } from "firebase-admin/firestore";

export function generateBaseSlug(displayName: string, categorySlug: string): string {
  return `${displayName}-${categorySlug}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-|-$/g, "");
}

export async function generateUniqueSlug(
  db: Firestore,
  displayName: string,
  categorySlug: string,
  excludeUid?: string
): Promise<string> {
  const base = generateBaseSlug(displayName, categorySlug);
  if (!base) return `provider-${Date.now()}`;

  const snap = await db.collection("providers").where("slug", "==", base).get();
  if (snap.empty || (excludeUid && snap.docs.every((d) => d.id === excludeUid))) {
    return base;
  }

  for (let n = 2; n <= 100; n++) {
    const candidate = `${base}-${n}`;
    const s = await db.collection("providers").where("slug", "==", candidate).get();
    if (s.empty) return candidate;
  }
  throw new Error("Could not generate unique slug");
}
