// app/capex/page.tsx
'use client'
import React from 'react'
import { useModelStore } from '@/store/modelStore'
import { CapexItem } from '@/types/model'
import { fmtGEL } from '@/lib/calculations'
import { generateTimeline } from '@/lib/time'
import { Plus, Trash2 } from 'lucide-react'

export default function CapexPage() {
  const store = useModelStore()
  const { capexItems, addCapexItem, updateCapexItem, removeCapexItem } = store

  const timeline = generateTimeline(store.config.startDate, store.config.modelLengthMonths)

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
    const annuals = Array(store.config.modelLengthMonths / 12).fill(0)
    const monthly = (item.amount - (item.residualValue ?? 0)) / Math.max(item.usefulLifeMonths, 1)
    for (let i = 0; i < store.config.modelLengthMonths; i++) {
      if (i >= item.monthIndex && i < item.monthIndex + item.usefulLifeMonths) {
        const yearIndex = Math.floor(i / 12)
        annuals[yearIndex] += monthly
      }
    }
    return annuals
  }

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Capital Expenditures (CAPEX)</h1>
            <p className="text-sm text-slate-500">
              Define long-term assets and their depreciation schedules (straight-line method).
            </p>
          </div>
          <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            {store.language === 'ka' ? 'აქტივის დამატება' : 'Add Asset'}
          </button>
        </div>

      {capexItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-slate-300 mb-6">
          <p className="text-slate-400 text-sm mb-4">აქტივები არ არის დამატებული</p>
          <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
            <Plus size={15} /> {store.language === 'ka' ? 'პირველი აქტივის დამატება' : 'Add First Asset'}
          </button>
        </div>
      )}

      {capexItems.length > 0 && (
        <>
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left font-semibold p-3">Asset Name</th>
                  <th className="text-right font-semibold p-3">Amount (₾)</th>
                  <th className="text-left font-semibold p-3">Purchase Month</th>
                  <th className="text-right font-semibold p-3">Useful Life (Mo)</th>
                  <th className="text-right font-semibold p-3">Residual Value (₾)</th>
                  <th className="text-right font-semibold p-3">Monthly Dep. (₾)</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {capexItems.map((item: CapexItem) => {
                  const depreciable = item.amount - (item.residualValue ?? 0)
                  const monthlyDep = depreciable / Math.max(item.usefulLifeMonths, 1)
                  return (
                    <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50">
                      <td className="p-3 input-cell">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateCapexItem(item.id, { name: e.target.value })}
                          className="bg-transparent outline-none w-full font-medium text-slate-800"
                        />
                      </td>
                      <td className="p-3 input-cell">
                        <input
                          type="number"
                          value={item.amount}
                          inputMode="decimal"
                          onChange={(e) => updateCapexItem(item.id, { amount: Number(e.target.value) })}
                          onFocus={(e) => e.target.select()}
                          className="bg-transparent text-right outline-none w-24 font-mono"
                        />
                      </td>
                      <td className="p-3 input-cell">
                        <select
                          value={item.monthIndex}
                          onChange={(e) => updateCapexItem(item.id, { monthIndex: Number(e.target.value) })}
                          className="bg-transparent outline-none w-full"
                        >
                          {timeline.map(t => <option key={t.index} value={t.index}>{t.label}</option>)}
                        </select>
                      </td>
                      <td className="p-3 input-cell">
                        <input
                          type="number"
                          value={item.usefulLifeMonths}
                          inputMode="numeric"
                          onChange={(e) => updateCapexItem(item.id, { usefulLifeMonths: Number(e.target.value) })}
                          onFocus={(e) => e.target.select()}
                          className="bg-transparent text-right outline-none w-20 font-mono"
                        />
                      </td>
                      <td className="p-3 input-cell">
                        <input
                          type="number"
                          value={item.residualValue ?? 0}
                          inputMode="decimal"
                          onChange={(e) => updateCapexItem(item.id, { residualValue: Number(e.target.value) })}
                          onFocus={(e) => e.target.select()}
                          className="bg-transparent text-right outline-none w-20 font-mono"
                        />
                      </td>
                      <td className="p-3 text-right font-mono text-slate-700">
                        {fmtGEL(monthlyDep)}
                      </td>
                      <td className="text-center p-3">
                        <button onClick={() => removeCapexItem(item.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Annual Depreciation Schedule</h2>
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left font-semibold p-3">Asset Name</th>
                    {Array.from({ length: store.config.modelLengthMonths / 12 }).map((_, i) => (
                      <th key={i} className="text-right font-semibold p-3">Year {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {capexItems.map((item: CapexItem) => (
                    <tr key={item.id} className="border-t border-slate-200">
                      <td className="p-3 font-medium text-slate-800">{item.name}</td>
                      {getAnnualDepreciation(item).map((total, i) => (
                        <td key={i} className="text-right p-3 font-mono text-slate-700">{fmtGEL(total)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                    <td className="p-3 text-slate-800">Total Depreciation</td>
                    {Array.from({ length: store.config.modelLengthMonths / 12 }).map((_, yearIndex) => {
                      const yearTotal = capexItems.reduce((sum: number, item: CapexItem) => {
                        return sum + getAnnualDepreciation(item)[yearIndex]
                      }, 0)
                      return <td key={yearIndex} className="text-right p-3 font-mono text-slate-800">{fmtGEL(yearTotal)}</td>
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  )
}