import {Hono} from 'hono'
import {AUTH_COOKIE_NAME, isLoggedIn} from '@/services/auth'
import {getCookie} from 'hono/cookie'
import Layout from '@/layout'
import Input from '@/input'
import {getWebUntis} from '@/services/untis'
import {randomUUID} from 'node:crypto'
import {db} from '@/db'
import {privateUntisAccesses, publicUntisAccesses, untisAccesses} from '@/db/schema'
import {eq, and} from 'drizzle-orm'
import {zValidator} from '@hono/zod-validator'
import {z} from 'zod'

const app = new Hono()

const UntisAccessesList = async (props: { id: number }) => {
    const usersUntisAccesses = await db.select().from(untisAccesses).where(eq(untisAccesses.userId, props.id))

    return (
        (usersUntisAccesses && usersUntisAccesses.length >= 1) ? <>
            <p>You have {usersUntisAccesses.length} UntisAccess{usersUntisAccesses.length === 1 ? '' : 'es'}</p>
            {usersUntisAccesses.map((untisAccess) => {
                const url = `${process.env.API_URL}/ics/${untisAccess.urlId}`
                return (
                    <div>
                        <h4><a href={`/panel/${untisAccess.urlId}`}>{untisAccess.name}</a></h4>
                        <p>{url} <button onclick-copy={url} class="btn btn-secondary">Copy</button></p>
                    </div>
                )
            })}
        </> : <p>You have no UntisAccesses. Create your first one!</p>
    )
}

app.get('/', (c) => {
    const [loggedIn, id] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME))
    if (!loggedIn) return c.redirect('/')

    return c.html(
        <Layout title="Panel" loggedIn={true} active="PANEL">
            <h2>Create UntisAccess</h2>
            <form action="/panel/new" method="post">
                <div class="form-group">
                    <label for="type">Type of Timetable</label>
                    <select required name="type" id="type" class="form-select">
                        <option value="public">Public Timetable</option>
                        <option value="private">Private Timetable</option>
                    </select>
                    <Input id="name" label="Name" type="text" required/>
                    <Input id="domain" label="Domain" placeholder="neilo.webuntis.com" type="text"/>
                    <Input id="school" label="School" type="text" required/>
                    <Input id="timezone" label="Timezone" placeholder="Europe/Berlin" type="text"/>
                    <button type="submit" class="mt-3 btn btn-primary">Create</button>
                </div>
            </form>
            <h2 class="mt-4">UntisAccesses</h2>
            <UntisAccessesList id={id} />
        </Layout>
    )
})

app.post(
    '/new',
    zValidator(
        'form',
        z.object({
            type: z.enum(['public', 'private']),
            name: z.string(),
            domain: z.string().transform(value => value || 'neilo.webuntis.com'),
            school: z.string(),
            timezone: z.string().transform(value => value || 'Europe/Berlin'),
        }),
    ),
    async (c) => {
        const body = c.req.valid('form')
        const [loggedIn] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME))
        if (!loggedIn) return c.redirect('/')

        let classes = null
        if (body.type === 'public') {
            try {
                const untis = getWebUntis({ untisAccesses: { school: body.school, domain: body.domain, type: 'public' }})
                await untis.login()
                const schoolYear = await untis.getCurrentSchoolyear()
                classes = await untis.getClasses(true, schoolYear.id)
                await untis.logout()
            } catch {
                return c.redirect('/panel')
            }
        }

        return c.html(
            <Layout title="Create" loggedIn={true}>
                <h1>Create</h1>
                <form action="/panel/new-api" method="post">
                    <div class="form-group">
                        <label for="type">Type of Timetable</label>
                        <select disabled name="type" id="type" class="form-select" >
                            <option selected={body.type === 'public'} value="public">Public Timetable</option>
                            <option selected={body.type === 'private'} value="private">Private Timetable</option>
                        </select>
                        <input type="hidden" name="type" id="type" value={body.type}/>
                    </div>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input disabled type="text" name="name" id="name" value={body.name} class="form-control"/>
                        <input type="hidden" name="name" id="name" value={body.name}/>
                    </div>
                    <div class="form-group">
                        <label for="domain">Domain</label>
                        <input disabled type="text" name="domain" id="domain" value={body.domain} class="form-control"/>
                        <input type="hidden" name="domain" id="domain" value={body.domain}/>
                    </div>
                    <div class="form-group">
                        <label for="school">School</label>
                        <input disabled type="text" name="school" id="school" value={body.school} class="form-control"/>
                        <input type="hidden" name="school" id="school" value={body.school}/>
                    </div>
                    <div class="form-group">
                        <label for="timezone">Timezone</label>
                        <input disabled type="text" name="timezone" id="timezone" value={body.timezone} class="form-control"/>
                        <input type="hidden" name="timezone" id="timezone" value={body.timezone}/>
                    </div>
                    {(body.type === 'public') ? (
                        <div className="form-group mb-3">
                            <label htmlFor="classes">Select Class</label>
                            <select name="classes" id="classes" className="form-control">
                                {classes?.map(c => (
                                    <option value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <>
                            <div class="alert alert-warning mt-3" role="alert">
                                Warning! Your personal username and password will be stored on this instance of untis-to-calendar. Make sure you trust this instance before giving your data!
                            </div>
                            <Input id="username" label="Untis Username" type="text" required/>
                            <Input id="password" label="Untis Password" type="password" required/>
                        </>
                    )}
                    <div class="mt-3">
                        <a href="/panel" class="btn btn-warning">Cancel</a>
                        <button type="submit" class="btn btn-primary  m-lg-2">Create</button>
                    </div>
                </form>
            </Layout>
        )
    }
)

app.post(
    '/new-api',
    zValidator(
        'form',
        z.object({
            type: z.enum(['public', 'private']),
            name: z.string(),
            domain: z.string(),
            school: z.string(),
            timezone: z.string(),
            classes: z.string().optional(),
            username: z.string().optional(),
            password: z.string().optional(),
        }),
    ),
    async (c) => {
        const body = c.req.valid('form')
        const [loggedIn, id] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME))
        if (!loggedIn) return c.redirect('/panel')
        const urlId = randomUUID()
        // TODO: find a better way than using a zero index
        const access = (await db.insert(untisAccesses).values({
            name: body.name,
            domain: body.domain,
            school: body.school,
            timezone: body.timezone,
            type: body.type,
            urlId,
            userId: id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).returning({ untisAccessId: untisAccesses.untisAccessId }))[0]
        if (body['type'] === 'public') {
            if (!body.classes) return c.redirect('/panel')
            await db.insert(publicUntisAccesses).values({
                untisAccessId: access.untisAccessId,
                classId: body.classes,
            })
        } else {
            if (!body.username || !body.password) return c.redirect('/panel')
            await db.insert(privateUntisAccesses).values({
                untisAccessId: access.untisAccessId,
                username: body.username,
                password: body.password,
            })
        }
        return c.redirect(`/panel/${urlId}`)
    }
)

