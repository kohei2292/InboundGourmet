"use client"
import { signIn, signOut, useSession } from 'next-auth/react'

export default function AuthButtons() {
  const { data: session } = useSession()

  if (!session) {
    return <button onClick={() => signIn()} className="btn">Sign in</button>
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm px-2 py-1 bg-gray-100 rounded">{session.user?.email}</span>
      <button onClick={() => signOut()} className="btn">Sign out</button>
    </div>
  )
}
