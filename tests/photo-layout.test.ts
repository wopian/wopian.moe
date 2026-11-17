import { describe, expect, test } from 'bun:test'
import { photoLayout, photoLayoutStyles, masonryLayout } from '../shared/photo-layout'

describe('ordered photo masonry', () => {
  test('equal photos read left to right, then down', () => {
    const layout = photoLayout(Array(9).fill(1.5), 4)
    expect(layout.positions.map(photo => photo.column)).toEqual([0, 1, 2, 3, 0, 1, 2, 3, 0])
    expect(layout.positions.slice(0, 4).every(photo => photo.count === 0)).toBe(true)
  })

  test('landscapes fill space beside a portrait without waiting for its row', () => {
    const layout = photoLayout([0.5, 2, 2, 2, 2, 2], 2)
    expect(layout.positions.map(photo => photo.column)).toEqual([0, 1, 1, 1, 1, 0])
    expect(layout.positions[2]!.units).toBe(0.5)
  })

  test('responsive layouts reserve space before images load', () => {
    const ratios = [1.5, 0.6667, 1, 2, 0.5, 1.5]
    const styles = photoLayoutStyles(ratios)
    for (const columns of [1, 2, 3, 4, 5]) {
      expect(styles.container[`--height-${columns}`]).toStartWith('max(')
      expect(styles.photos.every(photo => typeof photo[`--column-${columns}`] === 'number'
        && typeof photo[`--top-${columns}`] === 'string')).toBe(true)
      expect(photoLayout(ratios, columns).heights.reduce((total, column) => total + column.count, 0)).toBe(ratios.length)
    }
    expect(photoLayout([], 4).positions).toEqual([])
    expect(photoLayoutStyles([]).container['--height-4']).toBe('max(0px, 0px)')
  })

  test('rejects invalid geometry', () => {
    for (const columns of [0, -1, 1.5]) expect(() => photoLayout([1.5], columns)).toThrow()
    for (const ratio of [0, -1, Infinity, NaN]) expect(() => photoLayout([ratio], 2)).toThrow()
  })
})

describe('category album masonry', () => {
  test('albums start across columns and fill available space in source order', () => {
    const layout = masonryLayout([200, 500, 250, 300, 100, 180], 3, 24)
    expect(layout.positions).toEqual([
      { column: 0, top: 0 }, { column: 1, top: 0 }, { column: 2, top: 0 },
      { column: 0, top: 224 }, { column: 2, top: 274 }, { column: 2, top: 398 },
    ])
    expect(layout.height).toBe(578)
  })

  test('caption height changes preserve gaps and container height', () => {
    const layout = masonryLayout([420, 210, 90], 2, 20)
    expect(layout.positions).toEqual([{ column: 0, top: 0 }, { column: 1, top: 0 }, { column: 1, top: 230 }])
    expect(layout.height).toBe(420)
    expect(masonryLayout([420, 310, 90], 1, 20).positions.map(item => item.top)).toEqual([0, 440, 770])
    expect(masonryLayout([], 3, 24)).toEqual({ positions: [], height: 0 })
  })

  test('rejects invalid measured geometry', () => {
    expect(() => masonryLayout([100], 0, 24)).toThrow()
    expect(() => masonryLayout([100], 2, -1)).toThrow()
    expect(() => masonryLayout([NaN], 2, 24)).toThrow()
  })
})
