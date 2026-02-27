import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SessionView from './SessionView'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: session }, { data: notes }, { data: customCategories }] = await Promise.all([
    supabase
      .from('sessions')
      .select('*, clients(name, phone)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('session_notes')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('custom_categories')
      .select('*, custom_phrases(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
  ])

  if (!session) notFound()

  // Auto-end sessions that are more than 24 hours old and still open
  if (!session.completed_at) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    if (session.session_date < yesterday) {
      const completedAt = new Date().toISOString()
      await supabase.from('sessions').update({ completed_at: completedAt }).eq('id', session.id)
      session.completed_at = completedAt
    }
  }

  return (
    <SessionView
      session={session}
      initialNotes={notes || []}
      customCategories={customCategories || []}
    />
  )
}
