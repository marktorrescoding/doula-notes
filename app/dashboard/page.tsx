import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut, startSession } from '@/app/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-stone-800">Doula Notes</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-400">{user.email}</span>
          <form action={signOut}>
            <button className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-stone-800">Clients</h2>
          <Link
            href="/clients/new"
            className="bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
          >
            + Add Client
          </Link>
        </div>

        {clients && clients.length > 0 ? (
          <div className="flex flex-col gap-3">
            {clients.map(client => (
              <div
                key={client.id}
                className="bg-white rounded-xl border border-stone-200 px-5 py-4 flex items-center justify-between"
              >
                <Link href={`/clients/${client.id}`} className="flex-1 min-w-0">
                  <div className="font-medium text-stone-800">{client.name}</div>
                  {client.phone && (
                    <div className="text-sm text-stone-400 mt-0.5">{client.phone}</div>
                  )}
                </Link>
                <form action={startSession}>
                  <input type="hidden" name="client_id" value={client.id} />
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors ml-4"
                  >
                    Start Session
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-stone-400">
            <p className="text-lg">No clients yet</p>
            <p className="text-sm mt-1">Add your first client to get started</p>
          </div>
        )}
      </main>
    </div>
  )
}
