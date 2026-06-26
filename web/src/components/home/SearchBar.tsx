"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { useLang } from "@/lib/lang-context";
import { trackEvent } from "@/lib/analytics";
import { CATEGORIES } from "@/shared/constants/categories";
import type { Provider } from "@/shared/types/provider";
import type { Service } from "@/shared/types/service";

interface Suggestion {
  type: "category" | "provider" | "service";
  label: string;
  sublabel?: string;
  icon?: string;
  href: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetching, setFetching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t, lang } = useLang();

  // 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    if (debouncedValue.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const q = debouncedValue.toLowerCase();

    const categorySugs: Suggestion[] = CATEGORIES
      .filter((cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.nameBn.includes(debouncedValue) ||
        cat.searchTerms.some((term) => term.toLowerCase().includes(q))
      )
      .slice(0, 3)
      .map((cat) => ({
        type: "category",
        label: lang === "bn" ? cat.nameBn : cat.name,
        sublabel: lang === "bn" ? cat.name : cat.nameBn,
        icon: cat.icon,
        href: `/services/${cat.slug}`,
      }));

    setSuggestions(categorySugs);
    if (categorySugs.length > 0) setShowDropdown(true);

    setFetching(true);
    const controller = new AbortController();

    const fetchRemote = async () => {
      try {
        const [providerSnap, svcSnap] = await Promise.all([
          getDocs(query(collection(db, "providers"), where("status", "==", "approved"), limit(30))),
          getDocs(query(collection(db, "services"), where("isActive", "==", true), limit(30))),
        ]);

        if (controller.signal.aborted) return;

        const providerSugs: Suggestion[] = providerSnap.docs
          .filter((d) => {
            const data = d.data() as Provider;
            return (
              data.displayName?.toLowerCase().includes(q) ||
              data.address?.toLowerCase().includes(q)
            );
          })
          .slice(0, 3)
          .map((d) => {
            const data = d.data() as Provider;
            return { type: "provider" as const, label: data.displayName, sublabel: data.address, href: `/provider/${d.id}` };
          });

        const serviceSugs: Suggestion[] = svcSnap.docs
          .filter((d) => {
            const data = d.data() as Service;
            return data.title?.toLowerCase().includes(q) || data.subcategory?.toLowerCase().includes(q);
          })
          .slice(0, 2)
          .map((d) => {
            const data = d.data() as Service;
            return { type: "service" as const, label: data.title, sublabel: data.providerName, href: `/provider/${data.providerId}` };
          });

        const seenHrefs = new Set(providerSugs.map((s) => s.href));
        const deduplicatedServiceSugs = serviceSugs.filter((s) => !seenHrefs.has(s.href));
        const combined = [...categorySugs, ...providerSugs, ...deduplicatedServiceSugs].slice(0, 8);
        setSuggestions(combined);
        setShowDropdown(combined.length > 0);
      } catch {
        // category suggestions already set
      } finally {
        setFetching(false);
      }
    };

    fetchRemote();
    return () => controller.abort();
  }, [debouncedValue, lang]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      trackEvent({ name: "search_performed", params: { query: inputValue, language: lang, resultsCount: suggestions.length } });
      setShowDropdown(false);
      onSearch(inputValue.trim());
    }
  };

  const handleSuggestionClick = (s: Suggestion) => {
    setInputValue(s.label);
    setShowDropdown(false);
    router.push(s.href);
  };

  const categorySuggestions = suggestions.filter((s) => s.type === "category");
  const otherSuggestions = suggestions.filter((s) => s.type !== "category");

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
          size={18}
          style={{ color: "var(--neu-text-muted)" }}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onKeyDown={(e) => e.key === "Escape" && setShowDropdown(false)}
          placeholder={t("search.placeholder")}
          autoComplete="off"
          className="neu-pressed w-full pl-12 pr-10 py-3.5 text-base transition-all focus:outline-none focus:ring-2"
          style={{
            background: "#E8EDF2",
            borderRadius: "50px",
            border: "none",
            color: "var(--neu-text)",
            // @ts-ignore
            "--tw-ring-color": "var(--neu-accent)",
          }}
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => { setInputValue(""); setSuggestions([]); setShowDropdown(false); }}
            className="absolute right-5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
            style={{ color: "var(--neu-text-muted)" }}
          >
            <X size={16} />
          </button>
        )}
      </form>

      {showDropdown && (
        <div
          className="neu-raised absolute top-full mt-3 w-full z-50 overflow-hidden"
          style={{ background: "#E8EDF2", borderRadius: "20px" }}
        >
          {categorySuggestions.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--neu-text-muted)" }}>
                Categories
              </p>
              {categorySuggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:opacity-80"
                  style={{ background: "transparent" }}
                >
                  <span className="text-xl w-8 text-center">{s.icon}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--neu-text)" }}>{s.label}</p>
                    {s.sublabel && <p className="text-xs" style={{ color: "var(--neu-text-muted)" }}>{s.sublabel}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {otherSuggestions.length > 0 && (
            <div className={categorySuggestions.length > 0 ? "border-t border-[#d1d9e0]" : ""}>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--neu-text-muted)" }}>
                Providers
              </p>
              {otherSuggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:opacity-80"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ background: "var(--neu-accent)", color: "#ffffff", opacity: 0.85 }}
                  >
                    {s.label[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--neu-text)" }}>{s.label}</p>
                    {s.sublabel && <p className="text-xs truncate" style={{ color: "var(--neu-text-muted)" }}>{s.sublabel}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {fetching && suggestions.length === 0 && (
            <p className="px-4 py-3 text-sm" style={{ color: "var(--neu-text-muted)" }}>Searching…</p>
          )}
        </div>
      )}
    </div>
  );
}
