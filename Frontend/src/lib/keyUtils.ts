export function generateSecretKey(familyName: string): string {
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
