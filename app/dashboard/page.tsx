import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/actions'
import ClientList from './ClientList'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [{ data: clients }, { data: todaySessions }] = await Promise.all([
    supabase.from('clients').select('*').order('name', { ascending: true }),
    supabase.from('sessions').select('id, client_id').eq('session_date', today).is('completed_at', null),
  ])

  const activeSessionMap = Object.fromEntries(
    (todaySessions ?? []).map(s => [s.client_id, s.id])
  )

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-100">Doula Notes</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-400">{user.email}</span>
          <form action={signOut}>
            <button className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100">Clients</h2>
          <Link
            href="/clients/new"
            className="bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors"
          >
            + Add Client
          </Link>
        </div>

        {clients && clients.length > 0 ? (
          <ClientList clients={clients} activeSessionMap={activeSessionMap} />
        ) : (
          <div className="text-center py-16 text-stone-400">
            <p className="text-lg">No clients yet</p>
            <p className="text-sm mt-1">Add your first client to get started</p>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 flex items-center justify-center gap-6">
          <Link href="/settings/categories" className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
            Note Categories
          </Link>
          <Link href="/feedback" className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
            Feedback
          </Link>
          <Link href="/privacy" className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </main>
    </div>
  )
}
