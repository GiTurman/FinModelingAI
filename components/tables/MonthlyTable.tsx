'use client'
// components/tables/MonthlyTable.tsx
import { fmtGEL, fmtPct } from '@/lib/calculations'
import { MonthColumn } from '@/types/model'

export interface TableRow {
  id: string
  label: string
  values: number[]
  type?: 'normal' | 'subtotal' | 'total' | 'section' | 'indent'
  format?: 'gel' | 'percent' | 'number'
  inverted?: boolean
}

interface Props {
  columns: MonthColumn[]
  rows: TableRow[]
}

export default function MonthlyTable({ columns, rows }: Props) {
  return (
    <div className="table-scroll">
      <table className="fm-table">
        <thead>
          <tr>
            <th className="text-left">Item</th>
            {columns.map((c) => (
              <th key={c.index}>{c.yearLabel} {c.monthLabel}</th>
            ))}
          </tr>
          <tr className="bg-slate-700">
            <th className="text-left sticky left-0 bg-slate-700 text-slate-300">Date</th>
            {columns.map((c) => (
              <th key={c.index} className="text-slate-300 font-normal">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.type === 'section') {
              return (
                <tr key={row.id} className="row-section">
                  <td colSpan={columns.length + 1}>{row.label}</td>
                </tr>
              )
            }

            const rowClass = row.type === 'subtotal' ? 'row-subtotal' : row.type === 'total' ? 'row-total' : ''

            return (
              <tr key={row.id} className={rowClass}>
                <td className={`text-left ${row.type === 'indent' ? 'pl-6 text-slate-500' : ''} ${row.type === 'total' ? 'text-white bg-slate-800' : ''}`}>
                  {row.label}
                </td>
                {columns.map((col, i) => {
                  const val = row.values[i]
                  const isNeg = row.inverted ? val > 0 : val < 0
                  return (
                    <td key={col.index} className={`${isNeg ? 'negative' : ''} ${row.type === 'total' ? 'text-white' : ''}`}>
                      {row.format === 'percent' ? fmtPct(val) : fmtGEL(val)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
