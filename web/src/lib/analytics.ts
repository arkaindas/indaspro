"use client";

type AnalyticsEvent =
  | { name: "search_performed"; params: { query: string; language: string; resultsCount: number } }
  | { name: "category_tapped"; params: { categorySlug: string } }
  | { name: "provider_viewed"; params: { providerId: string; categorySlug: string } }
  | { name: "call_tapped"; params: { providerId: string } }
  | { name: "whatsapp_tapped"; params: { providerId: string } }
  | { name: "share_tapped"; params: { providerId: string; platform: "whatsapp" | "facebook" } }
  | { name: "provider_signup_started"; params: { step: number } }
  | { name: "provider_signup_completed"; params: { providerId: string } }
  | { name: "service_added"; params: { categorySlug: string; priceType: string } }
  | { name: "availability_toggled"; params: { newStatus: string } }
  | { name: "admin_approved"; params: { providerId: string } }
  | { name: "admin_rejected"; params: { providerId: string } }
  | { name: "language_switched"; params: { from: string; to: string } }
  | { name: "area_selected"; params: { area: string } };

export function trackEvent(event: AnalyticsEvent) {
  if (process.env.NODE_ENV === "development") return;
  if (typeof window === "undefined") return;
  const win = window as typeof window & { gtag?: (event: string, name: string, params: Record<string, unknown>) => void };
  if (win.gtag) {
    win.gtag("event", event.name, event.params as Record<string, unknown>);
  }
}
