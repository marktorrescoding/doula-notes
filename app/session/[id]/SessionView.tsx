'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

type Note = { id: string; content: string; created_at: string }
type Session = {
  id: string
  session_date: string
  clients: { name: string; phone: string | null }
}

export default function SessionView({
  session,
  initialNotes,
}: {
  session: Session
  initialNotes: Note[]
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [notes])

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    const content = input.trim()
    if (!content) return
    setAdding(true)
    setInput('')

    const supabase = createClient()
    const { data } = await supabase
      .from('session_notes')
      .insert({ session_id: session.id, content })
      .select()
      .single()

    if (data) setNotes(prev => [...prev, data])
    setAdding(false)
    inputRef.current?.focus()
  }

  function finishSession() {
    const noteList = notes.map(n => `• ${n.content}`).join('\n')
    const date = new Date(session.session_date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
    const body = `Hi ${session.clients.name}, here are your visit notes from ${date}:\n\n${noteList}`
    window.location.href = `sms:${session.clients.phone}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
          ← Clients
        </Link>
        <div className="text-right">
          <div className="font-semibold text-stone-800">{session.clients.name}</div>
          <div className="text-xs text-stone-400">
            {new Date(session.session_date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-6 flex flex-col">
        <div className="flex-1 mb-4">
          {notes.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-16">
              No notes yet — add your first one below
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {notes.map(note => (
                <li key={note.id} className="flex gap-3 text-sm">
                  <span className="text-stone-400 shrink-0 pt-0.5">
                    {new Date(note.created_at).toLocaleTimeString('en-US', {
                      hour: 'numeric', minute: '2-digit',
                    })}
                  </span>
                  <span className="text-stone-800">{note.content}</span>
                </li>
              ))}
              <div ref={bottomRef} />
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <form onSubmit={addNote} className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a note and press Enter..."
              disabled={adding}
              className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
            <button
              type="submit"
              disabled={adding || !input.trim()}
              className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </form>

          {notes.length > 0 && session.clients.phone && (
            <button
              onClick={finishSession}
              className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Finish Session — Text Notes to {session.clients.name}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
