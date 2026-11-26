import { copyFile } from 'node:fs/promises'
import { build } from 'esbuild'
await copyFile('index.html','public/index.html')
await build({entryPoints:['portal.js'],bundle:true,minify:true,outfile:'public/portal.js',format:'esm',target:'es2020'})
