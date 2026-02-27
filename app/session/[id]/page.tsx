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

  return (
    <SessionView
      session={session}
      initialNotes={notes || []}
      customCategories={customCategories || []}
    />
  )
}
