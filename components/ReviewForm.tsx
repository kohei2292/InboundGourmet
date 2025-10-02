"use client"
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ReviewForm({ restaurantId }: { restaurantId: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)

  if (!session) return <div className="text-sm text-gray-300">Please sign in to write a review.</div>

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    let res: Response
    if (files && files.length > 0) {
      const fd = new FormData()
      fd.append('restaurantId', restaurantId)
      fd.append('text', text)
      fd.append('rating', String(rating))
      for (let i = 0; i < files.length; i++) fd.append('photos', files[i])
      res = await fetch('/api/reviews', { method: 'POST', body: fd })
    } else {
      res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, text, rating })
      })
    }
    setLoading(false)
    if (res.ok) router.refresh()
    else alert('Failed to submit')
  }

  return (
    <form onSubmit={submit} className="card">
      <div>
        <label className="block text-sm text-gray-300">Rating</label>
        <select value={rating} onChange={e => setRating(Number(e.target.value))} className="mt-1" style={{background:'transparent', color:'#e6eef8'}}>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="mt-3">
        <label className="block text-sm text-gray-300">Review</label>
        <textarea value={text} onChange={e => setText(e.target.value)} className="mt-1" style={{minHeight:100}} />
      </div>
      <div className="mt-3">
        <label className="block text-sm text-gray-300">Photos (optional)</label>
        <input type="file" multiple accept="image/*" className="mt-1" onChange={e => setFiles(e.target.files)} />
      </div>
      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={loading} className="btn">{loading ? 'Posting...' : 'Post Review'}</button>
      </div>
    </form>
  )
}
