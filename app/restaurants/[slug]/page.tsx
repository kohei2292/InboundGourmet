import { PrismaClient } from '@prisma/client'
import ReviewForm from '../../../components/ReviewForm'
import Rating from '../../../components/Rating'

const prisma = new PrismaClient()

export default async function RestaurantPage({ params }: { params: { slug: string } }) {
  const r = await prisma.restaurant.findUnique({ where: { slug: params.slug }, include: { reviews: { include: { photos: true } } } })

  if (!r) return <div>Not found</div>

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{r.name}</h1>
        <div className="text-sm text-gray-400">{r.address}</div>
      </div>
      <p className="mt-2 text-gray-300">{r.description}</p>
      <div className="mt-6">
        <h2 className="font-semibold">Reviews</h2>
        <ul className="mt-2 space-y-3">
          {r.reviews.map((review: any) => (
              <li key={review.id} className="p-3 rounded card">
                <div className="text-sm">{review.text}</div>
                {review.photos && review.photos.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {review.photos.map((p: any) => (
                      <img key={p.id} src={p.url} alt="review photo" className="w-24 h-24 object-cover rounded" />
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1"><Rating value={review.rating} /> · {new Date(review.createdAt).toLocaleString()}</div>
              </li>
            ))}
        </ul>
      </div>

      {/* Client-side review form; passes restaurant id */}
      <div className="mt-6">
        <ReviewForm restaurantId={r.id} />
      </div>
    </div>
  )
}
