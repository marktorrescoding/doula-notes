import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: categories } = await supabase
    .from('custom_categories')
    .select('*, custom_phrases(*)')
    .order('created_at', { ascending: true })

  async function createCategory(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    const name = (formData.get('name') as string).trim()
    if (!name) return
    await supabase.from('custom_categories').insert({ user_id: user.id, name })
    redirect('/settings/categories')
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-stone-50 dark:bg-stone-950">
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
          ← Back
        </Link>
        <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Note Categories</span>
        <div className="w-16" />
      </header>

      <main className="flex-1 overflow-y-auto scroll-ios"><div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-1">Custom Categories</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">Create your own note categories and phrases that appear in every session alongside the built-in ones.</p>
        </div>

        {/* Add new category */}
        <form action={createCategory} className="flex gap-2 mb-8">
          <input
            name="name"
            type="text"
            required
            placeholder="New category name..."
            className="flex-1 border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder:text-stone-400"
          />
          <button
            type="submit"
            className="bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors shrink-0"
          >
            Add
          </button>
        </form>

        {/* Category list */}
        {categories && categories.length > 0 ? (
          <div className="flex flex-col gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                <div className="px-5 py-3 flex items-center justify-between border-b border-stone-100 dark:border-stone-700">
                  <span className="font-medium text-stone-800 dark:text-stone-100">{cat.name}</span>
                  <Link
                    href={`/settings/categories/${cat.id}`}
                    className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                  >
                    Manage →
                  </Link>
                </div>
                {cat.custom_phrases && cat.custom_phrases.length > 0 ? (
                  <div className="px-5 py-3 flex flex-wrap gap-2">
                    {cat.custom_phrases.map((phrase: { id: string; content: string }) => (
                      <span key={phrase.id} className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs rounded-lg">
                        {phrase.content}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="px-5 py-3 text-xs text-stone-400 dark:text-stone-500">No phrases yet — <Link href={`/settings/categories/${cat.id}`} className="underline">add some</Link></p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-stone-400 text-sm">No custom categories yet</p>
        )}
      </div></main>
    </div>
  )
}
