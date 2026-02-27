import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: note } = await supabase
    .from('visit_notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!note) notFound()

  async function updateNote(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('visit_notes').update({
      client_name: formData.get('client_name') as string,
      visit_date: formData.get('visit_date') as string || null,
      notes: formData.get('notes') as string,
      phone: formData.get('phone') as string,
    }).eq('id', id)
    redirect('/dashboard')
  }

  async function deleteNote() {
    'use server'
    const supabase = await createClient()
    await supabase.from('visit_notes').delete().eq('id', id)
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
        <h2 className="text-xl font-semibold text-stone-800 mb-6">Edit Note</h2>

        <form action={updateNote} className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Client Name</label>
            <input
              name="client_name"
              type="text"
              defaultValue={note.client_name || ''}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Client Phone</label>
            <input
              name="phone"
              type="tel"
              defaultValue={note.phone || ''}
              placeholder="e.g. 555-867-5309"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Visit Date</label>
            <input
              name="visit_date"
              type="date"
              defaultValue={note.visit_date || ''}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
            <textarea
              name="notes"
              rows={8}
              defaultValue={note.notes || ''}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Save Changes
          </button>
        </form>

        <form action={deleteNote} className="mt-3">
          <button
            type="submit"
            className="w-full bg-red-50 text-red-600 border border-red-200 rounded-lg py-2 text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Delete Note
          </button>
        </form>

        {note.phone && (
          <a
            href={`sms:${note.phone}&body=${encodeURIComponent(
              `Hi ${note.client_name || 'there'}, here are your visit notes from ${note.visit_date ? new Date(note.visit_date + 'T00:00:00').toLocaleDateString() : 'today'}:\n\n${note.notes || ''}`
            )}`}
            className="mt-3 flex items-center justify-center w-full bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Finish Session — Text Notes to Client
          </a>
        )}
      </main>
    </div>
  )
}
