import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{ background: "#E8EDF2", boxShadow: "0 -4px 8px #c8cdd2" }}
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
