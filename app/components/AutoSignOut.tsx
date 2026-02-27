'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

export default function AutoSignOut() {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const reset = () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
      }, TIMEOUT_MS)
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [router])

  return null
}
