import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { startSession } from '@/app/actions'

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, session_notes(count)')
    .eq('client_id', id)
    .order('session_date', { ascending: false })

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
          ← Clients
        </Link>
        <form action={startSession}>
          <input type="hidden" name="client_id" value={client.id} />
          <button
            type="submit"
            className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Start Session
          </button>
        </form>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-stone-800">{client.name}</h2>
          {client.phone && <p className="text-sm text-stone-400 mt-0.5">{client.phone}</p>}
        </div>

        <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-3">Past Sessions</h3>

        {sessions && sessions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {sessions.map(session => {
              const count = session.session_notes?.[0]?.count ?? 0
              return (
                <Link
                  key={session.id}
                  href={`/session/${session.id}`}
                  className="bg-white rounded-xl border border-stone-200 px-5 py-4 flex items-center justify-between hover:border-stone-300 transition-colors"
                >
                  <span className="font-medium text-stone-800">
                    {new Date(session.session_date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                  <span className="text-sm text-stone-400">
                    {count} {count === 1 ? 'note' : 'notes'}
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-center py-12 text-stone-400 text-sm">No sessions yet</p>
        )}
      </main>
    </div>
  )
}
