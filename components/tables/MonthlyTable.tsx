'use client'
import React from 'react'
import { fmtGEL } from '@/lib/calculations'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface TableRow {
  id: string
  label: string
  values: number[]
  type: 'section' | 'subtotal' | 'total' | 'normal' | 'indent'
  format?: 'currency' | 'percent'
  inverted?: boolean
}

interface MonthlyTableProps {
  columns: any[]
  rows: TableRow[]
}

export default function MonthlyTable({ columns, rows }: MonthlyTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="text-left p-3 sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10 border-b border-slate-200 dark:border-slate-800 min-w-[200px]">
                Line Item
              </th>
              {columns.map((col) => (
                <th key={col.index} className="text-right p-3 border-b border-slate-200 dark:border-slate-800 min-w-[100px]">
                  <div className="text-[10px] uppercase tracking-wider opacity-60">{col.yearLabel}</div>
                  <div>{col.monthLabel}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr 
                key={row.id} 
                className={cn(
                  "hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors",
                  row.type === 'section' && "bg-slate-100/50 dark:bg-slate-800/20 font-bold text-slate-900 dark:text-white",
                  row.type === 'total' && "bg-blue-50/30 dark:bg-blue-900/10 font-bold text-blue-900 dark:text-blue-300",
                  row.type === 'subtotal' && "font-semibold text-slate-800 dark:text-slate-200"
                )}
              >
                <td className={cn(
                  "p-3 sticky left-0 z-10 border-r border-slate-100 dark:border-slate-800",
                  row.type === 'section' ? "bg-slate-100 dark:bg-slate-800" : "bg-white dark:bg-slate-900",
                  row.type === 'indent' && "pl-8 text-slate-500 dark:text-slate-400"
                )}>
                  {row.label}
                </td>
                {row.values.map((val, i) => (
                  <td 
                    key={i} 
                    className={cn(
                      "p-3 text-right font-mono",
                      row.inverted && val !== 0 && "text-red-600 dark:text-red-400",
                      row.type === 'section' && "opacity-0"
                    )}
                  >
                    {row.type === 'section' ? '' : (
                      row.format === 'percent' 
                        ? `${(val * 100).toFixed(1)}%` 
                        : fmtGEL(val, true)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
