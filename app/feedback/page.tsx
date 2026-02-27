import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function FeedbackPage() {
  async function submitFeedback(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    await supabase.from('feedback').insert({
      user_id: user.id,
      message: formData.get('message') as string,
    })

    redirect('/feedback/sent')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-6 py-4">
        <Link href="/dashboard" className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
          ← Back
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-2">Feedback</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">Bug reports, feature ideas, questions, or requests to delete your account — send them here.</p>

        {!user ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">Please <Link href="/login" className="text-emerald-600 underline">sign in</Link> to send feedback.</p>
        ) : (
          <form action={submitFeedback} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-6 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Your message</label>
              <textarea
                name="message"
                rows={6}
                required
                placeholder="What's on your mind?"
                className="w-full border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none placeholder:text-stone-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg py-2 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors"
            >
              Send Feedback
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
