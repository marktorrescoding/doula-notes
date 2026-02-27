'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function startSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clientId = formData.get('client_id') as string
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // If there's already an active session within the last 24h, continue it
  const { data: openSessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('client_id', clientId)
    .eq('user_id', user.id)
    .is('completed_at', null)
    .gte('session_date', yesterday)
    .order('session_date', { ascending: false })
    .limit(1)

  if (openSessions && openSessions.length > 0) redirect(`/session/${openSessions[0].id}`)

  // Auto-end any stale open sessions older than 24h
  await supabase
    .from('sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('client_id', clientId)
    .eq('user_id', user.id)
    .is('completed_at', null)
    .lt('session_date', yesterday)

  const { data: session } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      client_id: clientId,
      session_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (session) {
    revalidatePath('/dashboard')
    redirect(`/session/${session.id}`)
  }
  redirect('/dashboard')
}

export async function deleteClient(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const clientId = formData.get('client_id') as string
  await supabase.from('clients').delete().eq('id', clientId).eq('user_id', user.id)
  redirect('/dashboard')
}

export async function endSession(formData: FormData) {
  const supabase = await createClient()
  const sessionId = formData.get('session_id') as string
  const clientId = formData.get('client_id') as string
  await supabase.from('sessions').update({ completed_at: new Date().toISOString() }).eq('id', sessionId)
  redirect(`/clients/${clientId}`)
}
