import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { albumRoutes } from './album-routes'
import { writeStatic404 } from './static-404'

const root = resolve('.output/public')
const routes = await albumRoutes(resolve('content'))
const files: Record<string, string> = {}
let galleryPhotos = 0
await writeStatic404(root)

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

for (const route of routes) {
  const html = await readFile(join(root, route, 'index.html'), 'utf8')
  assert(/<h1[\s>][\s\S]*?<\/h1>/.test(html), `Missing rendered heading: ${route}`)
  assert(!html.includes('Internal Server Error'), `Error page exported: ${route}`)
  const canonical = `https://wopian.me${route === '/' ? '/' : `${route}/`}`
  assert(html.includes(`rel="canonical" href="${canonical}"`), `Missing canonical URL: ${route}`)
  assert(!html.includes('/_ipx/'), `Unexpected image processing URL: ${route}`)
  if (route.split('/').filter(Boolean).length === 2) {
    const source = await readFile(join('content', `${route.slice(1)}.md`), 'utf8')
    const count = [...source.matchAll(/^\s*-\s+https?:\/\/[^\s]+/gm)].length
    const renderedCount = [...html.matchAll(/class="gallery-photo"/g)].length
    assert(renderedCount === count, `Gallery is not rendered completely: ${route} (${renderedCount}/${count})`)
    galleryPhotos += count
  }
}
for (const collection of ['concerts', 'cosplay', 'motorsport', 'other']) {
  assert((await readFile(join(root, '__nuxt_content', collection, 'sql_dump.txt'))).length > 0, `Missing static content dump: ${collection}`)
}
assert((await readFile(join(root, '404.html'), 'utf8')).includes('Outside the frame.'), 'Missing custom static 404')

async function collect(directory: string) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await collect(path)
    else if (entry.isFile() && entry.name !== 'release-manifest.json') {
      files[relative(root, path).replaceAll('\\', '/')] = createHash('sha256').update(await readFile(path)).digest('hex')
    } else if (entry.isSymbolicLink()) throw new Error(`Unexpected output symlink: ${path}`)
  }
}
await collect(root)
assert(Object.keys(files).some(path => path.endsWith('.wasm')), 'Missing browser SQLite WASM')
await writeFile(join(root, 'release-manifest.json'), JSON.stringify({
  formatVersion: 1, revision: process.env.GITHUB_SHA ?? 'local', generatedAt: new Date().toISOString(), routes, files,
}, null, 2) + '\n')
assert(!Object.keys(files).some(path => path.startsWith('_ipx/')), 'Unexpected generated image processing output')
console.log(`Verified ${routes.length} static pages and ${galleryPhotos} gallery links. All photographs use original CDN URLs.`)
