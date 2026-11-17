import { describe, expect, test } from 'bun:test'
import { resolve } from 'node:path'
import { albumRoutes } from '../scripts/album-routes'
import { albumYears, filterAlbums, formatAlbumDate, normalizeAlbum, photoUrls, populatedAlbums, showcases, swipeDirection, trailingPath } from '../shared/portfolio'

const album = { title: 'Event', path: '/concerts/event', date: '2026-02-01' }

describe('album content contracts', () => {
  test('null entries and blank covers never count as photos', () => {
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


describe('archive browsing', () => {
  const image = 'https://cdn.wopian.me/photos/2026/test.avif'
  const albums = populatedAlbums([
    { ...album, title: 'ASP in the UK', location: ['London', 'Bristol'], date: ['2025-09-21', '2025-09-25'], images: [image] },
    { ...album, path: '/concerts/another', title: 'Another show', location: null, images: [image] },
    { ...album, path: '/concerts/older', title: 'Older show', location: 'London', date: '2024-01-01', images: [image] },
  ])
  test('search matches title or normalized location and combines with year', () => {
    expect(filterAlbums(albums, '  aSp  ', '2025').map(item => item.title)).toEqual(['ASP in the UK'])
    expect(filterAlbums(albums, 'BRISTOL', '').map(item => item.title)).toEqual(['ASP in the UK'])
    expect(filterAlbums(albums, 'london', '2024').map(item => item.title)).toEqual(['Older show'])
    expect(filterAlbums(albums, 'ASP', '2024')).toEqual([])
    expect(filterAlbums(albums, 'missing', '')).toEqual([])
  })
  test('cleared filters restore all albums in original order, including missing locations', () => {
    const before = [...albums]
    filterAlbums(albums, 'london', '')
    expect(filterAlbums(albums, '', '')).toEqual(before)
    expect(albums).toEqual(before)
  })
  test('year options use valid UTC years and support multiple event dates', () => {
    expect(albumYears(['2024-12-31', '2025-01-01', '2025-01-02', 'invalid'])).toEqual(['2025', '2024'])
    expect(albumYears('invalid')).toEqual([])
    expect(albumYears('2025-01-01T00:30:00+01:00')).toEqual(['2024'])
  })
  test('curated frames belong to linked albums and never repeat', async () => {
    for (const showcase of showcases) {
      const markdown = await Bun.file(resolve(`content${showcase.albumPath}.md`)).text()
      const images = markdown.split('images:')[1] ?? ''
      const frames = [showcase.photoUrl, ...(showcase.supportingPhotos ?? []).map(photo => photo.url)]
      expect(new Set(frames).size).toBe(frames.length)
      for (const frame of frames) expect(images).toContain(frame)
    }
  })
})
