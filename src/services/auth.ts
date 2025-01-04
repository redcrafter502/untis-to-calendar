import jwt from 'jsonwebtoken'

export const isLoggedIn = (
  authSession: string | undefined,
): [false, undefined] | [true, number] => {
  if (!authSession) return [false, undefined]

  try {
    const decoded = jwt.verify(authSession, process.env.AUTH_SECRET) as {
      id: number
    }
    return [true, decoded.id]
  } catch {
    return [false, undefined]
  }
}

export const AUTH_COOKIE_NAME = 'auth-session'
