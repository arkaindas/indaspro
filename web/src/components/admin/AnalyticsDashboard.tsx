"use client";

import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { CATEGORIES } from "@/shared/constants/categories";
import type { Provider } from "@/shared/types/provider";
import type { Service } from "@/shared/types/service";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

// ── palette ──────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  approved: "#059669",
  pending_approval: "#D97706",
  rejected: "#DC2626",
};
const AVAIL_COLORS: Record<string, string> = {
  available: "#059669",
  busy: "#D97706",
  offline: "#94A3B8",
};
const BAR_COLOR = "#2563EB";

// ── types ─────────────────────────────────────────────────────────────────────
interface AnalyticsData {
  providers: Provider[];
  services: Service[];
}

// ── skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className: string }) {
  return <div className={`neu-skeleton rounded-xl ${className}`} />;
}

function ChartSkeleton() {
  return (
    <div className="neu-raised p-5" style={{ background: "#E8EDF2", borderRadius: "16px" }}>
      <Skeleton className="h-5 w-40 mb-4" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

// ── summary card ──────────────────────────────────────────────────────────────
function SummaryCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="neu-raised p-5 flex items-center gap-4" style={{ background: "#E8EDF2", borderRadius: "16px" }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${color}18` }}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold" style={{ color: "var(--neu-text)" }}>{value}</p>
        <p className="text-sm mt-0.5" style={{ color: "var(--neu-text-muted)" }}>{label}</p>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export function AnalyticsDashboard() {
  const [state, setState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function loadData() {
    setState("loading");
    setErrorMsg("");
    try {
      const [provSnap, svcSnap] = await Promise.all([
        getDocs(collection(db, "providers")),
        getDocs(collection(db, "services")),
      ]);
      setData({
        providers: provSnap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<Provider, "uid">) })),
        services: svcSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) })),
      });
      setState("loaded");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load analytics");
      setState("error");
    }
  }

  // ── idle state ──────────────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="neu-subtle w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#E8EDF2" }}>📊</div>
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: "var(--neu-text-muted)" }}>Click to load analytics data</p>
          <button
            onClick={loadData}
            className="px-6 py-2.5 font-semibold text-white transition-all active:scale-95"
            style={{ background: "var(--neu-accent)", borderRadius: "12px", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }}
          >
            Show Analytics
          </button>
        </div>
      </div>
    );
  }

  // ── error state ─────────────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="text-4xl">⚠️</span>
        <p className="text-sm" style={{ color: "var(--neu-danger)" }}>{errorMsg}</p>
        <button
          onClick={loadData}
          className="px-5 py-2 text-sm font-semibold text-white transition-all active:scale-95"
          style={{ background: "var(--neu-accent)", borderRadius: "12px", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ── loading state ───────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[0,1,2,3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0,1,2,3].map((i) => <ChartSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // ── loaded state ────────────────────────────────────────────────────────────
  const { providers, services } = data!;

  // summary counts
  const totalProviders = providers.length;
  const approvedCount = providers.filter((p) => p.status === "approved").length;
  const pendingCount = providers.filter((p) => p.status === "pending_approval").length;
  const totalServices = services.length;

  // category distribution (bar chart)
  const catMap: Record<string, number> = {};
  services.forEach((s) => { catMap[s.categorySlug] = (catMap[s.categorySlug] ?? 0) + 1; });
  const categoryData = CATEGORIES
    .filter((c) => catMap[c.slug])
    .map((c) => ({ name: c.name.split(" ")[0], full: c.name, count: catMap[c.slug] }))
    .sort((a, b) => b.count - a.count);

  // providers by status (pie)
  const statusData = [
    { name: "Approved", value: approvedCount, color: STATUS_COLORS.approved },
    { name: "Pending", value: pendingCount, color: STATUS_COLORS.pending_approval },
    { name: "Rejected", value: providers.filter((p) => p.status === "rejected").length, color: STATUS_COLORS.rejected },
  ].filter((d) => d.value > 0);

  // providers by area (horizontal bar)
  const areaMap: Record<string, number> = {};
  providers.forEach((p) => { if (p.area) areaMap[p.area] = (areaMap[p.area] ?? 0) + 1; });
  const areaData = Object.entries(areaMap)
    .map(([area, count]) => ({ name: area.charAt(0).toUpperCase() + area.slice(1), count }))
    .sort((a, b) => b.count - a.count);

  // availability (donut) — approved only
  const approved = providers.filter((p) => p.status === "approved");
  const availData = [
    { name: "Available", value: approved.filter((p) => p.availability === "available").length, color: AVAIL_COLORS.available },
    { name: "Busy", value: approved.filter((p) => p.availability === "busy").length, color: AVAIL_COLORS.busy },
    { name: "Offline", value: approved.filter((p) => p.availability === "offline").length, color: AVAIL_COLORS.offline },
  ].filter((d) => d.value > 0);

  return (
    <div>
      {/* refresh button */}
      <div className="flex justify-end mb-5">
        <button
          onClick={loadData}
          className="neu-subtle flex items-center gap-2 px-4 py-2 text-sm transition-all active:neu-pressed"
          style={{ background: "#E8EDF2", color: "var(--neu-text-muted)", borderRadius: "12px" }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard label="Total Providers" value={totalProviders} icon="👥" color="#2563EB" />
        <SummaryCard label="Approved" value={approvedCount} icon="✅" color="#059669" />
        <SummaryCard label="Total Services" value={totalServices} icon="🛠️" color="#8B5CF6" />
        <SummaryCard label="Pending Approvals" value={pendingCount} icon="⏳" color="#D97706" />
      </div>

      {/* charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* 1. services by category */}
        <div className="neu-raised p-5" style={{ background: "#E8EDF2", borderRadius: "16px" }}>
          <p className="font-semibold mb-4" style={{ color: "var(--neu-text)" }}>Services by Category</p>
          {categoryData.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: "var(--neu-text-muted)" }}>No services yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [value, "Services"]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={BAR_COLOR} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 2. providers by status */}
        <div className="neu-raised p-5" style={{ background: "#E8EDF2", borderRadius: "16px" }}>
          <p className="font-semibold mb-4" style={{ color: "var(--neu-text)" }}>Providers by Status</p>
          {statusData.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: "var(--neu-text-muted)" }}>No providers yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => [value, "Providers"]} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 3. providers by area */}
        <div className="neu-raised p-5" style={{ background: "#E8EDF2", borderRadius: "16px" }}>
          <p className="font-semibold mb-4" style={{ color: "var(--neu-text)" }}>Providers by Area</p>
          {areaData.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: "var(--neu-text-muted)" }}>No area data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, areaData.length * 36)}>
              <BarChart data={areaData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={(value) => [value, "Providers"]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {areaData.map((_, i) => <Cell key={i} fill={BAR_COLOR} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 4. availability (approved only) */}
        <div className="neu-raised p-5" style={{ background: "#E8EDF2", borderRadius: "16px" }}>
          <p className="font-semibold mb-1" style={{ color: "var(--neu-text)" }}>Availability Status</p>
          <p className="text-xs mb-3" style={{ color: "var(--neu-text-muted)" }}>Approved providers only</p>
          {availData.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: "var(--neu-text-muted)" }}>No approved providers yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={availData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {availData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => [value, "Providers"]} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}
