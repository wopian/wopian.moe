import type { AlbumSource } from './portfolio'

export function chekiLocationLines(location: AlbumSource['location']): string[] {
  const text = (Array.isArray(location) ? location.at(-1) : location)?.trim() ?? ''
  if (!text) return []
  const words = text.split(/\s+/)
  if (words.length === 1) return words
  let split = 1
  let shortest = Infinity
  for (let index = 1; index < words.length; index++) {
    const longest = Math.max(words.slice(0, index).join(' ').length, words.slice(index).join(' ').length)
    if (longest < shortest) { shortest = longest; split = index }
  }
  return [words.slice(0, split).join(' '), words.slice(split).join(' ')]
}

export function chekiDateLines(date: AlbumSource['date']): string[] {
  const last = Array.isArray(date) ? date.at(-1) : date
  if (!last || !Number.isFinite(Date.parse(last))) return []
  return [new Date(last).toISOString().slice(0, 10).replaceAll('-', ' / ')]
}
