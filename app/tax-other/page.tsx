'use client'
// app/tax-other/page.tsx
import { useModelStore } from '@/store/modelStore'
import { Percent, Activity, Globe } from 'lucide-react'

export default function TaxOtherPage() {
  const { taxRates, setTaxRates, ops, setOps } = useModelStore()

  return (
    <div className="page-in max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Tax & Operational Settings</h1>
        <p className="text-sm text-slate-500 mt-1">საგადასახადო განაკვეთები და საოპერაციო პარამეტრები</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Taxes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-semibold">
            <Percent size={18} className="text-blue-600" />
            <h3>Tax Rates (%)</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 space-y-4">
            {[
              { label: 'VAT (დღგ)', key: 'vatRate' as const },
              { label: 'Corporate Tax (მოგების გადასახადი)', key: 'corporateTaxRate' as const },
              { label: 'Personal Income Tax (საშემოსავლო)', key: 'personalIncomeTaxRate' as const },
              { label: 'Pension Contribution (საპენსიო)', key: 'pensionRate' as const },
              { label: 'Dividend Tax (დივიდენდი)', key: 'dividendTaxRate' as const },
            ].map(t => (
              <div key={t.key} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{t.label}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number" step={0.01}
                    value={taxRates[t.key] * 100}
                    onChange={e => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value)
                      setTaxRates({ [t.key]: val / 100 })
                    }}
                    className="w-16 text-right text-sm font-mono text-blue-700 dark:text-blue-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none"
                  />
                  <span className="text-xs text-slate-400 w-4">%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[10px] text-slate-400 leading-relaxed">
            * საქართველოში მოქმედებს "ესტონური მოდელი" — მოგების გადასახადი (15%) იხდება მხოლოდ დივიდენდის განაწილებისას.
          </div>
        </div>

        {/* Operational */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-semibold">
            <Activity size={18} className="text-purple-600" />
            <h3>Operational Settings</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 space-y-4">
            {[
              { label: 'DSO (Days Sales Outstanding)', key: 'dso' as const, unit: 'days' },
              { label: 'DPO (Days Payable Outstanding)', key: 'dpo' as const, unit: 'days' },
              { label: 'Inflation Rate (Annual %)', key: 'inflationRate' as const, unit: '%' },
              { label: 'Default Loan Rate (Annual %)', key: 'defaultLoanRate' as const, unit: '%' },
            ].map(o => (
              <div key={o.key} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{o.label}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={ops[o.key]}
                    onChange={e => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value)
                      setOps({ [o.key]: val })
                    }}
                    className="w-16 text-right text-sm font-mono text-purple-700 dark:text-purple-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none"
                  />
                  <span className="text-xs text-slate-400 w-8">{o.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-semibold pt-2">
            <Globe size={18} className="text-emerald-600" />
            <h3>FX Rates (1 Foreign = X GEL)</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 space-y-4">
            {[
              { label: 'USD / GEL', key: 'usd' as const },
              { label: 'EUR / GEL', key: 'eur' as const },
            ].map(fx => (
              <div key={fx.key} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{fx.label}</span>
                <input
                  type="number" step={0.001}
                  value={ops.fxRates[fx.key]}
                  onChange={e => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value)
                    setOps({ fxRates: { ...ops.fxRates, [fx.key]: val } })
                  }}
                  className="w-20 text-right text-sm font-mono text-emerald-700 dark:text-emerald-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
