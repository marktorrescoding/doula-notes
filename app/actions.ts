'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function startSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      client_id: formData.get('client_id') as string,
      session_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (session) redirect(`/session/${session.id}`)
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
