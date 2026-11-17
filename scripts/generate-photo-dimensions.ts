import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { collectPhotoUrls, fetchPhotoMetadata } from './photo-dimensions'
import { validPhotoMetadata } from '../shared/photo-dimensions'
import type { PhotoMetadata } from '../shared/photo-dimensions'

const outputPath = resolve('shared/generated/photo-dimensions.json')
const cachePath = resolve('.cache/photo-dimensions.json')

async function readDimensions(path: string): Promise<Record<string, PhotoMetadata>> {
  let source: string
  try { source = await readFile(path, 'utf8') } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {}
    throw error
  }
  const parsed = JSON.parse(source)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error(`Invalid photo dimension cache: ${path}`)
  return Object.fromEntries(Object.entries(parsed).filter(([, size]) => validPhotoMetadata(size))) as Record<string, PhotoMetadata>
}

async function writeDimensions(path: string, sizes: Record<string, PhotoMetadata>) {
  const data = JSON.stringify(Object.fromEntries(Object.keys(sizes).sort().map(url => [url, sizes[url]])), null, 2) + '\n'
  if (await readFile(path, 'utf8').catch(() => '') === data) return
  await mkdir(dirname(path), { recursive: true })
  const temporaryPath = `${path}.${process.pid}.tmp`
  await writeFile(temporaryPath, data)
  await rename(temporaryPath, path)
}

const urls = await collectPhotoUrls(resolve('content'))
const sizes = await readDimensions(cachePath)
// Published metadata wins; retain freshly cached previews during initial migration.
for (const [url, committed] of Object.entries(await readDimensions(outputPath))) {
  const cached = sizes[url]
  sizes[url] = !committed.thumbhash && cached?.aspectRatio === committed.aspectRatio
    ? { ...cached, ...committed } : committed
}
const refresh = process.argv.includes('--refresh')
const missing = refresh ? urls : urls.filter(url => !sizes[url]?.thumbhash)
const failures: string[] = []
console.log(`Photo metadata: ${urls.length} originals, ${missing.length} to inspect.`)
for (let start = 0; start < missing.length; start += 8) {
  const batch = missing.slice(start, start + 8)
  const results = await Promise.allSettled(batch.map(url => fetchPhotoMetadata(url, refresh ? undefined : sizes[url])))
  results.forEach((result, index) => {
    const url = batch[index]!
    if (result.status === 'fulfilled') sizes[url] = result.value
    else failures.push(`${url}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`)
  })
  await writeDimensions(cachePath, sizes)
  if ((start + 8) % 64 === 0 || start + 8 >= missing.length) console.log(`Prepared ${Math.min(start + 8, missing.length)}/${missing.length} photo previews.`)
}
if (failures.length) throw new Error(`Missing metadata for ${failures.length} photos.\n${failures.slice(0, 5).join('\n')}`)
await writeDimensions(cachePath, Object.fromEntries(urls.map(url => [url, sizes[url]!])))
await writeDimensions(outputPath, Object.fromEntries(urls.map(url => [url, sizes[url]!])))
console.log(`Prepared aspect ratios and ThumbHash previews for ${urls.length} original photos.`)
