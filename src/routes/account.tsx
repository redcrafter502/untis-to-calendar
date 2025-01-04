import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import Layout from '@/layout'
import bcrypt from 'bcryptjs'
import { AUTH_COOKIE_NAME, isLoggedIn } from '@/services/auth'
import Input from '@/components/input'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

const AccountInfo = async (props: { id: number }) => {
  const user = (
    await db.select().from(users).where(eq(users.userId, props.id))
  )[0]

  return (
    <>
      <p>Email: {user.email}</p>
      <p>Created At: {user.createdAt}</p>
    </>
  )
}

app.get('/', (c) => {
  const [loggedIn, id] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME))
  if (!loggedIn) return c.redirect('/')

  return c.html(
    <Layout title="Account" loggedIn={true} active="ACCOUNT">
      <h2>Your Account</h2>
      <AccountInfo id={id} />
      <h2 class="mt-4">Change Password</h2>
      <form action="/account/change-password" method="post">
        <Input id="oldPassword" label="Old Password" type="password" required />
        <Input id="newPassword" label="New Password" type="password" required />
        <Input
          id="newPasswordConfirmed"
          label="Confirm New Password"
          type="password"
          required
        />
        <button type="submit" className="mt-3 btn btn-primary">
          Change Password
        </button>
      </form>
      <h2 className="mt-4">Delete Account</h2>
      <form
        id="deleteForm"
        action="/account/delete"
        method="post"
        submit-delete-confirm
      >
        <button type="submit" className="btn btn-danger">
          Delete
        </button>
      </form>
    </Layout>,
  )
})

app.post(
  '/change-password',
  zValidator(
    'form',
    z.object({
      oldPassword: z.string(),
      newPassword: z.string(),
    }),
  ),
  async (c) => {
    const body = c.req.valid('form')
    const [loggedIn, id] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME))
    if (!loggedIn) return c.redirect('/')

    const user = (await db.select().from(users).where(eq(users.userId, id)))[0]
    const oldPasswordIsValid = bcrypt.compareSync(
      body.oldPassword,
      user.password,
    )
    if (!oldPasswordIsValid) return c.redirect('/account')
    const newPassword = bcrypt.hashSync(body.newPassword, 10)
    await db
      .update(users)
      .set({ password: newPassword, updatedAt: new Date().toISOString() })
      .where(eq(users.userId, id))
    return c.redirect('/account')
  },
)

app.post('/delete', async (c) => {
  const [loggedIn, id] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME))
  if (!loggedIn) return c.redirect('/')

  await db.delete(users).where(eq(users.userId, id))
  return c.redirect('/logout')
})

export default app
