import { describe, expect, test } from 'bun:test'
import { photoLayout, photoLayoutStyles } from '../shared/photo-layout'

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
