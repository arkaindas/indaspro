export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
      <span className="text-4xl">📡</span>
      <h1 className="text-lg font-semibold">ইন্টারনেট সংযোগ নেই</h1>
      <p className="text-sm text-muted-foreground">
        অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।
      </p>
    </main>
  );
}
