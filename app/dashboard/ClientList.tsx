'use client'

import { useState } from 'react'
import Link from 'next/link'
import { startSession } from '@/app/actions'

type Client = {
  id: string
  name: string
  phone: string | null
  next_visit_date: string | null
}

export default function ClientList({
  clients,
  activeSessionMap,
}: {
  clients: Client[]
  activeSessionMap: Record<string, string>
}) {
  const [search, setSearch] = useState('')

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search clients..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder:text-stone-400"
      />

      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map(client => {
            const activeSessionId = activeSessionMap[client.id]
            return (
              <div
                key={client.id}
                className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium text-stone-800 dark:text-stone-100">{client.name}</div>
                    {client.phone && (
                      <div className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">{client.phone}</div>
                    )}
                    {client.next_visit_date && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        Next visit: {new Date(client.next_visit_date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-sm font-medium px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    >
                      History
                    </Link>
                    {activeSessionId ? (
                      <Link
                        href={`/session/${activeSessionId}`}
                        className="bg-emerald-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Continue
                      </Link>
                    ) : (
                      <form action={startSession}>
                        <input type="hidden" name="client_id" value={client.id} />
                        <button
                          type="submit"
                          className="bg-emerald-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Start
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-center py-8 text-stone-400 text-sm">
          No clients match &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  )
}