app.get('/:urlId', async (c) => {
    const urlId = c.req.param('urlId')
    const [loggedIn, id] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME))
    if (!loggedIn) return c.redirect('/')

    // TODO: find a better way than using a zero index
    const untisAccess = (await db.select()
        .from(untisAccesses)
        .leftJoin(privateUntisAccesses, eq(untisAccesses.untisAccessId, privateUntisAccesses.untisAccessId))
        .leftJoin(publicUntisAccesses, eq(untisAccesses.untisAccessId, publicUntisAccesses.untisAccessId))
        .where(and(eq(untisAccesses.urlId, urlId), eq(untisAccesses.userId, id)))
    )[0]

    const url = `${process.env.API_URL}/ics/${untisAccess.untisAccesses.urlId}`

    return c.html(
        <Layout title={untisAccess.untisAccesses.name} loggedIn={true}>
            <h2>{untisAccess.untisAccesses.name}</h2>
            <p>Name: {untisAccess.untisAccesses.name}</p>
            <p>Url for ICS: {url} <button onclick-copy={url} className="btn btn-secondary">Copy</button></p>
            <p>UrlID: {untisAccess.untisAccesses.urlId}</p>
            <p>School: {untisAccess.untisAccesses.school}</p>
            <p>Domain: {untisAccess.untisAccesses.domain}</p>
            <p>Timezone: {untisAccess.untisAccesses.timezone}</p>
            {(untisAccess.untisAccesses.type === 'public' && untisAccess.publicUntisAccesses) ? (
                <>
                    <p>Type: Public Timetable</p>
                    <p>ClassID: {untisAccess.publicUntisAccesses.classId}</p>
                </>
            ) : (untisAccess.privateUntisAccesses) ? (
                <>
                    <p>Type: Private Timetable</p>
                    <p>Untis Username: {untisAccess.privateUntisAccesses.username}</p>
                    <p>Untis Password: {untisAccess.privateUntisAccesses.password}</p>
                </>
            ) : 'DB SCHEMA ERROR: field type and existing relations do not match'}
            <form id="deleteForm" action="/panel/delete" method="post" submit-delete-confirm>
                <input type="hidden" name="id" id="id" value={untisAccess.untisAccesses.untisAccessId}/>
                <button type="submit" className="btn btn-danger">Delete</button>
            </form>
        </Layout>
    )
})

app.post(
    '/delete',
    zValidator(
        'form',
        z.object({
            id: z.string(),
        }),
    ),
    async (c) => {
        const body = c.req.valid('form')
        const [loggedIn, id] = isLoggedIn(getCookie(c, AUTH_COOKIE_NAME))
        if (!loggedIn) return c.redirect('/')

        await db.delete(untisAccesses).where(and(eq(untisAccesses.untisAccessId, parseInt(body.id)), eq(untisAccesses.userId, id)))
        return c.redirect('/panel')
    }
)

export default app