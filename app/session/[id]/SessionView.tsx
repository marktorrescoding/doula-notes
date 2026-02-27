'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { endSession } from '@/app/actions'

type Note = { id: string; content: string; created_at: string }
type Session = {
  id: string
  session_date: string
  client_id: string
  clients: { name: string; phone: string | null }
}
type CustomCategory = {
  id: string
  name: string
  custom_phrases: { id: string; content: string }[]
}

const QUICK_NOTES: Record<string, string[]> = {
  Feeding: [
    'Good latch observed',
    'Latch needs improvement — repositioning attempted',
    'Breastfeeding both sides',
    'Signs of engorgement noted',
    'Low supply concerns discussed',
    'Pumping session completed',
    'Paced bottle feeding practiced',
    'Hunger cues identified by parent',
    'Feeding schedule on track',
  ],
  Infant: [
    'Wet diaper',
    'Dirty diaper',
    'Sleeping well between feeds',
    'Fussy — difficult to settle',
    'Jaundice — monitoring color',
    'Umbilical cord healing well',
    'Swaddle settled baby',
    'White noise effective',
    'Good color and tone',
    'Wake windows on track',
  ],
  Parent: [
    'Parent resting when baby sleeps',
    'Eating and hydrating well',
    'Signs of overwhelm noted',
    'Mood positive',
    'PPD/PPA concerns — resources discussed',
    'Partner engaged and supportive',
    'Gaining confidence with baby care',
    'Perineal healing progressing well',
    'C-section incision healing well',
    'Fatigue significant — rest prioritized',
  ],
  Education: [
    'Safe sleep environment reviewed',
    'Swaddling practiced together',
    'Burping techniques demonstrated',
    'Skin-to-skin encouraged',
    'Wake windows discussed',
    'Diaper change technique reviewed',
    'Soothing techniques practiced',
    'Pelvic floor recovery discussed',
    'Newborn cues reviewed',
  ],
  Referral: [
    'Referred to IBCLC',
    'Referred to pelvic floor PT',
    'Referred to therapist',
    'Pediatrician follow-up recommended',
    'Previous referral followed up',
    'Support group recommended',
  ],
}

const BUILT_IN_CATEGORIES = Object.keys(QUICK_NOTES)

