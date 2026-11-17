import { describe, expect, test } from 'bun:test'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { collectPhotoUrls, dimensionsFromBytes, fetchPhotoDimensions, fetchPhotoMetadata, thumbhashFromBytes, photoAspectRatio } from '../scripts/photo-dimensions'
import { validPhotoMetadata, getPhotoAspectRatio, getPhotoPlaceholder } from '../shared/photo-dimensions'
import sharp from 'sharp'
import { thumbHashToAverageRGBA } from 'thumbhash'
import { showcases } from '../shared/portfolio'

// Real PNG header with adjustable dimensions; the header parser does not decode pixels.
function png(width: number, height: number) {
  const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')
  bytes.writeUInt32BE(width, 16)
  bytes.writeUInt32BE(height, 20)
  return bytes
}

describe('build-time photo dimensions', () => {
  test('reads landscape and portrait headers without decoding pixels', () => {
    expect(dimensionsFromBytes(png(6000, 4000))).toEqual({ width: 6000, height: 4000 })
    expect(dimensionsFromBytes(png(4000, 6000))).toEqual({ width: 4000, height: 6000 })
    expect(() => dimensionsFromBytes(png(0, 4000))).toThrow()
    expect(() => dimensionsFromBytes(new Uint8Array())).toThrow()
  })

  test('reads AVIF dimensions and applies JPEG EXIF orientation', async () => {
    const image = sharp({ create: { width: 30, height: 20, channels: 3, background: '#123456' } })
    expect(dimensionsFromBytes(await image.clone().avif().toBuffer())).toEqual({ width: 30, height: 20 })
    expect(dimensionsFromBytes(await image.clone().withMetadata({ orientation: 6 }).jpeg().toBuffer())).toEqual({ width: 20, height: 30 })
  })

  test('rounds aspect ratios to four decimals', () => {
    expect(photoAspectRatio({ width: 6000, height: 4000 })).toBe(1.5)
    expect(photoAspectRatio({ width: 4000, height: 6000 })).toBe(0.6667)
    expect(photoAspectRatio({ width: 5280, height: 3519 })).toBe(1.5004)
    expect(() => photoAspectRatio({ width: 0, height: 4000 })).toThrow()
  })

  test('accepts only positive finite ratios; unknown photos have no invented ratio', () => {
    for (const value of [null, {}, { aspectRatio: 0 }, { aspectRatio: -1 }, { aspectRatio: NaN }, { aspectRatio: Infinity }, { aspectRatio: '1.5' }]) {
      expect(validPhotoMetadata(value)).toBe(false)
    }
    expect(validPhotoMetadata({ aspectRatio: 0.6667 })).toBe(true)
    expect(getPhotoAspectRatio('https://example.test/unknown.avif')).toBeUndefined()
  })

  test('discovers nested album photos and original covers, deduplicating nulls and thumbnails', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'portfolio-dimensions-'))
    try {
      await mkdir(join(directory, 'concerts'))
      await writeFile(join(directory, 'concerts', 'event.md'), `---
title: Event
date: 2026-01-01
cover: https://cdn.wopian.me/thumbnails/2026/cover.avif
images:
  - https://cdn.wopian.me/photos/2026/one.avif
  - null
  - https://cdn.wopian.me/photos/2026/one.avif
  - javascript:bad
---
Album body with https://example.test/not-a-photo
`)
      const urls = await collectPhotoUrls(directory)
      expect(urls).toContain('https://cdn.wopian.me/photos/2026/cover.avif')
      expect(urls.filter(url => url.endsWith('/one.avif'))).toHaveLength(1)
      expect(urls.some(url => url.includes('/thumbnails/') || url.includes('not-a-photo') || url.startsWith('javascript:'))).toBe(false)
      expect(urls).toEqual([...urls].sort())
    } finally { await rm(directory, { recursive: true, force: true }) }
  })

  test('requests a bounded header range', async () => {
    let range: string | null = null
    const size = await fetchPhotoDimensions('https://example.test/photo.png', async (_url, options) => {
      range = new Headers(options.headers).get('Range')
      return new Response(png(4000, 6000), { status: 206 })
    })
    expect(range).toBe('bytes=0-262143')
    expect(size).toEqual({ width: 4000, height: 6000 })
  })

  test('cached generation needs no network and preserves committed ratios over older local cache', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'portfolio-cached-dimensions-'))
    try {
      await mkdir(join(directory, 'content'))
      await mkdir(join(directory, 'shared', 'generated'), { recursive: true })
      await mkdir(join(directory, '.cache'))
      const urls = [...new Set(showcases.flatMap(showcase => [showcase.photoUrl, ...(showcase.supportingPhotos ?? []).map(photo => photo.url)]))].sort()
      const thumbhash = await thumbhashFromBytes(await sharp({ create: { width: 2, height: 2, channels: 4, background: '#ff0090' } }).png().toBuffer())
      const committed = JSON.stringify(Object.fromEntries(urls.map(url => [url, { aspectRatio: 1.5, thumbhash }])), null, 2) + '\n'
      const output = join(directory, 'shared', 'generated', 'photo-dimensions.json')
      await writeFile(output, committed)
      await writeFile(join(directory, '.cache', 'photo-dimensions.json'), JSON.stringify(Object.fromEntries(urls.map(url => [url, { aspectRatio: 0.6667 }]))))
      const result = Bun.spawnSync([process.execPath, resolve('scripts/generate-photo-dimensions.ts')], { cwd: directory, stdout: 'pipe', stderr: 'pipe' })
      expect(new TextDecoder().decode(result.stderr)).toBe('')
      expect(result.exitCode).toBe(0)
      expect(new TextDecoder().decode(result.stdout)).toContain('0 to inspect')
      expect(await Bun.file(output).text()).toBe(committed)
    } finally { await rm(directory, { recursive: true, force: true }) }
  })

  test('interrupted preview generation keeps cached hashes when committed ratios match', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'portfolio-preview-migration-'))
    try {
      await mkdir(join(directory, 'content'))
      await mkdir(join(directory, 'shared', 'generated'), { recursive: true })
      await mkdir(join(directory, '.cache'))
      const urls = [...new Set(showcases.flatMap(showcase => [showcase.photoUrl, ...(showcase.supportingPhotos ?? []).map(photo => photo.url)]))].sort()
      const thumbhash = await thumbhashFromBytes(await sharp({ create: { width: 2, height: 2, channels: 4, background: '#123456' } }).png().toBuffer())
      const output = join(directory, 'shared', 'generated', 'photo-dimensions.json')
      await writeFile(output, JSON.stringify(Object.fromEntries(urls.map(url => [url, { aspectRatio: 1.5 }]))))
      await writeFile(join(directory, '.cache', 'photo-dimensions.json'), JSON.stringify(Object.fromEntries(urls.map(url => [url, { aspectRatio: 1.5, thumbhash }]))))
      const result = Bun.spawnSync([process.execPath, resolve('scripts/generate-photo-dimensions.ts')], { cwd: directory, stdout: 'pipe', stderr: 'pipe' })
      expect(result.exitCode).toBe(0)
      expect(new TextDecoder().decode(result.stdout)).toContain('0 to inspect')
      const published = JSON.parse(await Bun.file(output).text())
      expect(urls.every(url => published[url].thumbhash === thumbhash)).toBe(true)
    } finally { await rm(directory, { recursive: true, force: true }) }
  })

  test('falls back to the full response when a partial response lacks metadata', async () => {
    const ranges: (string | null)[] = []
    const size = await fetchPhotoDimensions('https://example.test/photo.png', async (_url, options) => {
      ranges.push(new Headers(options.headers).get('Range'))
      return ranges.length === 1 ? new Response(new Uint8Array(), { status: 206 }) : new Response(png(320, 240))
    })
    expect(ranges).toEqual(['bytes=0-262143', null])
    expect(size).toEqual({ width: 320, height: 240 })
  })

  test('retries transient failures and fails rather than inventing dimensions', async () => {
    let calls = 0
    await expect(fetchPhotoDimensions('https://example.test/unavailable.avif', async () => {
      calls++
      return new Response('Unavailable', { status: 503 })
    })).rejects.toThrow('Cannot determine photo dimensions')
    expect(calls).toBe(3)
  })

  test('encodes actual image colors while preserving original aspect ratio', async () => {
    const bytes = await sharp({ create: { width: 30, height: 20, channels: 4, background: '#ff0090' } }).png().toBuffer()
    const requests: string[] = []
    const metadata = await fetchPhotoMetadata('https://cdn.wopian.me/photos/test.avif', { aspectRatio: 1.5 }, async url => {
      requests.push(url)
      return new Response(bytes)
    })
    expect(requests).toEqual(['https://cdn.wopian.me/thumbnails/test.avif'])
    expect(metadata.aspectRatio).toBe(1.5)
    expect(metadata).not.toHaveProperty('width')
    expect(metadata).not.toHaveProperty('height')
    expect(metadata.thumbhash).toBe(await thumbhashFromBytes(bytes))
    const color = thumbHashToAverageRGBA(Buffer.from(metadata.thumbhash!, 'base64'))
    expect(color.r).toBeGreaterThan(0.9)
    expect(color.g).toBeLessThan(0.1)
    expect(color.b).toBeGreaterThan(0.45)
    expect(getPhotoPlaceholder('https://example.test/unknown.avif')).toBeUndefined()
  })

  test('uses original pixels when no CDN thumbnail exists', async () => {
    const bytes = await sharp({ create: { width: 2, height: 3, channels: 4, background: '#123456' } }).png().toBuffer()
    const requests: string[] = []
    const metadata = await fetchPhotoMetadata('https://cdn.wopian.me/photos/test.avif', { aspectRatio: 0.6667 }, async url => {
      requests.push(url)
      return url.includes('/thumbnails/') ? new Response(null, { status: 404 }) : new Response(bytes)
    })
    expect(requests).toEqual(['https://cdn.wopian.me/thumbnails/test.avif', 'https://cdn.wopian.me/photos/test.avif'])
    expect(metadata).toEqual({ aspectRatio: 0.6667, thumbhash: await thumbhashFromBytes(bytes) })
  })
})
