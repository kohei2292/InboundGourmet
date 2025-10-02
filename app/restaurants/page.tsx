import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Rating from '../../components/Rating'

const prisma = new PrismaClient()

export default async function RestaurantsPage() {
  const list = await prisma.restaurant.findMany({ take: 50, include: { tags: true, reviews: { select: { rating: true } } } })
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Restaurants</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((r: any) => {
          const ratings = (r.reviews || []).map((x: any) => x.rating)
          const avg = ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : null
          const avgStars = avg ? Math.round(avg) : 0
          return (
          <Link key={r.id} href={`/restaurants/${r.slug}`} className="card block hover:shadow-lg transition">
            <div className="flex items-start gap-3">
              <div style={{width:64,height:64,background:'linear-gradient(135deg,#06b6d4,#7c3aed)'}} className="rounded-md" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{r.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Rating value={avgStars} />
                      <div className="text-sm text-gray-300">{avg ? avg.toFixed(1) : '—'}</div>
                    </div>
                    <div className="badge">{r.tags?.length || 0}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">{r.description}</p>
              </div>
            </div>
          </Link>
        )})}
      </div>
    </div>
  )
}
