export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10" style={{ color: "var(--neu-text)" }}>
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm mb-8" style={{ color: "var(--neu-text-muted)" }}>Last updated: June 2025</p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--neu-accent)" }}>1. Acceptance of Terms</h2>
          <p>By using Indaspro, you agree to these Terms of Service. If you do not agree, please do not use our platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--neu-accent)" }}>2. Service Description</h2>
          <p>Indaspro is a hyperlocal marketplace that connects customers with local home service providers. We do not directly provide home services — we facilitate connections between customers and independent service providers.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--neu-accent)" }}>3. Provider Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate information about your services and pricing</li>
            <li>Respond to customer inquiries in a timely manner</li>
            <li>Maintain professional conduct with customers</li>
            <li>Update your availability status accurately</li>
            <li>Comply with all applicable local laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--neu-accent)" }}>4. Account Approval</h2>
          <p>Provider accounts are subject to admin review and approval. Indaspro reserves the right to approve, reject, or remove any provider account at our discretion.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--neu-accent)" }}>5. Prohibited Conduct</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Providing false or misleading information</li>
            <li>Using the platform for illegal activities</li>
            <li>Harassing or defrauding customers</li>
            <li>Creating multiple accounts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--neu-accent)" }}>6. Disclaimer</h2>
          <p>Indaspro is not responsible for the quality of services provided by listed providers. Customers are advised to verify provider credentials before hiring. All transactions and service agreements are directly between customers and providers.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--neu-accent)" }}>7. Changes to Terms</h2>
          <p>We may update these terms at any time. Continued use of Indaspro after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--neu-accent)" }}>8. Contact</h2>
          <p>For questions about these terms:{" "}
            <a href="mailto:indasapps@gmail.com" className="underline" style={{ color: "var(--neu-accent)" }}>
              indasapps@gmail.com
            </a>
          </p>
        </section>

        <div className="pt-6 text-sm" style={{ borderTop: "1px solid var(--neu-divider)", color: "var(--neu-text-muted)" }}>
          <p>শর্তাবলী (Bengali): Indaspro একটি মার্কেটপ্লেস যা গ্রাহকদের স্থানীয় পরিষেবা প্রদানকারীদের সাথে সংযুক্ত করে। আমরা সরাসরি কোনো পরিষেবা প্রদান করি না। পরিষেবা প্রদানকারীরা সঠিক তথ্য প্রদান এবং পেশাদার আচরণ বজায় রাখতে বাধ্য।</p>
        </div>
      </div>
    </div>
  );
}
