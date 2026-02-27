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

  function fmt(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
          ← Clients
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/clients/${id}/edit`}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            Edit
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
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Client profile */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-4">{client.name}</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {client.phone && (
              <div>
                <span className="text-stone-400 dark:text-stone-500 block">Phone</span>
                <span className="text-stone-800 dark:text-stone-200">{client.phone}</span>
              </div>
            )}
            {client.partner_name && (
              <div>
                <span className="text-stone-400 dark:text-stone-500 block">Partner</span>
                <span className="text-stone-800 dark:text-stone-200">{client.partner_name}</span>
              </div>
            )}
            {client.birth_date && (
              <div>
                <span className="text-stone-400 dark:text-stone-500 block">Baby&apos;s Birthday</span>
                <span className="text-stone-800 dark:text-stone-200">{fmt(client.birth_date)}</span>
              </div>
            )}
            {client.due_date && (
              <div>
                <span className="text-stone-400 dark:text-stone-500 block">Due Date</span>
                <span className="text-stone-800 dark:text-stone-200">{fmt(client.due_date)}</span>
              </div>
            )}
            {client.next_visit_date && (
              <div>
                <span className="text-stone-400 dark:text-stone-500 block">Next Visit</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{fmt(client.next_visit_date)}</span>
              </div>
            )}
          </div>
          {client.preferences && (
            <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-700">
              <span className="text-stone-400 dark:text-stone-500 text-sm block mb-1">Preferences / Notes</span>
              <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">{client.preferences}</p>
            </div>
          )}
        </div>

        {/* Session history */}
        <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">Session History</h3>

        {sessions && sessions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {sessions.map(session => {
              const count = session.session_notes?.[0]?.count ?? 0
              return (
                <Link
                  key={session.id}
                  href={`/session/${session.id}`}
                  className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 px-5 py-4 flex items-center justify-between hover:border-stone-300 dark:hover:border-stone-500 transition-colors"
                >
                  <span className="font-medium text-stone-800 dark:text-stone-100">
                    {new Date(session.session_date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                  <span className="text-sm text-stone-400 dark:text-stone-500">
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
