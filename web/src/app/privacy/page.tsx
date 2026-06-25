export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-slate-500 text-sm mb-8">Last updated: June 2025</p>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Information We Collect</h2>
          <p>When service providers register on Indaspro, we collect:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Name and profile photo (from Google login)</li>
            <li>Phone number and WhatsApp number</li>
            <li>Address and service area</li>
            <li>Service offerings and pricing</li>
          </ul>
          <p className="mt-2">Visitors browsing the platform do not need to register or share any personal information.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To display your profile to potential customers</li>
            <li>To send notifications about your account status</li>
            <li>To improve our platform and user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Information Sharing</h2>
          <p>Your contact information (phone and WhatsApp) is publicly visible on your profile so customers can reach you directly. We do not sell your data to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Data Security</h2>
          <p>We use Google Firebase to securely store your data. All data is encrypted in transit and at rest.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Your Rights</h2>
          <p>You can request deletion of your account and data by contacting us. Providers can update their profile information through the dashboard at any time.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Contact</h2>
          <p>For privacy concerns, contact us at: <a href="mailto:support@indaspro.in" className="text-blue-600 underline">support@indaspro.in</a></p>
        </section>

        <div className="border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>গোপনীয়তা নীতি (Bengali): Indaspro পরিষেবা প্রদানকারীদের নাম, ফোন নম্বর এবং ঠিকানা সংগ্রহ করে তাদের প্রোফাইল প্রদর্শনের জন্য। আমরা আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।</p>
        </div>
      </div>
    </div>
  );
}
