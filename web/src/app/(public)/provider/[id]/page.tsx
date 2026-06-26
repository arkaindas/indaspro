import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProviderDetailClient } from "./ProviderDetailClient";
import type { Provider } from "@/shared/types/provider";
import type { Service } from "@/shared/types/service";

interface Props { params: Promise<{ id: string }> }

async function fetchProvider(slug: string): Promise<{ provider: Provider; docId: string } | null> {
  // Try slug lookup first
  const slugSnap = await getDocs(
    query(collection(db, "providers"), where("slug", "==", slug))
  );
  if (!slugSnap.empty) {
    const d = slugSnap.docs[0];
    return { provider: { uid: d.id, ...d.data() } as Provider, docId: d.id };
  }
  // Fallback: treat as UID for backward compatibility
  const uidSnap = await getDoc(doc(db, "providers", slug));
  if (uidSnap.exists()) {
    return { provider: { uid: uidSnap.id, ...uidSnap.data() } as Provider, docId: uidSnap.id };
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchProvider(id);
  if (!result) return {};
  const { provider: p } = result;
  return {
    title: `${p.displayName} — Indaspro`,
    description: `Home services by ${p.displayName} in ${p.area ?? "your area"}`,
    openGraph: {
      title: `${p.displayName} — Indaspro`,
      description: `Home services by ${p.displayName} in ${p.area ?? "your area"}`,
      images: ["/og-banner.png"],
    },
  };
}

export default async function ProviderDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await fetchProvider(id);
  if (!result) notFound();

  const { provider, docId } = result;
  const svcSnap = await getDocs(
    query(collection(db, "services"), where("providerId", "==", docId), where("isActive", "==", true))
  );
  const services = svcSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Service));

  return <ProviderDetailClient provider={provider} services={services} />;
}
