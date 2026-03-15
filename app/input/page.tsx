'use client'
// app/input/page.tsx
import { useModelStore } from '@/store/modelStore'
import { Settings, MapPin, Calendar, DollarSign } from 'lucide-react'

export default function InputPage() {
  const { config, setConfig } = useModelStore()

  return (
    <div className="page-in max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Input</h1>
        <p className="text-sm text-slate-500 mt-1">მოდელის ძირითადი პარამეტრები — Excel-ის "Input" sheet-ის ანალოგი</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 divide-y divide-slate-100 dark:divide-slate-800">
        {/* Starting Date */}
        <div className="flex items-center gap-4 p-5">
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar size={16} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Starting Date</label>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) => setConfig({ startDate: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <p className="text-xs text-slate-400 w-24">Starting Date of the 60-month model</p>
        </div>

        {/* Model Length */}
        <div className="flex items-center gap-4 p-5">
          <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <Settings size={16} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Model Length</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={config.modelLengthMonths}
                onChange={(e) => setConfig({ modelLengthMonths: Math.max(12, Math.min(120, Number(e.target.value))) })}
                min={12} max={120}
                className="w-28 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span className="text-sm text-slate-500">months</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 w-24">Default: 60 months (5 years)</p>
        </div>

        {/* Territory */}
        <div className="flex items-center gap-4 p-5">
          <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin size={16} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Territory</label>
            <input
              type="text"
              value={config.territory}
              onChange={(e) => setConfig({ territory: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <p className="text-xs text-slate-400 w-24">Location affects tax rules</p>
        </div>

        {/* Currency */}
        <div className="flex items-center gap-4 p-5">
          <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign size={16} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Operating Currency</label>
            <select
              value={config.currency}
              onChange={(e) => setConfig({ currency: e.target.value })}
              className="w-40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {['GEL','USD','EUR','TRY','CNY'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400 w-24">All outputs in this currency</p>
        </div>
      </div>

      {/* Model summary */}
      <div className="bg-slate-800 rounded-xl p-5 text-white">
        <h3 className="text-sm font-semibold mb-3 text-slate-300">მოდელის რეზიუმე</h3>
        <div className="grid grid-cols-2 gap-3 text-sm font-mono">
          <div><span className="text-slate-400">Start:</span> <span className="text-blue-300">{config.startDate}</span></div>
          <div><span className="text-slate-400">Length:</span> <span className="text-blue-300">{config.modelLengthMonths} months</span></div>
          <div><span className="text-slate-400">Territory:</span> <span className="text-blue-300">{config.territory}</span></div>
          <div><span className="text-slate-400">Currency:</span> <span className="text-blue-300">{config.currency}</span></div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>🔵 ლურჯი</strong> = Input (hardcoded) &nbsp;|&nbsp;
          <strong>⚫ შავი</strong> = ფორმულა &nbsp;|&nbsp;
          <strong>🟢 მწვანე</strong> = სხვა შიტიდან ლინკი
        </p>
      </div>
    </div>
  )
}
