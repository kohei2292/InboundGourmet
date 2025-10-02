InboundGourmet - Next.js + TypeScript + Prisma starter

Quick start (PowerShell):

1. Install dependencies

   npm install

2. Generate Prisma client and run migration (creates sqlite DB)

   npx prisma generate; npx prisma migrate dev --name init

3. Seed the database

   npm run seed

4. Run dev server

   npm run dev

Notes:
- This is a minimal starter for the MVP. It uses SQLite for local development.
- Mapbox and NextAuth need API keys — add later to `.env`.
