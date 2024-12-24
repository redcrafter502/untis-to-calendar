import {Hono} from 'hono'
import {getCookie} from 'hono/cookie'
import Layout from './layout.js'
import bcrypt from 'bcryptjs'
import db from './models/db.js'
import {AUTH_COOKIE_NAME, isLoggedIn} from './auth.js'
import Input from './input.js'

const User = db.user

const app = new Hono()

const AccountInfo = async (props: { id: number }) => {
    const user = await User.findByPk(props.id)

    return (
        <>
            <p>Email: {user.email}</p>
            <p>Created At: {user.createdAt.toString()}</p>
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
            { /* TODO: add client-side equality check for old and new password */ }
            <form action="/account/change-password" method="post">
                <Input id="oldPassword" label="Old Password" type="password" required/>
                {/*<div class="form-group">
                    <label for="newPassword">New Password</label>
                    <input required type="password" name="newPassword" id="newPassword"
                           oninput="checkConfirmedPassword()" class="form-control"/>
                </div>*/}
                <Input id="newPassword" label="New Password" type="password" required/>
                {/*<div class="form-group">
                    <label for="newPasswordConfirmed">Confirm New Password</label>
                    <input required type="password" name="newPasswordConfirmed" id="newPasswordConfirmed"
                           oninput="checkConfirmedPassword()" class="form-control"/>
                </div>*/}
                <Input id="newPasswordConfirmed" label="Confirm New Password" type="password" required/>
                <button type="submit" className="mt-3 btn btn-primary">Change Password</button>
            </form>
            <h2 className="mt-4">Delete Account</h2>
            { /* TODO: find a better way to handle the client-side onSubmit */ }
            <form id="deleteForm" action="/account/delete" method="post" onSubmit="return confirm('Are you sure you want to delete?');">
                <button type="submit" className="btn btn-danger">Delete</button>
            </form>
        </Layout>
    )
})

app.post('/change-password', async (c) => {
    const body = await c.req.parseBody()
    const [loggedIn, id] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME))
    if (!loggedIn) return c.redirect('/')

    const user = await User.findByPk(id)
    const oldPasswordIsValid = bcrypt.compareSync(body['oldPassword'] as string, user.password)
    if (!oldPasswordIsValid) return c.redirect('/account')
    user.password = bcrypt.hashSync(body['newPassword'] as string, 10)
    user.save()
    return c.redirect('/account')
})

app.post('/delete', async (c) => {
    const [loggedIn, id] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME))
    if (!loggedIn) return c.redirect('/')

    const user = await User.findByPk(id)
    await user.destroy()
    return c.redirect('/logout')
})

export default app