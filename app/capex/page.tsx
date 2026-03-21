// app/capex/page.tsx
'use client'
import React from 'react'
import { useModelStore } from '@/store/modelStore'
import { CapexItem } from '@/types/model'
import { fmtGEL } from '@/lib/calculations'
import { generateTimeline } from '@/lib/time'
import { Plus, Trash2 } from 'lucide-react'

export default function CapexPage() {
  const { capexItems, addCapexItem, updateCapexItem, removeCapexItem, scenarios, config } = useModelStore()
  const timeline = generateTimeline(config.startDate, config.modelLengthMonths)

  function newItem(): Omit<CapexItem, 'id'> {
    return {
      name: 'New Asset',
      amount: 10000,
      monthIndex: 0,
      usefulLifeMonths: 60,
      residualValue: 0,
    }
  }

  const handleAdd = () => {
    const item = newItem()
    addCapexItem(item)
  }

  const getAnnualDepreciation = (item: CapexItem) => {
    const sc = scenarios[scenarios.active]
    const annuals = Array(config.modelLengthMonths / 12).fill(0)
    for (let i = 0; i < config.modelLengthMonths; i++) {
      if (i >= item.monthIndex && i < item.monthIndex + item.usefulLifeMonths) {
        const yearIndex = Math.floor(i / 12)
        const depreciable = (item.amount - (item.residualValue ?? 0)) * (sc.capexMultiplier ?? 1)
        const monthly = depreciable / Math.max(item.usefulLifeMonths, 1)
        annuals[yearIndex] += monthly
      }
    }
    return annuals
  }

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Capital Expenditures (CAPEX)</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Define long-term assets and their depreciation schedules (straight-line method).
            </p>
          </div>
          <button onClick={handleAdd} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Plus size={14} />
            Add Asset
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <table className="fm-table">
            <thead>
              <tr>
                <th className="text-left">Asset Name</th>
                <th>Amount</th>
                <th>Purchase Month</th>
                <th>Useful Life (Mo)</th>
                <th>Residual Value</th>
                <th>Monthly Depr.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {capexItems.map((item) => (
                <tr key={item.id}>
                  <td className="text-left">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateCapexItem(item.id, { name: e.target.value })}
                      className="bg-transparent outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-500 w-full text-sm"
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="number"
                      value={item.amount}
                      inputMode="decimal"
                      onChange={(e) => updateCapexItem(item.id, { amount: Number(e.target.value) })}
                      onFocus={(e) => e.target.select()}
                      className="bg-transparent text-right outline-none w-24 font-mono focus:ring-1 ring-blue-500 rounded"
                    />
                  </td>
                  <td>
                    <select
                      value={item.monthIndex}
                      onChange={(e) => updateCapexItem(item.id, { monthIndex: Number(e.target.value) })}
                      className="bg-transparent outline-none text-xs"
                    >
                      {timeline.map(t => <option key={t.index} value={t.index}>{t.label}</option>)}
                    </select>
                  </td>
                  <td className="input-cell">
                    <input
                      type="number"
                      value={item.usefulLifeMonths}
                      inputMode="numeric"
                      onChange={(e) => updateCapexItem(item.id, { usefulLifeMonths: Number(e.target.value) })}
                      onFocus={(e) => e.target.select()}
                      className="bg-transparent text-right outline-none w-20 font-mono focus:ring-1 ring-blue-500 rounded"
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="number" value={item.residualValue ?? 0}
                      inputMode="decimal"
                      onChange={(e) => updateCapexItem(item.id, { residualValue: Number(e.target.value) })}
                      onFocus={(e) => e.target.select()}
                      className="bg-transparent text-right outline-none w-20 font-mono focus:ring-1 ring-blue-500 rounded"
                    />
                  </td>
                  <td className="font-mono text-slate-400">
                    {fmtGEL((item.amount - (item.residualValue ?? 0)) / Math.max(item.usefulLifeMonths, 1))}
                  </td>
                  <td>
                    <button onClick={() => removeCapexItem(item.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Annual Depreciation Schedule</h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
            <table className="fm-table">
              <thead>
                <tr>
                  <th className="text-left">Asset Name</th>
                  {Array.from({ length: config.modelLengthMonths / 12 }).map((_, i) => (
                    <th key={i}>Year {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {capexItems.map((item) => (
                  <tr key={item.id}>
                    <td className="text-left">{item.name}</td>
                    {getAnnualDepreciation(item).map((total, i) => (
                      <td key={i} className="font-mono">{fmtGEL(total)}</td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                  <td className="text-left">Total Depreciation</td>
                  {Array.from({ length: config.modelLengthMonths / 12 }).map((_, yearIndex) => {
                    const yearTotal = capexItems.reduce((sum, item) => {
                      return sum + getAnnualDepreciation(item)[yearIndex]
                    }, 0)
                    return <td key={yearIndex} className="font-mono">{fmtGEL(yearTotal)}</td>
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}