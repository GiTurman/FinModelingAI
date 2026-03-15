'use client'
// app/opex/page.tsx
import { useState } from 'react'
import { useModelStore } from '@/store/modelStore'
import { OpexItem } from '@/types/model'
import { fmtGEL, sumArr } from '@/lib/calculations'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const MONTHS = 60

function newItem(): Omit<OpexItem, 'id'> {
  return {
    name: 'New Expense',
    category: 'G&A',
    monthlyAmount: Array(MONTHS).fill(0),
    inflationAdjusted: true,
  }
}

export default function OpexPage() {
  const { opexItems, addOpexItem, updateOpexItem, removeOpexItem, getTimeline, ops } = useModelStore()
  const timeline = getTimeline()
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id)

  const updateAmount = (id: string, monthIdx: number, val: number) => {
    const item = opexItems.find((i) => i.id === id)
    if (!item) return
    const amounts = [...item.monthlyAmount]
    amounts[monthIdx] = val
    updateOpexItem(id, { monthlyAmount: amounts })
  }

  const fillUniform = (id: string, val: number) => {
    updateOpexItem(id, { monthlyAmount: Array(MONTHS).fill(val) })
  }

  const categories = ['S&M', 'G&A', 'R&D', 'Operations', 'Other']

  return (
    <div className="page-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">OPEX Schedule</h1>
          <p className="text-xs text-slate-400 mt-1">საოპერაციო ხარჯები — 60 თვე • ინფლაცია: {ops.inflationRate}%</p>
        </div>
        <button
          onClick={() => addOpexItem(newItem())}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={15} /> ხარჯის დამატება
        </button>
      </div>

      <div className="space-y-3">
        {opexItems.map((item) => {
          const total = sumArr(item.monthlyAmount)
          const isExp = expanded === item.id

          return (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => toggleExpand(item.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  {isExp ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>

                <input
                  value={item.name}
                  onChange={(e) => updateOpexItem(item.id, { name: e.target.value })}
                  className="flex-1 text-sm font-semibold bg-transparent outline-none text-slate-800 dark:text-white border-b border-transparent hover:border-slate-300 focus:border-blue-500 transition-colors"
                />

                <select
                  value={item.category}
                  onChange={(e) => updateOpexItem(item.id, { category: e.target.value as any })}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <div className="text-right hidden sm:block w-32">
                  <p className="text-xs text-slate-400">Total 5Y</p>
                  <p className="text-sm font-mono font-semibold text-slate-800 dark:text-white">{fmtGEL(total, true)}</p>
                </div>

                <button onClick={() => removeOpexItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 size={15} />
                </button>
              </div>

              {isExp && (
                <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Uniform fill:</span>
                      <input
                        type="number" min={0} placeholder="amount/mo"
                        className="w-24 text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') fillUniform(item.id, Number((e.target as HTMLInputElement).value))
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const inp = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement)
                          fillUniform(item.id, Number(inp?.value ?? 0))
                        }}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold"
                      >Apply</button>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl">
                      <input
                        type="checkbox"
                        checked={item.inflationAdjusted}
                        onChange={(e) => updateOpexItem(item.id, { inflationAdjusted: e.target.checked })}
                        className="accent-purple-600"
                      />
                      Inflation Adjusted
                    </label>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {[1,2,3,4,5].map((yr) => {
                      const slice = item.monthlyAmount.slice((yr-1)*12, yr*12)
                      const total = sumArr(slice)
                      return (
                        <div key={yr} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400 mb-1">Y{yr} Total</p>
                          <p className="text-xs font-mono font-semibold text-purple-700 dark:text-purple-400">{fmtGEL(total, true)}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="text-[10px] font-mono">
                      <thead>
                        <tr>
                          {timeline.map((c) => (
                            <th key={c.index} className="px-1 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal whitespace-nowrap">{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {timeline.map((c) => (
                            <td key={c.index} className="px-0.5 py-0.5">
                              <input
                                type="number" min={0}
                                value={item.monthlyAmount[c.index] ?? 0}
                                onChange={(e) => updateAmount(item.id, c.index, Number(e.target.value))}
                                className="w-12 text-right text-purple-700 dark:text-purple-400 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 bg-white dark:bg-slate-900 outline-none"
                              />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {opexItems.length > 0 && (
        <div className="bg-slate-800 text-white rounded-xl p-4 flex items-center justify-between">
          <span className="font-semibold">Total OPEX (60M)</span>
          <span className="font-mono font-bold text-xl">
            {fmtGEL(sumArr(opexItems.map((item) => sumArr(item.monthlyAmount))), true)}
          </span>
        </div>
      )}
    </div>
  )
}
