import app from '../src/index.js'
import {handle} from 'hono/vercel'

export const GET = handle(app)
export const POST = handle(app)