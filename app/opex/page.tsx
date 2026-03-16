// app/opex/page.tsx
'use client'
import React, { useState } from 'react'
import { useModelStore } from '@/store/modelStore'
import { OpexItem } from '@/types/model'
import { fmtGEL } from '@/lib/calculations'
import { generateTimeline } from '@/lib/time'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function OpexPage() {
  const store = useModelStore()
  const { opexItems, addOpexItem, updateOpexItem, removeOpexItem, ops } = store
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const timeline = generateTimeline(store.config.startDate, store.config.modelLengthMonths)

  function newItem(): Omit<OpexItem, 'id'> {
    return {
      name: 'New Expense',
      category: 'G&A',
      customCategoryId: undefined,
      monthlyAmount: Array(store.config.modelLengthMonths).fill(0),
      inflationAdjusted: true,
      isSalary: false,
    }
  }

  const handleAdd = () => {
    const item = newItem()
    addOpexItem(item)
  }

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getAnnualTotal = (monthlyAmounts: number[]) => {
    const annualTotals: number[] = []
    for (let i = 0; i < store.config.modelLengthMonths / 12; i++) {
      const yearSlice = monthlyAmounts.slice(i * 12, (i + 1) * 12)
      annualTotals.push(yearSlice.reduce((a, b) => a + b, 0))
    }
    return annualTotals
  }

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Operating Expenses (OPEX)</h1>
            <p className="text-sm text-slate-500">
              Define all recurring business costs. Salaries will have a {(store.taxRates.pensionRate * 100).toFixed(0)}% pension contribution added (2% employer, 2% employee). ინფლაცია: {ops.inflationRate}%
            </p>
          </div>
          <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            {store.language === 'ka' ? 'ხარჯის დამატება' : 'Add Expense'}
          </button>
        </div>

      {opexItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-slate-300 mb-6">
          <p className="text-slate-400 text-sm mb-4">ხარჯები არ არის დამატებული</p>
          <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
            <Plus size={15} /> {store.language === 'ka' ? 'პირველი ხარჯის დამატება' : 'Add First Expense'}
          </button>
        </div>
      )}

      {opexItems.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left font-semibold p-3 w-1/3">Expense Name</th>
                {Array.from({ length: store.config.modelLengthMonths / 12 }).map((_, i) => (
                  <th key={i} className="text-right font-semibold p-3">Year {i + 1} Total</th>
                ))}
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {opexItems.map((item: OpexItem) => (
                <React.Fragment key={item.id}>
                  <tr className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="p-3 flex items-center gap-2">
                      <button onClick={() => toggleExpand(item.id)} className="text-slate-400 hover:text-slate-700">
                        {expanded[item.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateOpexItem(item.id, { name: e.target.value })}
                        className="font-medium text-slate-800 bg-transparent outline-none w-full"
                      />
                    </td>
                    {getAnnualTotal(item.monthlyAmount).map((total, i) => (
                      <td key={i} className="text-right p-3 font-mono text-slate-700">{fmtGEL(total)}</td>
                    ))}
                    <td className="text-center p-3">
                      <button onClick={() => removeOpexItem(item.id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expanded[item.id] && (
                      <tr>
                        <td colSpan={2 + (store.config.modelLengthMonths / 12)}>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-slate-100 p-4">
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                                  <select
                                    value={item.category}
                                    onChange={(e) => updateOpexItem(item.id, { category: e.target.value as OpexItem['category'] })}
                                    className="w-full p-1.5 border border-slate-300 rounded-md text-sm"
                                  >
                                    <option value="G&A">General & Admin</option>
                                    <option value="S&M">Sales & Marketing</option>
                                    <option value="R&D">Research & Development</option>
                                  </select>
                                </div>
                                <div className="flex items-end gap-4">
                                  <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={item.isSalary}
                                      onChange={(e) => updateOpexItem(item.id, { isSalary: e.target.checked })}
                                      className="accent-blue-600"
                                    />
                                    Salary line (+ {(store.taxRates.pensionRate / 2 * 100).toFixed(0)}% employer pension)
                                  </label>
                                  <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={item.inflationAdjusted}
                                      onChange={(e) => updateOpexItem(item.id, { inflationAdjusted: e.target.checked })}
                                      className="accent-blue-600"
                                    />
                                    Adjust for Inflation
                                  </label>
                                </div>
                              </div>
                              <div className="grid grid-cols-12 gap-1">
                                {timeline.map((t) => (
                                  <div key={t.index}>
                                    <label className="text-xs text-slate-500">{t.shortLabel}</label>
                                    <input
                                      type="number"
                                      inputMode="decimal"
                                      value={item.monthlyAmount[t.index] ?? 0}
                                      onChange={(e) => {
                                        const newAmounts = [...item.monthlyAmount]
                                        newAmounts[t.index] = Number(e.target.value)
                                        updateOpexItem(item.id, { monthlyAmount: newAmounts })
                                      }}
                                      onFocus={(e) => e.target.select()}
                                      className="w-full p-1 border border-slate-300 rounded-md text-xs font-mono text-right"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  )
}