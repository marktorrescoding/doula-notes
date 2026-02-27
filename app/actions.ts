'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// --- helpers ---

async function getActiveSessions(): Promise<Record<string, string>> {
  const store = await cookies()
  try {
    const val = store.get('active_sessions')?.value
    return val ? JSON.parse(val) : {}
  } catch {
    return {}
  }
}

async function setActiveSessions(map: Record<string, string>) {
  const store = await cookies()
  store.set('active_sessions', JSON.stringify(map), { path: '/' })
}

// --- actions ---

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

  // Check cookie first — fast, no query needed
  const activeMap = await getActiveSessions()
  if (activeMap[clientId]) {
    redirect(`/session/${activeMap[clientId]}`)
  }

  // No active session — create one
  const { data: session } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      client_id: clientId,
      session_date: new Date().toISOString().split('T')[0],
    })
    .select('id')
    .single()

  if (session) {
    activeMap[clientId] = session.id
    await setActiveSessions(activeMap)
    redirect(`/session/${session.id}`)
  }

  redirect('/dashboard')
}

export async function endSession(formData: FormData) {
  const supabase = await createClient()
  const sessionId = formData.get('session_id') as string
  const clientId = formData.get('client_id') as string

  await supabase
    .from('sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId)

  const activeMap = await getActiveSessions()
  delete activeMap[clientId]
  await setActiveSessions(activeMap)

  redirect(`/clients/${clientId}`)
}

export async function finishSessionWithSMS(sessionId: string, clientId: string) {
  const supabase = await createClient()

  await supabase
    .from('sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId)

  const activeMap = await getActiveSessions()
  delete activeMap[clientId]
  await setActiveSessions(activeMap)
}

export async function saveClientPhone(clientId: string, phone: string) {
  const supabase = await createClient()
  await supabase.from('clients').update({ phone }).eq('id', clientId)
}

export async function deleteClient(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const clientId = formData.get('client_id') as string

  await supabase.from('clients').delete().eq('id', clientId).eq('user_id', user.id)

  // Clean up cookie if this client had an active session
  const activeMap = await getActiveSessions()
  if (activeMap[clientId]) {
    delete activeMap[clientId]
    await setActiveSessions(activeMap)
  }

  redirect('/dashboard')
}
