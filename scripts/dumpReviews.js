const { PrismaClient } = require('@prisma/client')
;(async () => {
  const p = new PrismaClient()
  const rs = await p.review.findMany({ take: 20 })
  console.log(JSON.stringify(rs, null, 2))
  await p.$disconnect()
})()
