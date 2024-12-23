import 'dotenv/config'
import './env.js'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import ics from 'ics'
import jwt from 'jsonwebtoken'
import path from 'path'
import db from './models/index.js'
import {panelRoute, panelNewRoute, panelNewApiRoute, panelDeleteRoute, panelIdRoute} from './controllers/panel.js'
import {getEvents} from './services/untis.js'
import {logoutRoute, loginApiRoute, loginRoute, accountRoute, panelChangePasswordRoute, deleteAccountRoute} from './controllers/authentication.js'

import {fileURLToPath} from 'node:url'
import {dirname} from 'node:path'
const __dirname = dirname(fileURLToPath(import.meta.url))

const UntisAccess = db.untisAccess
const PublicUntisAccess = db.publicUntisAccess
const PrivateUnitsAccess = db.privateUntisAccess
const User = db.user

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use('/css', express.static(__dirname + '/../node_modules/bootstrap/dist/css'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/ics/:id', async (req, res) => {
    console.info('Updating Calendar')
    const untisAccess = await UntisAccess.findOne({where: {urlId: req.params.id}, include: [ PublicUntisAccess, PrivateUnitsAccess ]}).catch((err: any) => {
        console.error(`Error getting an UnitsAccess for UrlID: ${req.params.id}. Error: `, err)
    })
    if (!untisAccess) {
        res.status(404).send(`Did not found UntisAccess for UrlID: ${req.params.id}`)
        return
    }
    console.log('UntisAccess', untisAccess)
    const events = await getEvents(untisAccess)
    // @ts-ignore
    const {err, value} = ics.createEvents(events)
    if (err) {
        console.error('ICS Error', err)
        return
    }
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.send(value)
    console.info('Updating Completed')
})

app.get('/', async (req, res) => {
    const userCount = await User.count()
    const untisAccessCount = await UntisAccess.count()

    jwt.verify(req.cookies.authSession, process.env.AUTH_SECRET, (err: any) => {
        const loggedIn = !err;
        res.render('index', {loggedIn, userCount, untisAccessCount})
    })

})

app.get('/login', loginRoute)
app.post('/login-api', loginApiRoute)
app.get('/logout', logoutRoute)
app.get('/account', accountRoute)
app.post('/change-password', panelChangePasswordRoute)
app.post('/delete-account', deleteAccountRoute)
app.get('/panel', panelRoute)
app.post('/panel/new', panelNewRoute)
app.post('/panel/new-api', panelNewApiRoute)
app.post('/panel/delete', panelDeleteRoute)
app.get('/panel/:id', panelIdRoute)

const PORT = parseInt(process.env.PORT) || 3000
db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`)
    })
})
