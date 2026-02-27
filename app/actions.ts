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

  // If there's already an open session, go back to it
  const { data: openSessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('client_id', clientId)
    .eq('user_id', user.id)
    .is('completed_at', null)
    .order('session_date', { ascending: false })
    .limit(1)

  if (openSessions && openSessions.length > 0) redirect(`/session/${openSessions[0].id}`)

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
