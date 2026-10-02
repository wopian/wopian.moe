export type Genre = 'concerts' | 'cosplay' | 'motorsport' | 'other'
export type PrimaryGenre = Exclude<Genre, 'other'>
export interface AlbumSource {
  title: string
  path: string
  date: string | string[]
  location?: string | string[] | null
  cover?: string | null
  images?: (string | null)[] | null
}
export interface Album extends Omit<AlbumSource, 'images' | 'cover' | 'location'> {
  images: string[]
  cover?: string
  location: string
}
export interface Showcase {
  genre: PrimaryGenre
  label: string
  number: string
  albumPath: string
  photoUrl: string
  focalPosition: string
  title: string
  description: string
}
export const showcases: Showcase[] = [
  { genre: 'concerts', label: 'Concerts', number: '01',
    albumPath: '/concerts/2025-09-21-asp-in-the-uk',
    photoUrl: 'https://cdn.wopian.me/photos/2025/DSCF0233.avif',
    focalPosition: '60% 40%', title: 'ASP in the UK',
    description: 'Lights down. Volume up. Right there in the crowd.' },
  { genre: 'cosplay', label: 'Cosplay', number: '02',
    albumPath: '/cosplay/2024-06-22-secret-con-prison',
    photoUrl: 'https://cdn.wopian.me/photos/2022/WOPA1199.avif',
    focalPosition: '0% 0%', title: 'Secret Con Gloucester Prison II',
    description: 'Extraordinary characters. Stories brought to life.' },
  { genre: 'motorsport', label: 'Motorsport', number: '03',
    albumPath: '/motorsport/2020-02-23-london-classic-car-show',
    photoUrl: 'https://cdn.wopian.me/photos/2020/2WOP1346.avif',
    focalPosition: '55% 50%', title: 'London Classic Car Show',
    description: 'Machines with presence. Details worth a closer look.' },
]
export const genreDetails: Record<Genre, { label: string; number: string; heading: string; description: string }> = {
  concerts: { label: 'Concerts', number: '01', heading: 'Feel the noise.', description: 'Live music, electric crowds, and the moments between the lights. A view from the front.' },
  cosplay: { label: 'Cosplay', number: '02', heading: 'Beyond the ordinary.', description: 'Character, craft, and imagination. Portraits of the people who bring another world to life.' },
  motorsport: { label: 'Motorsport', number: '03', heading: 'Made to move.', description: 'From the paddock to the smallest detail. An appreciation for machines, motion, and the people behind them.' },
  other: { label: 'Other photography', number: '04', heading: 'Along the way.', description: 'Places, people, and details outside the usual frame. Photographs from everywhere else.' },
}
export function photoUrls(images: AlbumSource['images']): string[] {
  return (images ?? []).filter((image): image is string => {
    if (typeof image !== 'string' || !image.trim()) return false
    try { return ['https:', 'http:'].includes(new URL(image).protocol) } catch { return false }
  })
}
export function originalPhoto(url: string): string {
  return url.startsWith('https://cdn.wopian.me/thumbnails/') ? url.replace('/thumbnails/', '/photos/') : url
}
export function normalizeAlbum(source: AlbumSource): Album {
  const images = photoUrls(source.images)
  const validCover = photoUrls(source.cover ? [source.cover] : [])[0]
  return { ...source, images, cover: validCover ? originalPhoto(validCover) : images[0],
    location: Array.isArray(source.location) ? source.location.join(' / ') : source.location || '' }
}
export function albumTimestamp(date: string | string[]): number {
  const timestamp = Date.parse(Array.isArray(date) ? date[0] ?? '' : date)
  return Number.isFinite(timestamp) ? timestamp : 0
}
export function populatedAlbums(sources: AlbumSource[]): Album[] {
  return sources.map(normalizeAlbum).filter(album => album.images.length > 0)
    .sort((a, b) => albumTimestamp(b.date) - albumTimestamp(a.date) || a.path.localeCompare(b.path))
}
const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
export function formatAlbumDate(date: string | string[]): string {
  const dates = (Array.isArray(date) ? date : [date]).filter(value => Number.isFinite(Date.parse(value)))
  if (!dates.length) return ''
  const first = dateFormatter.format(new Date(dates[0]!))
  const last = dateFormatter.format(new Date(dates.at(-1)!))
  return first === last ? first : `${first} – ${last}`
}
export function trailingPath(path: string): string {
  return path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`
}
export function swipeDirection(start: { x: number; y: number }, end: { x: number; y: number }): -1 | 0 | 1 {
  const distance = end.x - start.x
  if (Math.abs(distance) < 60 || Math.abs(distance) <= Math.abs(end.y - start.y)) return 0
  return distance < 0 ? 1 : -1
}
