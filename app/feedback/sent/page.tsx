import Link from 'next/link'

export default function FeedbackSentPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-2">Thanks for your feedback</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">We&apos;ll review it and follow up if needed.</p>
        <Link href="/dashboard" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
