"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
  documentId,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import type { Provider } from "@/shared/types/provider";
import type { Service } from "@/shared/types/service";

export function useProvidersByCategory(categorySlug: string) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query services first — only providers with services in this category should appear
    const svcQuery = query(
      collection(db, "services"),
      where("categorySlug", "==", categorySlug),
      where("isActive", "==", true)
    );

    const unsubscribe = onSnapshot(svcQuery, async (svcSnap) => {
      const svcList = svcSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Service));
      const uniqueProviderIds = [...new Set(svcList.map((s) => s.providerId))];

      if (uniqueProviderIds.length === 0) {
        setProviders([]);
        setServices([]);
        setLoading(false);
        return;
      }

      // Fetch provider docs by ID — batch in groups of 30 (Firestore "in" limit)
      const fetchBatch = (ids: string[]) =>
        getDocs(query(collection(db, "providers"), where(documentId(), "in", ids)));

      const results = await Promise.all(
        Array.from({ length: Math.ceil(uniqueProviderIds.length / 30) }, (_, i) =>
          fetchBatch(uniqueProviderIds.slice(i * 30, i * 30 + 30))
        )
      );

      const allProviders: Provider[] = results.flatMap((snap) =>
        snap.docs.map((d) => ({
          uid: d.id,
          ...(d.data() as Omit<Provider, "uid">),
        }))
      );

      const filtered = allProviders.filter((p) => p.status === "approved");

      setProviders(filtered);
      // Only return services whose provider passed the filter
      const filteredIds = new Set(filtered.map((p) => p.uid));
      setServices(svcList.filter((s) => filteredIds.has(s.providerId)));
      setLoading(false);
    });

    return unsubscribe;
  }, [categorySlug, area]);

  return { providers, services, loading };
}

export function useProviderServices(providerId: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) { setLoading(false); return; }

    const q = query(
      collection(db, "services"),
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service)));
      setLoading(false);
    });

    return unsubscribe;
  }, [providerId]);

  return { services, loading };
}
