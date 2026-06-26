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

  // Build and show suggestions when debounced value changes
  useEffect(() => {
    if (debouncedValue.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const q = debouncedValue.toLowerCase();

    // Category suggestions — local, instant
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

    // Show category results immediately while Firestore loads
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

        const providerSugs: Suggestion[] = (providerSnap.docs as typeof providerSnap.docs)
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
            return {
              type: "provider" as const,
              label: data.displayName,
              sublabel: data.address,
              href: `/provider/${d.id}`,
            };
          });

        const serviceSugs: Suggestion[] = (svcSnap.docs as typeof svcSnap.docs)
          .filter((d) => {
            const data = d.data() as Service;
            return (
              data.title?.toLowerCase().includes(q) ||
              data.subcategory?.toLowerCase().includes(q)
            );
          })
          .slice(0, 2)
          .map((d) => {
            const data = d.data() as Service;
            return {
              type: "service" as const,
              label: data.title,
              sublabel: data.providerName,
              href: `/provider/${data.providerId}`,
            };
          });

        const seenHrefs = new Set(providerSugs.map((s) => s.href));
        const deduplicatedServiceSugs = serviceSugs.filter((s) => !seenHrefs.has(s.href));
        const combined = [...categorySugs, ...providerSugs, ...deduplicatedServiceSugs].slice(0, 8);
        setSuggestions(combined);
        setShowDropdown(combined.length > 0);
      } catch {
        // Firestore unavailable — category suggestions already set
      } finally {
        setFetching(false);
      }
    };

    fetchRemote();
    return () => controller.abort();
  }, [debouncedValue, lang]);

  // Close on outside click
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
      trackEvent({
        name: "search_performed",
        params: { query: inputValue, language: lang, resultsCount: suggestions.length },
      });
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
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={20}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onKeyDown={(e) => e.key === "Escape" && setShowDropdown(false)}
          placeholder={t("search.placeholder")}
          className="w-full pl-12 pr-10 py-3.5 text-base rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              setSuggestions([]);
              setShowDropdown(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-slate-100 z-50 overflow-hidden">
          {categorySuggestions.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Categories
              </p>
              {categorySuggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-left transition-colors"
                >
                  <span className="text-xl w-8 text-center">{s.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{s.label}</p>
                    {s.sublabel && (
                      <p className="text-xs text-slate-400">{s.sublabel}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {otherSuggestions.length > 0 && (
            <div className={categorySuggestions.length > 0 ? "border-t border-slate-100" : ""}>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Providers
              </p>
              {otherSuggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0">
                    {s.label[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{s.label}</p>
                    {s.sublabel && (
                      <p className="text-xs text-slate-400 truncate">{s.sublabel}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {fetching && suggestions.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-400">Searching...</p>
          )}
        </div>
      )}
    </div>
  );
}
