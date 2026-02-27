import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SessionView from './SessionView'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('*, clients(name, phone)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) notFound()

  const { data: notes } = await supabase
    .from('session_notes')
    .select('*')
    .eq('session_id', id)
    .order('created_at', { ascending: true })

  return <SessionView session={session} initialNotes={notes || []} />
}
