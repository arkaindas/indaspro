import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProviderDetailClient } from "./ProviderDetailClient";
import type { Provider } from "@/shared/types/provider";
import type { Service } from "@/shared/types/service";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const snap = await getDoc(doc(db, "providers", id));
  if (!snap.exists()) return {};
  const p = snap.data() as Provider;
  return {
    title: `${p.displayName} — Indaspro`,
    description: `Home services by ${p.displayName} in ${p.area}`,
    openGraph: {
      title: `${p.displayName} — Indaspro`,
      description: `Home services by ${p.displayName} in ${p.area}`,
      images: ["/og-banner.png"],
    },
  };
}

export default async function ProviderDetailPage({ params }: Props) {
  const { id } = await params;
  const snap = await getDoc(doc(db, "providers", id));
  if (!snap.exists()) notFound();

  const provider = { uid: snap.id, ...snap.data() } as Provider;

  const svcSnap = await getDocs(
    query(collection(db, "services"), where("providerId", "==", id), where("isActive", "==", true))
  );
  const services = svcSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Service));

  return <ProviderDetailClient provider={provider} services={services} />;
}
