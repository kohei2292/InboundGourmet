import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from './auth/[...nextauth]'
import { PrismaClient } from '@prisma/client'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Disable body parsing so formidable can parse multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  // Dev-only test shortcut: allow creating a review when the special header is present.
  // This makes E2E stable and avoids brittle UI sign-in automation for local/dev tests.
  if (process.env.NODE_ENV === 'development' && req.headers['x-e2e-user']) {
    const email = String(req.headers['x-e2e-user'])
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({ data: { email, name: email.split('@')[0] } })
    }

  const { restaurantId, restaurantSlug, text, rating } = req.body
  if ((!restaurantId && !restaurantSlug) || typeof rating !== 'number') { res.status(400).json({ error: 'Invalid input' }); return }

    // Resolve restaurant by id first, then by slug
    let restaurant = null
    if (restaurantId) {
      restaurant = await prisma.restaurant.findUnique({ where: { id: String(restaurantId) } })
    }
    if (!restaurant && restaurantSlug) {
      restaurant = await prisma.restaurant.findUnique({ where: { slug: String(restaurantSlug) } })
    }
    if (!restaurant) { res.status(400).json({ error: 'Restaurant not found' }); return }

    const review = await prisma.review.create({
      data: { userId: user.id, restaurantId: restaurant.id, rating, text }
    })

    // e2e bypass does not accept files, return
    res.status(201).json({ debug: 'e2e-bypass', review }); return
  }
  // If content-type is multipart/form-data, parse with formidable to get files
  const isMultipart = req.headers['content-type']?.includes('multipart/form-data')

  const session = await getServerSession(req, res, authOptions as any) as any
  if (!session?.user) { res.status(401).json({ error: 'Unauthorized' }); return }

  // For multipart requests, formidable will parse fields; for JSON, use req.body
  let fields: any = {}
  let files: Record<string, File | File[]> = {}

  if (isMultipart) {
    const form = formidable({ multiples: true })
    await new Promise<void>((resolve, reject) => {
      form.parse(req as any, (err: any, flds: any, fls: any) => {
        if (err) return reject(err)
        fields = flds
        files = fls as any
        resolve()
      })
    })
  } else {
    fields = req.body
  }

  const { restaurantId, text, rating } = fields
  if (!restaurantId || typeof Number(rating) !== 'number') { res.status(400).json({ error: 'Invalid input' }); return }

  const userEmail = session.user.email
  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) { res.status(401).json({ error: 'User not found' }); return }

  const review = await prisma.review.create({
    data: {
      userId: user.id,
      restaurantId,
      rating: Number(rating),
      text,
    }
  })

  // If multipart files were uploaded, move files to public/uploads and create ReviewPhoto records
  if (isMultipart && files && Object.keys(files).length > 0) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    const fileEntries = Array.isArray(files.photos) ? files.photos : [files.photos].filter(Boolean)
    for (const f of fileEntries) {
      if (!f) continue
      const file = Array.isArray(f) ? f[0] : f as File
      const oldPath = file.filepath || (file as any).path
      const ext = path.extname(file.originalFilename || file.newFilename || '') || ''
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`
      const dest = path.join(uploadDir, fileName)
      fs.copyFileSync(oldPath, dest)
      const publicUrl = `/uploads/${fileName}`
      await prisma.reviewPhoto.create({ data: { url: publicUrl, reviewId: review.id } })
    }
  }

  res.status(201).json(review); return
}
