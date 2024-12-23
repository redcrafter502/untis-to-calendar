import 'dotenv/config'
import './env.js'
import ics from 'ics'
import jwt from 'jsonwebtoken'
import db from './models/db.js'
import {getEvents} from './services/untis.js'

import {Hono} from 'hono'
import {serveStatic} from '@hono/node-server/serve-static'
import {deleteCookie, getCookie, setCookie} from 'hono/cookie'
import bcrypt from 'bcryptjs'
import Layout from './layout.js'
import account from './account.js'
import {AUTH_COOKIE_NAME, isLoggedIn} from './auth.js'
import Input from './input.js'
import panel from './panel.js'

const TWENTY_FOUR_HOURS_IN_SECONDS = 86400
const NUMBER_OF_MILLISECONDS_IN_A_SECOND = 1000

const UntisAccess = db.untisAccess
const PublicUntisAccess = db.publicUntisAccess
const PrivateUnitsAccess = db.privateUntisAccess
const User = db.user

// TODO: Add Suspense and ErrorBoundary

const app = new Hono()

app.use('/css/bootstrap.min.css', serveStatic({ path: './node_modules/bootstrap/dist/css/bootstrap.min.css' }))

app.get('/ics/:id', async (c) => {
    console.info('Updating Calendar')
    const id = c.req.param('id')
    const untisAccess = await UntisAccess.findOne({where: {urlId: id}, include: [ PublicUntisAccess, PrivateUnitsAccess ]}).catch((err: any) => {
        console.error(`Error getting an UnitsAccess for UrlID: ${id}. Error: `, err)
    })
    if (!untisAccess) return c.text(`Did not found UntisAccess for UrlID: ${id}`, 404)
    console.log('UntisAccess', untisAccess)
    const events = await getEvents(untisAccess)
    // @ts-ignore
    const {err, value} = ics.createEvents(events)
    if (err) {
        console.error('ICS Error', err)
        return
    }
    console.info('Updating Completed')
    c.header('Content-Type', 'text/calendar; charset=utf-8')
    return c.text(value as string)
})

const UntisAccessAndUserCount = async () => {
    const userCount = await User.count()
    const untisAccessCount = await UntisAccess.count()

    return (
        <p>Untis to Calendar currently has {untisAccessCount} UntisAccess{untisAccessCount === 1 ? '' : 'es'} from {userCount} User{userCount === 1 ? '' : 's'}</p>
    )
}

app.get('/', (c) => {
    const [loggedIn] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME))

    return c.html(
        <Layout title="Untis to Calender" loggedIn={loggedIn} active="HOME">
            <h1>Welcome to Untis to Calender!</h1>
            <UntisAccessAndUserCount />
        </Layout>
    )
})

app.get('/login', (c) => {
    const [loggedIn] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME));
    if (loggedIn) return c.redirect('/panel')

    return c.html(
        <Layout title="Login" loggedIn={false} active="LOGIN">
            <h2>Login</h2>
            <form action="/login-api" method="post">
                <Input id="email" label="Email" type="email" required/>
                <Input id="password" label="Password" type="password" required/>
                <button type="submit" class="mt-3 btn btn-primary">Login</button>
            </form>
        </Layout>
    )
})

app.post('/login-api', async (c) => {
    const body = await c.req.parseBody()
    const user = await User.findOne({where: {email: body['email']}})
    if (!user) return c.redirect('/login')
    const passwordIsValid = bcrypt.compareSync(body['password'] as string, user.password)
    if (!passwordIsValid) return c.redirect('/login')

    const token = jwt.sign({id: user.userId}, process.env.AUTH_SECRET, {
        expiresIn: TWENTY_FOUR_HOURS_IN_SECONDS
    })
    setCookie(c, AUTH_COOKIE_NAME, token, {
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
        expires: new Date(Date.now() + TWENTY_FOUR_HOURS_IN_SECONDS * NUMBER_OF_MILLISECONDS_IN_A_SECOND),
    })
    return c.redirect('/panel')
})

app.get('/logout', (c) => {
    deleteCookie(c, AUTH_COOKIE_NAME)
    return c.redirect('/')
})

app.route('/account', account)

app.route('/panel', panel)

await db.sequelize.sync()
//serve(app)

export default app
