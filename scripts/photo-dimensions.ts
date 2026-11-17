import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { imageSize } from '@carboneio/image-size'
import sharp from 'sharp'
import { rgbaToThumbHash } from 'thumbhash'
import { parse } from 'yaml'
import { originalPhoto, photoUrls, showcases } from '../shared/portfolio'
import type { PhotoMetadata } from '../shared/photo-dimensions'

interface PhotoDimensions { width: number; height: number }

export function photoAspectRatio(size: PhotoDimensions): number {
  const aspectRatio = Number((size.width / size.height).toFixed(4))
  if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) throw new Error('Image has invalid aspect ratio')
  return aspectRatio
}

type FetchPhoto = (url: string, options: RequestInit) => Promise<Response>
const headerBytes = 256 * 1024
const maximumBytes = 16 * 1024 * 1024

export async function thumbhashFromBytes(bytes: Uint8Array): Promise<string> {
  const { data, info } = await sharp(bytes).autoOrient()
    .resize(64, 64, { fit: 'inside', withoutEnlargement: true })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return Buffer.from(rgbaToThumbHash(info.width, info.height, data)).toString('base64')
}

export async function fetchPhotoMetadata(url: string, knownMetadata?: PhotoMetadata, fetchPhoto: FetchPhoto = (url, options) => fetch(url, options)): Promise<PhotoMetadata> {
  const aspectRatio = knownMetadata?.aspectRatio ?? photoAspectRatio(await fetchPhotoDimensions(url, fetchPhoto))
  const thumbnail = url.startsWith('https://cdn.wopian.me/photos/') ? url.replace('/photos/', '/thumbnails/') : url
  let failure: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      let response = await fetchPhoto(thumbnail, { signal: AbortSignal.timeout(20_000) })
      if (thumbnail !== url && response.status === 404) {
        await response.body?.cancel()
        response = await fetchPhoto(url, { signal: AbortSignal.timeout(20_000) })
      }
      return { aspectRatio, thumbhash: await thumbhashFromBytes(await readImageBytes(response)) }
    } catch (error) {
      failure = error
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)))
    }
  }
  throw new Error(`Cannot generate photo preview: ${url} (${failure instanceof Error ? failure.message : String(failure)})`, { cause: failure })
}

export async function collectPhotoUrls(contentDirectory: string): Promise<string[]> {
  const urls = new Set(showcases.flatMap(showcase => [showcase.photoUrl, ...(showcase.supportingPhotos ?? []).map(photo => photo.url)]))
  async function visit(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) await visit(path)
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        const source = await readFile(path, 'utf8')
        const frontmatter = source.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
        if (!frontmatter) throw new Error(`Missing album frontmatter: ${path}`)
        const album = parse(frontmatter[1]!)
        if (!album || typeof album !== 'object') throw new Error(`Invalid album frontmatter: ${path}`)
        for (const url of photoUrls(Array.isArray(album.images) ? album.images : null)) urls.add(url)
        if (typeof album.cover === 'string') {
          for (const url of photoUrls([album.cover])) urls.add(originalPhoto(url))
        }
      }
    }
  }
  await visit(contentDirectory)
  return [...urls].sort()
}

export function dimensionsFromBytes(bytes: Uint8Array): PhotoDimensions {
  const size = imageSize(bytes)
  const rotated = size.orientation !== undefined && size.orientation >= 5 && size.orientation <= 8
  const result = rotated ? { width: size.height, height: size.width } : { width: size.width, height: size.height }
  if (!Number.isSafeInteger(result.width) || !Number.isSafeInteger(result.height) || result.width <= 0 || result.height <= 0) throw new Error('Image has invalid dimensions')
  return result
}

async function readImageBytes(response: Response): Promise<Uint8Array> {
  if (!response.ok) {
    await response.body?.cancel()
    throw new Error(`Photo returned HTTP ${response.status}`)
  }
  if (!response.body) throw new Error('Photo returned an empty response')
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.length
      if (length > maximumBytes) throw new Error('Photo metadata exceeds 16 MiB read limit')
      chunks.push(value)
    }
  } finally {
    await reader.cancel().catch(() => {})
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return bytes
}

export async function fetchPhotoDimensions(url: string, fetchPhoto: FetchPhoto = (url, options) => fetch(url, options)): Promise<PhotoDimensions> {
  let failure: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchPhoto(url, { headers: { Range: `bytes=0-${headerBytes - 1}` }, signal: AbortSignal.timeout(20_000) })
      const bytes = await readImageBytes(response)
      try { return dimensionsFromBytes(bytes) } catch (error) {
        // A partial response can end before the metadata block, particularly in AVIF.
        if (response.status !== 206) throw error
        return dimensionsFromBytes(await readImageBytes(await fetchPhoto(url, { signal: AbortSignal.timeout(20_000) })))
      }
    } catch (error) {
      failure = error
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)))
    }
  }
  throw new Error(`Cannot determine photo dimensions: ${url} (${failure instanceof Error ? failure.message : String(failure)})`, { cause: failure })
}
