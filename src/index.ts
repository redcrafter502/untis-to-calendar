import app from '@/app.js'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'

app.use('/public/*', serveStatic({ root: './' }))

serve(app)
