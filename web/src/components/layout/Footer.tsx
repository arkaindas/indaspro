import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{ background: "var(--neu-bg)", boxShadow: "0 -4px 8px var(--neu-shadow-dark)" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm" style={{ color: "var(--neu-text-muted)" }}>
        <p>© {new Date().getFullYear()} Indaspro. All rights reserved.</p>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy Policy</Link>
          <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms of Service</Link>
        </nav>
      </div>
    </footer>
  );
}