export default function SessionView({
  session,
  initialNotes,
  customCategories,
}: {
  session: Session
  initialNotes: Note[]
  customCategories: CustomCategory[]
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!editingNoteId) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [notes, editingNoteId])

  async function saveNote(content: string) {
    if (!content.trim()) return
    setAdding(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('session_notes')
      .insert({ session_id: session.id, content: content.trim() })
      .select()
      .single()
    if (data) setNotes(prev => [...prev, data])
    setAdding(false)
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    const content = input.trim()
    if (!content) return
    setInput('')
    await saveNote(content)
    inputRef.current?.focus()
  }

  function startEdit(note: Note) {
    setEditingNoteId(note.id)
    setEditingContent(note.content)
  }

  async function saveEdit(noteId: string) {
    if (!editingContent.trim()) return
    const supabase = createClient()
    await supabase.from('session_notes').update({ content: editingContent.trim() }).eq('id', noteId)
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, content: editingContent.trim() } : n))
    setEditingNoteId(null)
  }

  async function deleteNote(noteId: string) {
    const supabase = createClient()
    await supabase.from('session_notes').delete().eq('id', noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  function openReview() {
    const date = new Date(session.session_date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
    const noteList = notes.map(n => `• ${n.content}`).join('\n')
    setReviewText(`Hi ${session.clients.name}, here are your visit notes from ${date}:\n\n${noteList}`)
    setShowReview(true)
  }

  async function sendSMS() {
    const supabase = createClient()
    await supabase.from('sessions').update({ completed_at: new Date().toISOString() }).eq('id', session.id)
    window.location.href = `sms:${session.clients.phone}&body=${encodeURIComponent(reviewText)}`
  }

  return (
    <>
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col print:bg-white">
        <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-6 py-4 flex items-center justify-between print:hidden">
          <Link href="/dashboard" className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
            ← Clients
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            >
              Print / PDF
            </button>
            <div className="text-right">
              <div className="font-semibold text-stone-800 dark:text-stone-100">{session.clients.name}</div>
              <div className="text-xs text-stone-400 dark:text-stone-500">
                {new Date(session.session_date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Print header — only visible when printing */}
        <div className="hidden print:block px-8 py-6 border-b border-stone-200">
          <h1 className="text-xl font-semibold text-stone-900">{session.clients.name} — Visit Notes</h1>
          <p className="text-sm text-stone-500 mt-1">
            {new Date(session.session_date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>

        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-6 flex flex-col print:max-w-none print:px-8">
          {/* Notes list */}
          <div className="flex-1 mb-4">
            {notes.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-16 print:hidden">
                No notes yet — tap a category or type below
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {notes.map(note => (
                  <li key={note.id} className="flex gap-3 text-sm group">
                    <span className="text-stone-400 dark:text-stone-500 shrink-0 pt-0.5 print:text-stone-500">
                      {new Date(note.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </span>

                    {editingNoteId === note.id ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          autoFocus
                          value={editingContent}
                          onChange={e => setEditingContent(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEdit(note.id)
                            if (e.key === 'Escape') setEditingNoteId(null)
                          }}
                          className="flex-1 border border-stone-300 dark:border-stone-600 rounded px-2 py-0.5 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                        />
                        <button onClick={() => saveEdit(note.id)} className="text-xs text-emerald-600 font-medium">Save</button>
                        <button onClick={() => setEditingNoteId(null)} className="text-xs text-stone-400">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-start justify-between gap-2">
                        <span className="text-stone-800 dark:text-stone-100 print:text-stone-900">{note.content}</span>
                        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                          <button
                            onClick={() => startEdit(note)}
                            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="p-1 text-stone-400 hover:text-red-500"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
                <div ref={bottomRef} />
              </ul>
            )}
          </div>

          {/* Input area — hidden when printing */}
          <div className="flex flex-col gap-3 print:hidden">
            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {BUILT_IN_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
              {customCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white dark:bg-stone-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:border-emerald-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Quick-tap phrases */}
            {activeCategory && (
              <div className="flex flex-wrap gap-2">
                {QUICK_NOTES[activeCategory]
                  ? QUICK_NOTES[activeCategory].map(phrase => (
                      <button
                        key={phrase}
                        onClick={() => saveNote(phrase)}
                        disabled={adding}
                        className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs rounded-lg transition-colors disabled:opacity-40 text-left"
                      >
                        {phrase}
                      </button>
                    ))
                  : customCategories
                      .find(c => c.id === activeCategory)
                      ?.custom_phrases.map(phrase => (
                        <button
                          key={phrase.id}
                          onClick={() => saveNote(phrase.content)}
                          disabled={adding}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg transition-colors disabled:opacity-40 text-left border border-emerald-100 dark:border-emerald-800"
                        >
                          {phrase.content}
                        </button>
                      ))
                }
              </div>
            )}

            {/* Free text */}
            <form onSubmit={addNote} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Or type a custom note and press Enter..."
                disabled={adding}
                className="flex-1 border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder:text-stone-400"
              />
              <button
                type="submit"
                disabled={adding || !input.trim()}
                className="bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </form>

            {notes.length > 0 && session.clients.phone && (
              <button
                onClick={openReview}
                className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Finish Session — Text Notes to {session.clients.name}
              </button>
            )}
            <form action={endSession} className="w-full">
              <input type="hidden" name="session_id" value={session.id} />
              <input type="hidden" name="client_id" value={session.client_id} />
              <button
                type="submit"
                className="w-full text-center text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 py-1 transition-colors"
              >
                End session without texting
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* Review modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-700">
              <h3 className="font-semibold text-stone-800 dark:text-stone-100">Review Before Sending</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Edit the message below before it opens in your SMS app.</p>
            </div>

            <div className="px-6 py-4 flex-1 overflow-y-auto">
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 mb-4">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Privacy reminder:</strong> SMS is not encrypted. Only send notes your client has consented to receive this way.
                </p>
              </div>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                rows={12}
                className="w-full border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
              />
            </div>

            <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-700 flex gap-3">
              <button
                onClick={() => setShowReview(false)}
                className="flex-1 border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 rounded-lg py-2 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendSMS}
                className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Open in SMS →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
