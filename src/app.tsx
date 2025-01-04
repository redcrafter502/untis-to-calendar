import ics from 'ics'
import { getEvents } from '@/services/untis'
import { Hono } from 'hono'
import { deleteCookie, getCookie } from 'hono/cookie'
import Layout from '@/layout'
import account from '@/routes/account'
import { AUTH_COOKIE_NAME, isLoggedIn } from '@/services/auth'
import panel from '@/routes/panel'
import { db } from '@/db'
import {
  privateUntisAccesses,
  publicUntisAccesses,
  untisAccesses,
  users,
} from '@/db/schema'
import { eq } from 'drizzle-orm'
import login from '@/routes/login'

// TODO: Add Suspense and ErrorBoundary

const app = new Hono()

app.get('/ics/:id', async (c) => {
  console.info('Updating Calendar')
  const id = c.req.param('id')
  const untisAccess = (
    await db
      .select()
      .from(untisAccesses)
      .leftJoin(
        privateUntisAccesses,
        eq(untisAccesses.untisAccessId, privateUntisAccesses.untisAccessId),
      )
      .leftJoin(
        publicUntisAccesses,
        eq(untisAccesses.untisAccessId, publicUntisAccesses.untisAccessId),
      )
      .where(eq(untisAccesses.urlId, id))
  )[0]
  if (!untisAccess)
    return c.text(`Did not found UntisAccess for UrlID: ${id}`, 404)
  const events = await getEvents(untisAccess)
  // @ts-ignore
  const { err, value } = ics.createEvents(events)
  if (err) {
    console.error('ICS Error', err)
    return
  }
  console.info('Updating Completed')
  c.header('Content-Type', 'text/calendar; charset=utf-8')
  return c.text(value as string)
})

const UntisAccessAndUserCount = async () => {
  const userCount = await db.$count(users)
  const untisAccessCount = await db.$count(untisAccesses)

  return (
    <p>
      Untis to Calendar currently has {untisAccessCount} UntisAccess
      {untisAccessCount === 1 ? '' : 'es'} from {userCount} User
      {userCount === 1 ? '' : 's'}
    </p>
  )
}

app.get('/', (c) => {
  const [loggedIn] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME))

  return c.html(
    <Layout title="Untis to Calender" loggedIn={loggedIn} active="HOME">
      <h1>Welcome to Untis to Calender!</h1>
      <UntisAccessAndUserCount />
    </Layout>,
  )
})

app.route('/login', login)

app.get('/logout', (c) => {
  deleteCookie(c, AUTH_COOKIE_NAME)
  return c.redirect('/')
})

app.route('/account', account)

app.route('/panel', panel)

export default app
