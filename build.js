//const esbuild = require('esbuild')
import esbuild from 'esbuild'
import {glob} from 'glob'

console.log('in File')

esbuild.build({
    //entryPoints: ['./src/index.tsx'],
    entryPoints: glob.sync('./src/**/*.{ts,tsx}'),
    outdir: './dist',
    bundle: false,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
    },
    //external: ['dotenv'],
    //external: ['fs'],
    logLevel: 'info',
}).catch(err => {
    console.log(err)
    process.exit(1)
})