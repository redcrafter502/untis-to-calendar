import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../models/db'

const User = db.user

export const loginRoute = (req: any, res: any) => {
    // @ts-ignore
    jwt.verify(req.cookies.authSession, process.env.AUTH_SECRET, (err, _) => {
        if (err) {
            res.render('login')
            return
        }
        res.redirect('/panel')
    })
}

export const loginApiRoute = async (req: any, res: any) => {
    const user = await User.findOne({where: {email: req.body.email}})
    if (!user) {
        res.redirect('/login')
        return
    }
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
    if (!passwordIsValid) {
        res.redirect('/login')
        return
    }

    const token = jwt.sign({id: user.userId}, process.env.AUTH_SECRET, {
        expiresIn: 86400 // 24 hours
    })
    res.cookie('authSession', token, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict'
    })
    res.redirect('/panel')
}

export const logoutRoute = (req: any, res: any) => {
    res.clearCookie('authSession')
    res.redirect('/')
}

export const accountRoute = (req: any, res: any) => {
    // @ts-ignore
    jwt.verify(req.cookies.authSession, process.env.AUTH_SECRET, async (err, decoded) => {
        if (err) {
            res.redirect('/')
            return
        }
        // @ts-ignore
        const user = await User.findByPk(decoded.id)
        res.render('account', { user })
    })
}

export const panelChangePasswordRoute = async (req: any, res: any) => {
    // @ts-ignore
    jwt.verify(req.cookies.authSession, process.env.AUTH_SECRET, async (err, decoded) => {
        if (err) {
            res.redirect('/')
            return
        }
        // @ts-ignore
        const user = await User.findByPk(decoded.id)
        const oldPasswordIsValid = bcrypt.compareSync(req.body.oldPassword, user.password)
        if (!oldPasswordIsValid) {
            res.redirect('/account')
            return
        }
        if (req.body.newPassword !== req.body.newPasswordConfirmed) {
            res.redirect('/account')
            return
        }
        user.password = bcrypt.hashSync(req.body.newPassword, 10)
        user.save()
        res.redirect('/account')
    })
}

export const deleteAccountRoute = (req: any, res: any)  => {
    // @ts-ignore
    jwt.verify(req.cookies.authSession, process.env.AUTH_SECRET, async (err, decoded) => {
        if (err) {
            res.redirect('/')
            return
        }
        // @ts-ignore
        const user = await User.findByPk(decoded.id)
        await user.destroy()
        res.redirect('/logout')
    })
}