import { describe, expect, test } from 'bun:test'
import { resolve } from 'node:path'
import { albumRoutes } from '../scripts/album-routes'
import { formatAlbumDate, normalizeAlbum, photoUrls, populatedAlbums, showcases, swipeDirection, trailingPath } from '../shared/portfolio'

const album = { title: 'Event', path: '/concerts/event', date: '2026-02-01' }

describe('album content contracts', () => {
  test('null entries and blank covers never count as photographs', () => {
    expect(photoUrls([null, '', 'invalid', 'javascript:alert(1)', 'https://cdn.wopian.me/photos/2026/test.avif'])).toEqual(['https://cdn.wopian.me/photos/2026/test.avif'])
    expect(normalizeAlbum({ ...album, cover: null, images: [null] }).images).toEqual([])
  })
  test('cover uses original source; missing cover uses first valid photograph', () => {
    const image = 'https://cdn.wopian.me/photos/2026/test.avif'
    expect(normalizeAlbum({ ...album, cover: image.replace('/photos/', '/thumbnails/') }).cover).toBe(image)
    expect(normalizeAlbum({ ...album, cover: '', images: [null, image] }).cover).toBe(image)
  })
  test('listings omit empty albums and sort date ranges without mutating input', () => {
    const sources = [{ ...album, path: '/old', date: '2020-01-01', images: ['https://example.com/old.avif'] }, { ...album, path: '/empty', images: [null] }, { ...album, path: '/new', date: ['2026-02-01', '2026-02-03'], images: ['https://example.com/new.avif'] }]
    expect(populatedAlbums(sources).map(item => item.path)).toEqual(['/new', '/old'])
    expect(sources[0]?.path).toBe('/old')
  })
  test('UK dates use UTC and complete range, including three dates', () => {
    expect(formatAlbumDate('2026-02-01')).toBe('1 Feb 2026')
    expect(formatAlbumDate(['2025-09-21', '2025-09-22', '2025-09-25'])).toBe('21 Sept 2025 – 25 Sept 2025')
    expect(formatAlbumDate('invalid')).toBe('')
  })
  test('all existing albums retain static routes, including empty albums', async () => {
    const routes = await albumRoutes(resolve('content'))
    expect(new Set(routes).size).toBe(routes.length)
    expect(routes.length).toBe(69)
    expect(routes).toContain('/other/2025-10-01-japan')
    expect(routes).toContain('/software')
    for (const showcase of showcases) expect(routes).toContain(showcase.albumPath)
  })
  test('Caddy directory URLs have exactly one trailing slash', () => {
    expect(trailingPath('/')).toBe('/')
    expect(trailingPath('/cosplay//')).toBe('/cosplay/')
  })
  test('swipe ignores short, vertical, and diagonal gestures', () => {
    const start = { x: 100, y: 100 }
    expect(swipeDirection(start, { x: 20, y: 110 })).toBe(1)
    expect(swipeDirection(start, { x: 180, y: 100 })).toBe(-1)
    expect(swipeDirection(start, { x: 70, y: 100 })).toBe(0)
    expect(swipeDirection(start, { x: 170, y: 190 })).toBe(0)
  })
})
