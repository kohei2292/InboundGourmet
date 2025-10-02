PowerShell commands to run locally (copy-paste):

# install deps
npm install

# generate prisma client and migrate
npx prisma generate; npx prisma migrate dev --name init

# seed
npm run seed

# run dev
npm run dev

Notes: If you want to use a different DB in production, update `prisma/schema.prisma` datasource and set `DATABASE_URL` in `.env`.
