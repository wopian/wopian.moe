import generated from './generated/photo-dimensions.json'
import { thumbHashToDataURL } from 'thumbhash'

export interface PhotoMetadata {
  aspectRatio: number
  thumbhash?: string
}

const metadata: Readonly<Record<string, PhotoMetadata>> = generated

export function validPhotoMetadata(value: unknown): value is PhotoMetadata {
  if (!value || typeof value !== 'object') return false
  const photo = value as Partial<PhotoMetadata>
  return typeof photo.aspectRatio === 'number' && Number.isFinite(photo.aspectRatio) && photo.aspectRatio > 0
}

export function getPhotoAspectRatio(url: string): number | undefined {
  return metadata[url]?.aspectRatio
}

const placeholders = new Map<string, string>()

export function getPhotoPlaceholder(url: string): string | undefined {
  const hash = metadata[url]?.thumbhash
  if (!hash) return undefined
  let placeholder = placeholders.get(hash)
  if (!placeholder) {
    placeholder = thumbHashToDataURL(Uint8Array.from(atob(hash), character => character.charCodeAt(0)))
    placeholders.set(hash, placeholder)
  }
  return placeholder
}
