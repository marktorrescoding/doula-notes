import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: category } = await supabase
    .from('custom_categories')
    .select('*, custom_phrases(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!category) notFound()

  async function addPhrase(formData: FormData) {
    'use server'
    const content = (formData.get('content') as string).trim()
    if (!content) return
    const supabase = await createClient()
    await supabase.from('custom_phrases').insert({ category_id: id, content })
    redirect(`/settings/categories/${id}`)
  }

  async function renameCategory(formData: FormData) {
    'use server'
    const name = (formData.get('name') as string).trim()
    if (!name) return
    const supabase = await createClient()
    await supabase.from('custom_categories').update({ name }).eq('id', id)
    redirect(`/settings/categories/${id}`)
  }

  async function deleteCategory() {
    'use server'
    const supabase = await createClient()
    await supabase.from('custom_categories').delete().eq('id', id)
    redirect('/settings/categories')
  }

  async function deletePhrase(formData: FormData) {
    'use server'
    const phraseId = formData.get('phrase_id') as string
    const supabase = await createClient()
    await supabase.from('custom_phrases').delete().eq('id', phraseId)
    redirect(`/settings/categories/${id}`)
  }

  const inputClass = "flex-1 border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder:text-stone-400"

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-stone-50 dark:bg-stone-950">
      <header className="shrink-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-6 py-4 pt-safe">
        <Link href="/settings/categories" className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
          ← Categories
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto scroll-ios"><div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Rename */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-5">
          <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">Category Name</h3>
          <form action={renameCategory} className="flex gap-2">
            <input name="name" type="text" defaultValue={category.name} required className={inputClass} />
            <button type="submit" className="bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors shrink-0">
              Save
            </button>
          </form>
        </div>

        {/* Phrases */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-5">
          <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">Phrases</h3>

          <form action={addPhrase} className="flex gap-2 mb-4">
            <input name="content" type="text" required placeholder="Add a phrase..." className={inputClass} />
            <button type="submit" className="bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors shrink-0">
              Add
            </button>
          </form>

          {category.custom_phrases && category.custom_phrases.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {category.custom_phrases.map((phrase: { id: string; content: string }) => (
                <li key={phrase.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-stone-100 dark:border-stone-800 last:border-0">
                  <span className="text-sm text-stone-700 dark:text-stone-200">{phrase.content}</span>
                  <form action={deletePhrase}>
                    <input type="hidden" name="phrase_id" value={phrase.id} />
                    <button type="submit" className="text-xs text-stone-400 hover:text-red-500 transition-colors shrink-0">
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-400 dark:text-stone-500">No phrases yet</p>
          )}
        </div>

        {/* Delete category */}
        <form action={deleteCategory}>
          <button type="submit" className="w-full bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg py-2 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
            Delete Category
          </button>
        </form>
      </div></main>
    </div>
  )
}
