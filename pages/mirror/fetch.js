import { useState } from 'react'
import SmartRenderer from '@/components/SmartRenderer.jsx'

export default function CodexPage({ defaultPage }) {
  const [title, setTitle] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleSearch() {
    setError('')
    setResult(null)

    try {
      const res = await fetch(`/api/fetch-codex?title=${encodeURIComponent(title)}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()

      // ✅ Normalize Lexicon → Codex once here
      const normalized = {
        ...data,
        type: data.type === "Lexicon" ? "Codex" : data.type,
      }

      setResult(normalized)

    } catch (err) {
      setError(`Page "${title}" not found`)
    }
  }

  const page = result || null

  return (
    <main className="bg-black text-white min-h-screen relative">
      {/* 🔍 Search Box */}
      <div className="absolute top-20 right-10 w-80 space-y-2 z-50">
        <input
          className="w-full p-3 bg-zinc-900 text-white rounded-md border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="🔍 Search a Codex or Scroll..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Fetch Page
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {/* 🪞 Symbolic Reflection Zone */}
      <div className="flex items-center justify-center pt-40 px-4">
        {page ? (
          <div className="max-w-2xl w-full">
            <SmartRenderer
              title={page.title}
              updated={page.updated}
              content={page.description} // or page.content if that’s your field
              type={page.type}
            />
          </div>
        ) : (
          <div className="text-theme-muted text-center text-lg max-w-lg mx-auto px-4">
            🪞 <br />What would you like to remember?<br />
            Type the name of a Scroll or Codex to summon it from your memory.
          </div>
        )}
      </div>
    </main>
  )
}

export async function getServerSideProps() {
  return { props: { defaultPage: null } }
}
