/** FRD §6.4 Typography: tabular numbers for financial metrics, ISO timestamps formatted for readability. */
export function formatMoney(wireAmount: string, currency = 'USD'): string {
  const value = Number.parseFloat(wireAmount)
  if (Number.isNaN(value)) return wireAmount
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso).getTime()
  if (Number.isNaN(date)) return iso
  const diffMs = Date.now() - date
  const diffSec = Math.round(diffMs / 1000)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSec) >= secondsInUnit) {
      return rtf.format(-Math.round(diffSec / secondsInUnit), unit)
    }
  }
  return rtf.format(-diffSec, 'second')
}

/** FRD §6.5: sensitive values masked by default (e.g. account numbers, transaction IDs). */
export function maskId(value: string, visibleStart = 4, visibleEnd = 4): string {
  if (value.length <= visibleStart + visibleEnd) return value
  return `${value.slice(0, visibleStart)}…${value.slice(-visibleEnd)}`
}

export function maskAccountNumber(accountNumber: string): string {
  const digits = accountNumber.replace(/\s/g, '')
  if (digits.length <= 4) return accountNumber
  return `**** **** ${digits.slice(-4)}`
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
