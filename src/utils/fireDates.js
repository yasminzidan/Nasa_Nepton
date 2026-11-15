export function getFireDateKey(value) {
  if (typeof value !== 'string') return null

  const normalized = value.match(/^(\d{4}):(\d{2})-\s*(\d{2})$/)
    ? value.replace(/^(\d{4}):(\d{2})-\s*(\d{2})$/, '$1-$2-$3')
    : value

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null

  const [year, month, day] = normalized.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? normalized
    : null
}

export function shiftDateKey(dateKey, amount) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + amount))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

export function dateKeyDistance(firstDateKey, secondDateKey) {
  const toTimestamp = (dateKey) => {
    const [year, month, day] = dateKey.split('-').map(Number)
    return Date.UTC(year, month - 1, day)
  }
  return Math.round((toTimestamp(secondDateKey) - toTimestamp(firstDateKey)) / 86400000)
}
