import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!client) notFound()

  async function updateClient(formData: FormData) {
    'use server'
    const supabase = await createClient()
    await supabase.from('clients').update({
      name: formData.get('name') as string,
      phone: formData.get('phone') as string || null,
      partner_name: formData.get('partner_name') as string || null,
      birth_date: formData.get('birth_date') as string || null,
      due_date: formData.get('due_date') as string || null,
      preferences: formData.get('preferences') as string || null,
      next_visit_date: formData.get('next_visit_date') as string || null,
    }).eq('id', id)
    redirect(`/clients/${id}`)
  }

  const inputClass = "w-full border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder:text-stone-400"

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-stone-50 dark:bg-stone-950">
      <header className="shrink-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-6 py-4 pt-safe">
        <Link href={`/clients/${id}`} className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
          ← Back
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto scroll-ios"><div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-6">Edit Client</h2>

        <form action={updateClient} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Name <span className="text-red-400">*</span></label>
            <input name="name" type="text" required defaultValue={client.name} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Phone</label>
            <input name="phone" type="tel" defaultValue={client.phone || ''} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Partner Name</label>
            <input name="partner_name" type="text" defaultValue={client.partner_name || ''} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Baby&apos;s Birthday</label>
              <input name="birth_date" type="date" defaultValue={client.birth_date || ''} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Due Date</label>
              <input name="due_date" type="date" defaultValue={client.due_date || ''} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Next Visit</label>
            <input name="next_visit_date" type="date" defaultValue={client.next_visit_date || ''} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Preferences / Notes</label>
            <textarea name="preferences" rows={3} defaultValue={client.preferences || ''} placeholder="Feeding goals, sensitivities, anything to remember..." className={inputClass + ' resize-none'} />
          </div>

          <button
            type="submit"
            className="w-full bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg py-2 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors"
          >
            Save Changes
          </button>
        </form>
      <div className="pb-safe"></div></div></main>
    </div>
  )
}
