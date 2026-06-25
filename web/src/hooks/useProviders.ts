"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import type { Provider } from "@/shared/types/provider";
import type { Service } from "@/shared/types/service";

export function useProvidersByCategory(categorySlug: string, area: string) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints = [where("status", "==", "approved")];
    if (area) constraints.push(where("area", "==", area));

    const q = query(collection(db, "providers"), ...constraints);

    const unsubscribe = onSnapshot(q, async (snap) => {
      const providerList = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as Provider));
      setProviders(providerList);

      if (providerList.length > 0) {
        const providerIds = providerList.map((p) => p.uid);
        const svcQuery = query(
          collection(db, "services"),
          where("categorySlug", "==", categorySlug),
          where("providerId", "in", providerIds.slice(0, 10)),
          where("isActive", "==", true)
        );
        const svcSnap = await import("firebase/firestore").then(({ getDocs }) => getDocs(svcQuery));
        setServices(svcSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Service)));
      } else {
        setServices([]);
      }

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
