// Stable randomness keeps server rendering and hydration in agreement.
export function photoRotation(photo: string, maximumDegrees = 2): string {
  let hash = 0
  for (const character of photo) hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0
  const steps = Math.round(maximumDegrees * 100)
  return `${(hash % (steps * 2 + 1) - steps) / 100}deg`
}
