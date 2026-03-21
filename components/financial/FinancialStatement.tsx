'use client'
import React from 'react'
import { fmtGEL } from '@/lib/calculations'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { useModelStore } from '@/store/modelStore'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface FinancialRow {
  key: string
  label: string
  bold?: boolean
  indent?: number
  isHeader?: boolean
  isSeparator?: boolean
  isCheck?: boolean
  isPlaceholder?: boolean
}

interface FinancialStatementProps {
  title: string
  data: any[]
  rows: FinancialRow[]
  view: 'monthly' | 'quarterly' | 'annual'
  setView: (view: 'monthly' | 'quarterly' | 'annual') => void
  infoPanel?: React.ReactNode
}

export default function FinancialStatement({
  title,
  data,
  rows,
  view,
  setView,
  infoPanel
}: FinancialStatementProps) {
  const { language } = useModelStore()
  
  const filteredData = React.useMemo(() => {
    if (view === 'monthly') return data
    
    const periodSize = view === 'annual' ? 12 : 3
    const numPeriods = Math.ceil(data.length / periodSize)
    const result = []
    
    for (let i = 0; i < numPeriods; i++) {
      const slice = data.slice(i * periodSize, (i + 1) * periodSize)
      if (slice.length === 0) break
      
      const lastMonth = slice[slice.length - 1]
      const year = Math.floor((i * periodSize) / 12) + 1
      const quarter = Math.floor(((i * periodSize) % 12) / 3) + 1
      
      result.push({
        ...lastMonth,
        label: view === 'annual' ? `Year ${year}` : `Q${quarter} Y${year}`,
        monthLabel: view === 'annual' ? 'Total' : `Q${quarter}`,
        yearLabel: `Y${year}`
      })
    }
    return result
  }, [data, view])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h1>
          <p className="text-xs text-slate-400 mt-1">{language === 'ka' ? 'ფინანსური ანგარიშგება' : 'Financial Statement'} • {view === 'monthly' ? (language === 'ka' ? 'თვიური' : 'Monthly') : view === 'quarterly' ? (language === 'ka' ? 'კვარტალური' : 'Quarterly') : (language === 'ka' ? 'წლიური' : 'Annual')}</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {(['monthly', 'quarterly', 'annual'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                view === v 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {v === 'monthly' ? (language === 'ka' ? 'თვიური' : 'Monthly') : v === 'quarterly' ? (language === 'ka' ? 'კვარტალური' : 'Quarterly') : (language === 'ka' ? 'წლიური' : 'Annual')}
            </button>
          ))}
        </div>
      </div>

      {infoPanel && <div className="mb-4">{infoPanel}</div>}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="text-left p-3 sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10 border-b border-slate-200 dark:border-slate-800 min-w-[200px]">
                  {language === 'ka' ? 'მუხლი' : 'Line Item'}
                </th>
                {filteredData.map((col, i) => (
                  <th key={i} className="text-right p-3 border-b border-slate-200 dark:border-slate-800 min-w-[100px]">
                    <div className="text-[10px] uppercase tracking-wider opacity-60">{col.yearLabel}</div>
                    <div>{col.monthLabel || col.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row, rowIndex) => {
                if (row.isSeparator) {
                  return (
                    <tr key={`sep-${rowIndex}`} className="h-4 bg-slate-50/30 dark:bg-slate-800/10">
                      <td colSpan={filteredData.length + 1}></td>
                    </tr>
                  )
                }
                
                return (
                  <tr 
                    key={row.key} 
                    className={cn(
                      "hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors",
                      row.isHeader && "bg-slate-100/50 dark:bg-slate-800/20 font-bold text-slate-900 dark:text-white",
                      row.isCheck && "bg-amber-50/30 dark:bg-amber-900/10"
                    )}
                  >
                    <td className={cn(
                      "p-3 sticky left-0 z-10 border-r border-slate-100 dark:border-slate-800",
                      row.isHeader ? "bg-slate-100 dark:bg-slate-800" : "bg-white dark:bg-slate-900",
                      row.indent === 1 && "pl-8",
                      row.indent === 2 && "pl-12",
                      row.bold && "font-semibold text-slate-800 dark:text-slate-200",
                      row.isPlaceholder && "italic text-slate-400"
                    )}>
                      {row.label}
                    </td>
                    {filteredData.map((val, i) => (
                      <td 
                        key={i} 
                        className={cn(
                          "p-3 text-right font-mono",
                          row.isCheck && Math.abs(val[row.key]) > 1 ? "text-red-600 font-bold" : "text-slate-600 dark:text-slate-400",
                          row.bold && "text-slate-900 dark:text-white font-semibold"
                        )}
                      >
                        {fmtGEL(val[row.key], true)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
