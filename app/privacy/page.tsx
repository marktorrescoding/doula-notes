import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-stone-50 dark:bg-stone-950">
      <header className="shrink-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-6 py-4 flex items-center justify-between pt-safe">
        <Link href="/dashboard" className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
          ← Back
        </Link>
        <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Privacy Policy</span>
        <div className="w-16" />
      </header>

      <main className="flex-1 overflow-y-auto scroll-ios">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-8">
            <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 mb-2">Privacy Policy</h1>
            <p className="text-sm text-stone-400 dark:text-stone-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <section className="mb-8">
              <h2 className="text-base font-semibold text-stone-700 dark:text-stone-200 mb-2">What this app does</h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">Doula Notes is a private tool for doulas to record visit notes for their clients. It is not a medical records system and is not intended to replace clinical documentation.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-base font-semibold text-stone-700 dark:text-stone-200 mb-2">What data we store</h2>
              <ul className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed list-disc pl-5 space-y-1">
                <li>Your email address and encrypted password (used for login)</li>
                <li>Client names, phone numbers, and profile information you enter</li>
                <li>Session notes you create during visits</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-base font-semibold text-stone-700 dark:text-stone-200 mb-2">How data is stored</h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">Your data is stored in Supabase, a secure cloud database with encryption at rest and in transit. Each doula&apos;s data is isolated — you can only access your own clients and notes. We do not sell or share your data with any third parties.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-base font-semibold text-stone-700 dark:text-stone-200 mb-2">SMS and texting</h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">When you use the &quot;Finish Session&quot; feature, notes are sent via your device&apos;s standard SMS app. Standard SMS messages are not encrypted end-to-end. You should obtain your client&apos;s consent before texting them session notes, and only send information your client has agreed to receive this way.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-base font-semibold text-stone-700 dark:text-stone-200 mb-2">HIPAA</h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">Independent doulas are generally not covered entities under HIPAA. However, this app is designed with privacy best practices in mind. If you operate as part of a covered healthcare organization, please consult with your compliance officer before using this tool.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-base font-semibold text-stone-700 dark:text-stone-200 mb-2">Data retention and deletion</h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">You can delete individual clients, sessions, or notes at any time from within the app. To request full deletion of your account and all associated data, contact us using the feedback form.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-700 dark:text-stone-200 mb-2">Contact</h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">Questions about this policy? Use the <Link href="/feedback" className="text-emerald-600 dark:text-emerald-400 underline">feedback form</Link> to reach us.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
