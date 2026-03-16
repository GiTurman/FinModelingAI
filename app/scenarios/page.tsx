'use client'
// app/scenarios/page.tsx
import { useMemo } from 'react'
import { useModelStore } from '@/store/modelStore'
import { fmtGEL, fmtPct, sumArr } from '@/lib/calculations'
import { CheckCircle2, TrendingUp, TrendingDown, Scale } from 'lucide-react'

const CONFIGS = {
  base: { label: 'Base Case',        labelKa: 'საბაზო',       icon: Scale,        grad: 'from-blue-700 to-blue-900',    border: 'border-blue-500',   badge: 'bg-blue-100 text-blue-700' },
  bull: { label: 'Bull Case (↑)',     labelKa: 'ოპტიმისტური',  icon: TrendingUp,   grad: 'from-emerald-700 to-emerald-900', border: 'border-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  bear: { label: 'Bear Case (↓)',     labelKa: 'პესიმისტური',  icon: TrendingDown, grad: 'from-red-700 to-red-900',      border: 'border-red-500',    badge: 'bg-red-100 text-red-700' },
}

export default function ScenariosPage() {
  const scenarios = useModelStore((s) => s.scenarios)
  const setActiveScenario = useModelStore((s) => s.setActiveScenario)
  const updateScenario = useModelStore((s) => s.updateScenario)
  const getIS = useModelStore((s) => s.getIS)
  const getCF = useModelStore((s) => s.getCF)
  
  // Dependency tracking for useMemo
  const salesItems = useModelStore((s) => s.salesItems)
  const cogsItems = useModelStore((s) => s.cogsItems)
  const opexItems = useModelStore((s) => s.opexItems)
  const capexItems = useModelStore((s) => s.capexItems)
  const investments = useModelStore((s) => s.investments)
  const taxRates = useModelStore((s) => s.taxRates)
  const ops = useModelStore((s) => s.ops)
  const config = useModelStore((s) => s.config)

  // compute summary for each scenario
  const results = useMemo(() => {
    return (['base', 'bull', 'bear'] as const).map((type) => {
      const is = getIS(type)
      const cf = getCF(type)
      const rev = sumArr(is.map((m) => m.revenueExVat))
      const ni  = sumArr(is.map((m) => m.netIncome))
      const ebitda = sumArr(is.map((m) => m.ebitda))
      const cash = cf.length > 0 ? cf[cf.length - 1].closingCash : 0
      return { type, rev, ni, ebitda, cash }
    })
  }, [getIS, getCF, salesItems, opexItems, capexItems, investments, taxRates, ops, config, scenarios.base, scenarios.bull, scenarios.bear])

  return (
    <div className="page-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Scenarios</h1>
        <p className="text-xs text-slate-400 mt-1">Base / Bull / Bear — სცენარების შედარება</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['base','bull','bear'] as const).map((type) => {
          const cfg = CONFIGS[type]
          const Icon = cfg.icon
          const sc = scenarios[type]
          const isActive = scenarios.active === type
          const res = results.find((r) => r.type === type)!

          return (
            <div key={type} className={`bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all ${isActive ? cfg.border + ' shadow-lg' : 'border-slate-200 dark:border-slate-700'}`}>
              <div className={`bg-gradient-to-r ${cfg.grad} rounded-t-xl p-4 flex items-start justify-between`}>
                <div>
                  <p className="text-white/70 text-xs mb-1">Scenario</p>
                  <h3 className="text-white font-bold text-lg">{cfg.labelKa}</h3>
                  <p className="text-white/60 text-xs">{cfg.label}</p>
                </div>
                <Icon size={26} className="text-white/60" />
              </div>

              <div className="p-4 space-y-3">
                {/* Multipliers */}
                {[
                  { label: 'Revenue Multiplier', key: 'revenueMultiplier' as const, fmt: (v: number) => `${(v*100).toFixed(0)}%` },
                  { label: 'COGS Multiplier',    key: 'cogsMultiplier' as const,    fmt: (v: number) => `${(v*100).toFixed(0)}%` },
                  { label: 'OPEX Multiplier',    key: 'opexMultiplier' as const,    fmt: (v: number) => `${(v*100).toFixed(0)}%` },
                  { label: 'CapEx Multiplier',   key: 'capexMultiplier' as const,   fmt: (v: number) => `${(v*100).toFixed(0)}%` },
                ].map(({ label, key, fmt }) => (
                  <div key={key} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                    <span className="text-xs text-slate-500">{label}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number" step={0.05} min={0} max={3}
                        value={sc[key]}
                        onChange={(e) => updateScenario(type, { [key]: Number(e.target.value) })}
                        className="w-16 text-right text-xs font-mono font-semibold text-blue-700 dark:text-blue-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-300 w-3">x</span>
                    </div>
                  </div>
                ))}

                {/* Summary */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">5Y Revenue</span>
                    <span className="font-mono font-semibold">{fmtGEL(res.rev, true)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">5Y EBITDA</span>
                    <span className="font-mono font-semibold">{fmtGEL(res.ebitda, true)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">5Y Net Income</span>
                    <span className={`font-mono font-semibold ${res.ni < 0 ? 'text-red-600' : ''}`}>{fmtGEL(res.ni, true)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">End Cash</span>
                    <span className={`font-mono font-semibold ${res.cash < 0 ? 'text-red-600' : ''}`}>{fmtGEL(res.cash, true)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveScenario(type)}
                  disabled={isActive}
                  className={`w-full mt-2 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${cfg.grad} text-white cursor-default`
                      : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {isActive ? <span className="flex items-center justify-center gap-1.5"><CheckCircle2 size={14}/>Active</span> : 'Activate'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <div className="px-5 py-3 bg-slate-800">
          <h3 className="text-white font-semibold text-sm">Scenario Comparison — 5-Year Total</h3>
        </div>
        <table className="fm-table">
          <thead>
            <tr>
              <th className="text-left">Metric</th>
              <th className="text-red-400">Bear</th>
              <th className="text-blue-400">Base</th>
              <th className="text-emerald-400">Bull</th>
              <th>Bull vs Bear Δ</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Revenue (ex-VAT)', bear: results[2].rev, base: results[0].rev, bull: results[1].rev },
              { label: 'EBITDA',           bear: results[2].ebitda, base: results[0].ebitda, bull: results[1].ebitda },
              { label: 'Net Income',       bear: results[2].ni, base: results[0].ni, bull: results[1].ni },
              { label: 'Ending Cash',      bear: results[2].cash, base: results[0].cash, bull: results[1].cash },
            ].map((row) => {
              const delta = row.bear !== 0 ? ((row.bull - row.bear) / Math.abs(row.bear)) * 100 : 0
              return (
                <tr key={row.label}>
                  <td className="text-left font-medium">{row.label}</td>
                  <td className={row.bear < 0 ? 'negative' : ''}>{fmtGEL(row.bear, true)}</td>
                  <td>{fmtGEL(row.base, true)}</td>
                  <td className={row.bull < 0 ? 'negative' : ''}>{fmtGEL(row.bull, true)}</td>
                  <td className={delta >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'negative font-semibold'}>
                    {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
