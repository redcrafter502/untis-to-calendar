import app from '@/app.js'
import {serve} from '@hono/node-server'

console.log('NODE')

serve(app)