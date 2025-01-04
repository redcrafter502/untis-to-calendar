import jwt from 'jsonwebtoken'
import { env } from '@/env'

export const isLoggedIn = (
  authSession: string | undefined,
): [false, undefined] | [true, number] => {
  if (!authSession) return [false, undefined]

  try {
    const decoded = jwt.verify(authSession, env.AUTH_SECRET) as {
      id: number
    }
    return [true, decoded.id]
  } catch {
    return [false, undefined]
  }
}

export const AUTH_COOKIE_NAME = 'auth-session'
