/**
 * Deterministic reference code for the Citizen Compliance Slip — not a
 * scannable QR. A real QR would mean adding a dependency for a feature whose
 * only job here is "looks verifiable"; the spec explicitly allows a simple
 * reference code instead. Same inputs always produce the same code (no
 * Math.random/Date.now), and the inputs include enough fields that two
 * different plots queried on the same day won't display the same code.
 */

function fnv1a(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function makeReferenceCode(parts: {
  asOf: string
  plotArea: number | null
  roadWidth: number | null
  use: string | null
  zone: string | null
  versionIds: string[]
}): string {
  const key = [
    parts.asOf,
    parts.plotArea ?? '',
    parts.roadWidth ?? '',
    parts.use ?? '',
    parts.zone ?? '',
    parts.versionIds.join(','),
  ].join('|')
  const hash = fnv1a(key).toString(36).toUpperCase().padStart(6, '0').slice(0, 6)
  const datePart = parts.asOf.replace(/-/g, '')
  return `NS-${datePart}-${hash}`
}
