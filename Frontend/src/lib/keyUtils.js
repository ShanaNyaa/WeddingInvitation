/**
 * Generates a short unique invite key.
 * Format: 3-letter prefix from family name + '-' + 4 random alphanumeric chars
 * e.g. "Family Ahmad" → "FAM-A3X9"
 */
export function generateSecretKey(familyName) {
  const prefix = familyName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3)
    .padEnd(3, 'X')

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  const array = new Uint8Array(4)
  crypto.getRandomValues(array)
  for (const byte of array) {
    suffix += chars[byte % chars.length]
  }

  return `${prefix}-${suffix}`
}
