import {AUTH_COOKIE_NAME, isLoggedIn} from '@/services/auth'
import {getCookie, setCookie} from 'hono/cookie'
import Layout from '@/layout'
import Input from '@/input'
import {zValidator} from '@hono/zod-validator'
import {z} from 'zod'
import {db} from '@/db'
import {users} from '@/db/schema'
import {eq} from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {Hono} from 'hono'

const TWENTY_FOUR_HOURS_IN_SECONDS = 86400
const NUMBER_OF_MILLISECONDS_IN_A_SECOND = 1000

const app = new Hono()

app.get('/', (c) => {
    const [loggedIn] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME));
    if (loggedIn) return c.redirect('/panel')

    return c.html(
        <Layout title="Login" loggedIn={false} active="LOGIN">
            <h2>Login</h2>
            <form action="/login" method="post">
                <Input id="email" label="Email" type="email" required/>
                <Input id="password" label="Password" type="password" required/>
                <button type="submit" class="mt-3 btn btn-primary">Login</button>
            </form>
        </Layout>
    )
})

app.post(
    '/',
    zValidator(
        'form',
        z.object({
            email: z.string().email(),
            password: z.string(),
        }),
    ),
    async (c) => {
        const body = c.req.valid('form')
        // TODO: find a better way than using a zero index
        const user = (await db.select().from(users).where(eq(users.email, body.email)).limit(1))[0]
        if (!user) return c.redirect('/login')
        const passwordIsValid = bcrypt.compareSync(body.password, user.password)
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
    }
)

export default app