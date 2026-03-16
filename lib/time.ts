import { format, addMonths } from 'date-fns'

export interface TimePeriod {
  index: number
  label: string
  year: number
  month: number
  yearLabel: string
  monthLabel: string
  shortLabel?: string
}

export function generateTimeline(startDate: string, length: number): TimePeriod[] {
  const start = new Date(startDate)
  return Array.from({ length }).map((_, i) => {
    const d = addMonths(start, i)
    const year = Math.floor(i / 12) + 1
    const month = (i % 12) + 1
    return {
      index: i,
      label: format(d, 'MMM yyyy'),
      shortLabel: format(d, 'MMM'),
      year,
      month,
      yearLabel: `Y${year}`,
      monthLabel: `M${month}`,
    }
  })
}
