// app/opex/page.tsx
'use client'
import React, { useState } from 'react'
import { useModelStore } from '@/store/modelStore'
import { OpexItem } from '@/types/model'
import { fmtGEL } from '@/lib/calculations'
import { generateTimeline } from '@/lib/time'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const MONTHS = 60

export default function OpexPage() {
  const { opexItems, addOpexItem, updateOpexItem, removeOpexItem, customCategories, config } = useModelStore()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const timeline = generateTimeline(config.startDate, config.modelLengthMonths)
  const isCategories = customCategories.filter(c => c.type === 'opex')

  function newItem(): Omit<OpexItem, 'id'> {
    return {
      name: 'New Expense',
      category: 'G&A',
      customCategoryId: undefined,
      monthlyAmount: Array(MONTHS).fill(0),
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
    for (let i = 0; i < MONTHS / 12; i++) {
      const yearSlice = monthlyAmounts.slice(i * 12, (i + 1) * 12)
      annualTotals.push(yearSlice.reduce((a, b) => a + b, 0))
    }
    return annualTotals
  }

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Operating Expenses (OPEX)</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Define all recurring business costs. Salaries will have a 4% pension contribution added.
            </p>
          </div>
          <button onClick={handleAdd} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Plus size={14} />
            Add Expense
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50">
          {opexItems.map((item) => (
            <div key={item.id} className="border-b border-slate-200 dark:border-slate-700/50 last:border-b-0">
              <div className="grid grid-cols-[auto,1fr,repeat(5,minmax(0,1fr)),auto] items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                <button onClick={() => toggleExpand(item.id)} className="px-2 text-slate-400 hover:text-slate-700">
                  {expanded[item.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateOpexItem(item.id, { name: e.target.value })}
                  className="bg-transparent outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-500 w-full text-sm"
                />
                {getAnnualTotal(item.monthlyAmount).map((total, i) => (
                  <div key={i} className="text-right p-2 font-mono text-sm">{fmtGEL(total, true)}</div>
                ))}
                <button onClick={() => removeOpexItem(item.id)} className="px-2 text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
              <AnimatePresence>
                {expanded[item.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-100 dark:bg-slate-800/30 p-4 space-y-4">
                      <div className="flex items-center gap-4">
                        <select
                          value={item.category}
                          onChange={(e) => updateOpexItem(item.id, { category: e.target.value as OpexItem['category'] })}
                          className="text-xs bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 outline-none"
                        >
                          <option value="G&A">General & Admin</option>
                          <option value="S&M">Sales & Marketing</option>
                          <option value="R&D">Research & Development</option>
                          <option value="Operations">Operations</option>
                          <option value="Other">Other</option>
                        </select>
                        <select
                          value={item.customCategoryId || ''}
                          onChange={(e) => updateOpexItem(item.id, { customCategoryId: e.target.value || undefined })}
                          className="text-xs bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg px-2 py-1 outline-none text-blue-700 dark:text-blue-300"
                        >
                          <option value="">Select Line Item</option>
                          {isCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>

                        <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={item.isSalary ?? false}
                            onChange={(e) => updateOpexItem(item.id, { isSalary: e.target.checked })}
                            className="accent-blue-600"
                          />
                          Salary (+2% pension)
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
                      <div className="grid grid-cols-12 gap-1">
                        {timeline.map((t) => (
                          <div key={t.index}>
                            <label className="text-[10px] text-slate-500">{t.shortLabel}</label>
                            <input
                              type="number"
                              value={item.monthlyAmount[t.index] ?? 0}
                              onChange={(e) => {
                                const newAmounts = [...item.monthlyAmount]
                                newAmounts[t.index] = Number(e.target.value)
                                updateOpexItem(item.id, { monthlyAmount: newAmounts })
                              }}
                              onFocus={(e) => e.target.select()}
                              className="w-full p-1 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-mono text-right bg-white dark:bg-slate-800"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}