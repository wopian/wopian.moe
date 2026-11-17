// 5px top padding plus a 26px number label. Keep gallery CSS in sync.
const frameHeight = 31

export function photoLayout(aspectRatios: number[], columns: number) {
  if (!Number.isInteger(columns) || columns < 1) throw new Error('Invalid photo column count')
  const heights = Array.from({ length: columns }, () => ({ units: 0, count: 0 }))
  const positions = aspectRatios.map(aspectRatio => {
    if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) throw new Error('Invalid photo aspect ratio')
    // Balance image heights and frames using a representative column width.
    const column = heights.reduce((shortest, height, index) =>
      height.units * 300 + height.count * (frameHeight + 16)
        < heights[shortest]!.units * 300 + heights[shortest]!.count * (frameHeight + 16) ? index : shortest, 0)
    const position = { column, ...heights[column]! }
    heights[column]!.units += 1 / aspectRatio
    heights[column]!.count++
    return position
  })
  return { positions, heights }
}

export function photoLayoutStyles(aspectRatios: number[]) {
  const photos = aspectRatios.map(() => ({} as Record<string, string | number>))
  const container: Record<string, string> = {}
  for (const columns of [1, 2, 3, 4, 5]) {
    const { positions, heights } = photoLayout(aspectRatios, columns)
    const height = (units: number, count: number, gaps: number) =>
      `calc(var(--gallery-image-width) * ${units} + ${count * frameHeight}px + ${gaps} * var(--gallery-gap))`
    container[`--height-${columns}`] = `max(0px, ${heights.filter(item => item.count).map(item => height(item.units, item.count, item.count - 1)).join(', ') || '0px'})`
    positions.forEach((position, index) => {
      photos[index]![`--column-${columns}`] = position.column
      photos[index]![`--top-${columns}`] = height(position.units, position.count, position.count)
    })
  }
  return { photos, container }
}
