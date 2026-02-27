import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewNotePage() {
  async function createNote(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    await supabase.from('visit_notes').insert({
      user_id: user.id,
      client_name: formData.get('client_name') as string,
      visit_date: formData.get('visit_date') as string || null,
      notes: formData.get('notes') as string,
      phone: formData.get('phone') as string,
    })

    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
          ← Back
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-stone-800 mb-6">New Visit Note</h2>

        <form action={createNote} className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Client Name</label>
            <input
              name="client_name"
              type="text"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Client Phone</label>
            <input
              name="phone"
              type="tel"
              placeholder="e.g. 555-867-5309"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Visit Date</label>
            <input
              name="visit_date"
              type="date"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
            <textarea
              name="notes"
              rows={8}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Save Note
          </button>
        </form>
      </main>
    </div>
  )
}
