'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else if (!data.session) {
        setMessage('Check your email for a confirmation link to finish signing up.')
        setLoading(false)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
  }

  const inputClass = "w-full border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 p-8">
        <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 mb-1">Doula Notes</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
          {isSignUp ? 'Create your account' : 'Sign in to continue'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-emerald-600 dark:text-emerald-400 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg py-2 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError('') }}
          className="mt-4 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 w-full text-center transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}
