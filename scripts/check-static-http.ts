import { strict as assert } from 'node:assert'
import { readFile } from 'node:fs/promises'
import { albumRoutes } from './album-routes'

const base = process.argv[2] ?? 'http://127.0.0.1:3000'
const routes = await albumRoutes('content')
for (let attempt = 0; attempt < 20; attempt++) {
  try { if ((await fetch(base)).ok) break } catch { /* Preview may still be starting. */ }
  await Bun.sleep(200)
}
for (let offset = 0; offset < routes.length; offset += 6) {
  await Promise.all(routes.slice(offset, offset + 6).map(async route => {
    const response = await fetch(`${base}${route === '/' ? '/' : route + '/'}`)
    const html = await response.text()
    assert.equal(response.status, 200, route)
    assert.match(html, /<h1[\s>]/, `Missing rendered heading: ${route}`)
    assert(!html.includes('/_ipx/'), `Unexpected image processing URL: ${route}`)
    for (const image of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
      assert(image[1]?.startsWith('https://cdn.wopian.me/photos/'), `Photograph does not use original CDN URL: ${route}`)
    }
  }))
}
for (const route of ['/concerts', '/cosplay/2024-06-22-secret-con-prison', '/software']) {
  const response = await fetch(`${base}${route}?check=1`, { redirect: 'manual' })
  assert([301, 308].includes(response.status), `Directory redirect missing: ${route}`)
  assert(new URL(response.headers.get('location')!, base).pathname.endsWith('/'))
  assert.equal(new URL(response.headers.get('location')!, base).search, '?check=1')
}
for (const route of ['/missing-page/', '/concerts/missing-album/', '/_nuxt/missing.js']) {
  const response = await fetch(base + route)
  assert.equal(response.status, 404, `Missing page returns wrong status: ${route}`)
  assert.equal(response.headers.get('cache-control'), 'no-cache', `Missing page has unsafe cache policy: ${route}`)
  assert((await response.text()).includes('Outside the frame.'))
}
const manifest = JSON.parse(await readFile('.output/public/release-manifest.json', 'utf8'))
const wasm = Object.keys(manifest.files).find(path => path.endsWith('.wasm'))!
for (const path of [wasm, '__nuxt_content/concerts/sql_dump.txt', 'concerts/_payload.json']) {
  const response = await fetch(`${base}/${path}`)
  assert.equal(response.status, 200, `Browser content asset missing: ${path}`)
  assert((await response.arrayBuffer()).byteLength > 0)
}
console.log(`HTTP verified ${routes.length} rendered pages, directory redirects, custom 404 responses, and browser content assets.`)
