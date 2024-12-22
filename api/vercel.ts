// Because in vercel the api directory and the content of the dist directory are in the same parent directory
// @ts-ignore
import {GET as IMPORTED_GET, POST as IMPORTED_POST} from '../index.js'

export const GET = IMPORTED_GET
export const POST = IMPORTED_POST