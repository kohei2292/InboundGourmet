// Use CommonJS require so ts-node (transpile-only) can run without ESM config
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Create users (idempotent using upsert)
  await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { name: 'Alice', email: 'alice@example.com', locale: 'en' }
  })
  await prisma.user.upsert({
    where: { email: 'taro@example.com' },
    update: {},
    create: { name: '太郎', email: 'taro@example.com', locale: 'ja' }
  })

  // Create tags
  const sushiTag = await prisma.tag.upsert({ where: { name: 'sushi' }, update: {}, create: { name: 'sushi' } })
  const japaneseTag = await prisma.tag.upsert({ where: { name: 'japanese' }, update: {}, create: { name: 'japanese' } })

  // Create restaurant (idempotent)
  const r = await prisma.restaurant.upsert({
    where: { slug: 'sushi-bar-tokyo' },
    update: {},
    create: {
      name: 'Sushi Bar Tokyo',
      slug: 'sushi-bar-tokyo',
      description: 'Fresh sushi in Shinjuku',
      address: 'Shinjuku, Tokyo',
      lat: 35.6938,
      lng: 139.7034,
      tags: { connect: [{ id: sushiTag.id }, { id: japaneseTag.id }] }
    },
  })

  // Optionally add a photo
  await prisma.restaurantPhoto.upsert({
    where: { id: 'photo_sushi_1' },
    update: {},
    create: { id: 'photo_sushi_1', url: 'https://placehold.co/600x400', restaurantId: r.id }
  })

  const alice = await prisma.user.findUnique({ where: { email: 'alice@example.com' } })
  if (alice) {
    await prisma.review.create({
      data: {
        userId: alice.id,
        restaurantId: r.id,
        rating: 5,
        text: 'Amazing sushi!',
        language: 'en'
      }
    })
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
