import { expect, test } from 'bun:test'
import { chekiDateLines, chekiLocationLines } from '../shared/cheki-caption'

test('cheki dates use only the last album date, formatted in UTC', () => {
  expect(chekiDateLines('2026-10-23')).toEqual(['2026 / 10 / 23'])
  expect(chekiDateLines(['2025-09-21', '2025-09-22', '2025-09-25'])).toEqual(['2025 / 09 / 25'])
  expect(chekiDateLines('2026-10-23T23:30:00-02:00')).toEqual(['2026 / 10 / 24'])
  expect(chekiDateLines(['invalid', '2026-10-23', '2026-10-23'])).toEqual(['2026 / 10 / 23'])
  expect(chekiDateLines('invalid')).toEqual([])
  expect(chekiDateLines(['2026-10-23', 'invalid'])).toEqual([])
  expect(chekiDateLines([])).toEqual([])
})

test('location captions balance only the last venue across two lines', () => {
  expect(chekiLocationLines('The Underworld (London)')).toEqual(['The Underworld', '(London)'])
  const venues = ['Japan Matsuri (London)', 'The Fleece (Bristol)', 'The Underworld (London)']
  const lines = chekiLocationLines(venues)
  expect(lines).toHaveLength(2)
  expect(lines).toEqual(['The Underworld', '(London)'])
})

test('missing and single-word locations do not add empty caption lines', () => {
  expect(chekiLocationLines(null)).toEqual([])
  expect(chekiLocationLines([])).toEqual([])
  expect(chekiLocationLines('   ')).toEqual([])
  expect(chekiLocationLines('London')).toEqual(['London'])
})
