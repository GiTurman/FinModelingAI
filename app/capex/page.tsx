'use client'
// app/capex/page.tsx
import { useModelStore } from '@/store/modelStore'
import { CapexItem } from '@/types/model'
import { fmtGEL, sumArr } from '@/lib/calculations'
import { Plus, Trash2, HardDrive } from 'lucide-react'

function newItem(): Omit<CapexItem, 'id'> {
  return {
    name: 'New Asset',
    amount: 10000,
    monthIndex: 0,
    usefulLifeMonths: 60,
  }
}

export default function CapexPage() {
  const { capexItems, addCapexItem, updateCapexItem, removeCapexItem, getTimeline } = useModelStore()
  const timeline = getTimeline()

  const totalCapex = sumArr(capexItems.map((i) => i.amount))
  const avgLife = capexItems.length > 0
    ? sumArr(capexItems.map((i) => i.usefulLifeMonths)) / capexItems.length
    : 0

  return (
    <div className="page-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">CapEx Schedule</h1>
          <p className="text-xs text-slate-400 mt-1">კაპიტალური დანახარჯები და ამორტიზაცია</p>
        </div>
        <button
          onClick={() => addCapexItem(newItem())}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={15} /> აქტივის დამატება
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
            <HardDrive size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Investment</p>
            <p className="text-xl font-bold font-mono text-slate-800 dark:text-white">{fmtGEL(totalCapex, true)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
            <Plus size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Avg. Useful Life</p>
            <p className="text-xl font-bold font-mono text-slate-800 dark:text-white">{avgLife.toFixed(0)} months</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <table className="fm-table">
          <thead>
            <tr>
              <th className="text-left">Asset Name</th>
              <th>Amount (GEL)</th>
              <th>Purchase Month</th>
              <th>Useful Life (Mo)</th>
              <th>Monthly Depr.</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {capexItems.map((item) => (
              <tr key={item.id}>
                <td className="text-left">
                  <input
                    value={item.name}
                    onChange={(e) => updateCapexItem(item.id, { name: e.target.value })}
                    className="bg-transparent outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-500 w-full"
                  />
                </td>
                <td className="input-cell">
                  <input
                    type="number" value={item.amount}
                    onChange={(e) => updateCapexItem(item.id, { amount: Number(e.target.value) })}
                    className="bg-transparent text-right outline-none w-24 font-mono"
                  />
                </td>
                <td>
                  <select
                    value={item.monthIndex}
                    onChange={(e) => updateCapexItem(item.id, { monthIndex: Number(e.target.value) })}
                    className="bg-transparent outline-none text-xs"
                  >
                    {timeline.map((c) => <option key={c.index} value={c.index}>{c.label}</option>)}
                  </select>
                </td>
                <td className="input-cell">
                  <input
                    type="number" value={item.usefulLifeMonths}
                    onChange={(e) => updateCapexItem(item.id, { usefulLifeMonths: Number(e.target.value) })}
                    className="bg-transparent text-right outline-none w-16 font-mono"
                  />
                </td>
                <td className="font-mono text-slate-400">
                  {fmtGEL(item.amount / (item.usefulLifeMonths || 1))}
                </td>
                <td>
                  <button onClick={() => removeCapexItem(item.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Annual depreciation preview */}
      <div className="bg-slate-800 rounded-xl p-5 text-white">
        <h3 className="text-sm font-semibold mb-4 text-slate-300">Annual Depreciation Schedule (Preview)</h3>
        <div className="grid grid-cols-5 gap-4">
          {[1,2,3,4,5].map((yr) => {
            const depr = sumArr(capexItems.map((item) => {
              const monthly = item.amount / item.usefulLifeMonths
              let yrDepr = 0
              for (let m = (yr-1)*12; m < yr*12; m++) {
                if (m >= item.monthIndex && m < item.monthIndex + item.usefulLifeMonths) {
                  yrDepr += monthly
                }
              }
              return yrDepr
            }))
            return (
              <div key={yr} className="text-center border-r border-white/10 last:border-0">
                <p className="text-xs text-slate-400 mb-1">Year {yr}</p>
                <p className="font-mono font-bold">{fmtGEL(depr, true)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
