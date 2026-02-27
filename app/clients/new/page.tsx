import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewClientPage() {
  async function createClientAction(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    await supabase.from('clients').insert({
      user_id: user.id,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string || null,
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
        <h2 className="text-xl font-semibold text-stone-800 mb-6">Add Client</h2>

        <form action={createClientAction} className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              placeholder="e.g. 555-867-5309"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Save Client
          </button>
        </form>
      </main>
    </div>
  )
}
