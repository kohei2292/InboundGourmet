import Link from 'next/link'

export default function Home() {
  return (
    <div className="card" style={{background:'linear-gradient(90deg, rgba(124,58,237,0.08), rgba(6,182,212,0.04))'}}>
      <h1 className="text-3xl font-bold">Discover great food near you</h1>
      <p className="mt-4 text-gray-300">A modern starter for a Yelp-like site focused on visitors and expats.</p>
      <div className="mt-6">
        <Link href="/restaurants" className="btn">Browse restaurants</Link>
      </div>
    </div>
  )
}
