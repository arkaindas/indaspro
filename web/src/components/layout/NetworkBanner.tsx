"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useLang } from "@/lib/lang-context";

export function NetworkBanner() {
  const isOnline = useOnlineStatus();
  const { t } = useLang();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white text-sm text-center py-2 px-4">
      {t("common.offline")}
    </div>
  );
}
