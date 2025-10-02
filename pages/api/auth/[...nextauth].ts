import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // For MVP we'll add a simple credentials provider (email-only)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        // Upsert user by email
        const email = credentials.email
        let user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          user = await prisma.user.create({ data: { email, name: email.split('@')[0] } })
        }
        return user
      }
    })
  ],
  // Use JWT strategy for credentials sign-in
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      // When user signs in, attach id to token
      if (user) (token as any).id = (user as any).id
      return token
    },
    async session({ session, token }) {
      // Expose token id on session.user
      if (session.user) (session.user as any).id = (token as any).id || (token as any).sub
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
})
