'use client'
// app/page.tsx
import { useMemo } from 'react'
import { useModelStore } from '@/store/modelStore'
import KPICard from '@/components/dashboard/KPICard'
import { fmtGEL, fmtPct, sumArr } from '@/lib/calculations'
import {
  DollarSign, TrendingUp, Activity, Wallet,
  Building2, Landmark, PlusCircle,
} from 'lucide-react'
import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

export default function Dashboard() {
  const salesItems = useModelStore((s) => s.salesItems)
  const cogsItems = useModelStore((s) => s.cogsItems)
  const opexItems = useModelStore((s) => s.opexItems)
  const capexItems = useModelStore((s) => s.capexItems)
  const investments = useModelStore((s) => s.investments)
  const taxRates = useModelStore((s) => s.taxRates)
  const ops = useModelStore((s) => s.ops)
  const config = useModelStore((s) => s.config)
  const scenarios = useModelStore((s) => s.scenarios)
  const getIS = useModelStore((s) => s.getIS)
  const getCF = useModelStore((s) => s.getCF)
  const getTimeline = useModelStore((s) => s.getTimeline)

  const activeScenario = scenarios.active
  const scenarioConfig = scenarios[activeScenario]

  const timeline = useMemo(() => getTimeline(), [getTimeline, config])
  const isData = useMemo(() => getIS(), [getIS, salesItems, cogsItems, opexItems, capexItems, investments, taxRates, ops, config, activeScenario, scenarioConfig])
  const cfData = useMemo(() => getCF(), [getCF, salesItems, cogsItems, opexItems, capexItems, investments, taxRates, ops, config, activeScenario, scenarioConfig])

  const hasData = salesItems.length > 0

  const stats = useMemo(() => {
    const totalRevenue = sumArr(isData.map((m) => m.revenueExVat))
    const totalNetIncome = sumArr(isData.map((m) => m.netIncome))
    const totalEbitda = sumArr(isData.map((m) => m.ebitda))
    const endingCash = cfData.length > 0 ? cfData[cfData.length - 1].closingCash : 0
    const avgGrossMargin = isData.length > 0
      ? isData.reduce((s, m) => s + m.grossMargin, 0) / isData.filter((m) => m.revenueExVat > 0).length || 0
      : 0
    return { totalRevenue, totalNetIncome, totalEbitda, endingCash, avgGrossMargin }
  }, [isData, cfData])

  // Annual chart data
  const annualData = useMemo(() => [1,2,3,4,5].map((yr) => {
    const slice = isData.slice((yr-1)*12, yr*12)
    return {
      year: `Y${yr}`,
      revenue: sumArr(slice.map((m) => m.revenueExVat)) / 1000,
      ebitda: sumArr(slice.map((m) => m.ebitda)) / 1000,
      netIncome: sumArr(slice.map((m) => m.netIncome)) / 1000,
    }
  }), [isData])

  const cashData = useMemo(() => cfData.filter((_, i) => i % 3 === 0).map((m, i) => ({
    month: timeline[i * 3]?.label ?? '',
    cash: m.closingCash / 1000,
    fcf: m.freeCashFlow / 1000,
  })), [cfData, timeline])

  if (!hasData) {
    return (
      <div className="page-in flex flex-col items-center justify-center min-h-[65vh] text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-5">
          <Activity size={34} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">ფინანსური მოდელი</h2>
        <p className="text-slate-400 mb-2 text-sm">{config.territory} • {config.currency} • {config.modelLengthMonths} თვე</p>
        <p className="text-slate-500 mb-8 max-w-sm text-sm">
          დაიწყეთ Input-ის შეყვანით, შემდეგ Sales-ში გაყიდვების პლანის დამატებით.
        </p>
        <div className="flex gap-3">
          <Link href="/input" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <PlusCircle size={16} /> Input-ის შეყვანა
          </Link>
          <Link href="/sales" className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <DollarSign size={16} /> გაყიდვების დამატება
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-in space-y-5">
      {/* Scenario badge */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">ფინანსური დაშბორდი</h1>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
          scenarios.active === 'bull' ? 'bg-emerald-100 text-emerald-700' :
          scenarios.active === 'bear' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>{scenarios.active.toUpperCase()} SCENARIO</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 relative">
        {[
          { title: 'შემოსავალი (5Y)', value: fmtGEL(stats.totalRevenue, true), icon: DollarSign, accent: 'blue' as const },
          { title: 'წმ. მოგება (5Y)', value: fmtGEL(stats.totalNetIncome, true), icon: TrendingUp, accent: stats.totalNetIncome >= 0 ? 'green' as const : 'red' as const },
          { title: 'EBITDA (5Y)', value: fmtGEL(stats.totalEbitda, true), icon: Activity, accent: 'purple' as const },
          { title: 'ფულადი ნაშთი', value: fmtGEL(stats.endingCash, true), icon: Wallet, accent: 'teal' as const },
          { title: 'Gross Margin', value: fmtPct(stats.avgGrossMargin), icon: Building2, accent: 'orange' as const },
        ].map((k) => (
          <div key={k.title} className="relative">
            <KPICard {...k} />
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">შემოსავალი / EBITDA / წმ. მოგება (K ₾)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={annualData} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v.toFixed(0)}K ₾`} />
              <Bar dataKey="revenue" name="შემოსავალი" fill="#2563eb" radius={[3,3,0,0]} />
              <Bar dataKey="ebitda" name="EBITDA" fill="#7c3aed" radius={[3,3,0,0]} />
              <Bar dataKey="netIncome" name="წმ.მოგება" fill="#16a34a" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">ფულადი ნაშთი (K ₾)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cashData}>
              <defs>
                <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v.toFixed(0)}K ₾`} />
              <Area type="monotone" dataKey="cash" name="ნაშთი" stroke="#2563eb" strokeWidth={2} fill="url(#cashGrad)" />
              <Area type="monotone" dataKey="fcf" name="FCF" stroke="#16a34a" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">წლიური რეზიუმე</h3>
        <div className="overflow-x-auto">
          <table className="fm-table">
            <thead>
              <tr>
                <th className="text-left">მეტრიკა</th>
                {[1,2,3,4,5].map((y) => <th key={y}>Y{y}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'შემოსავალი', key: 'revenueExVat' as const },
                { label: 'EBITDA', key: 'ebitda' as const },
                { label: 'წმ. მოგება', key: 'netIncome' as const },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="text-left">{row.label}</td>
                  {[1,2,3,4,5].map((yr) => {
                    const v = sumArr(isData.slice((yr-1)*12, yr*12).map((m) => m[row.key]))
                    return <td key={yr} className={v < 0 ? 'negative' : ''}>{fmtGEL(v, true)}</td>
                  })}
                </tr>
              ))}
              <tr className="row-subtotal">
                <td className="text-left">EBITDA Margin</td>
                {[1,2,3,4,5].map((yr) => {
                  const slice = isData.slice((yr-1)*12, yr*12)
                  const rev = sumArr(slice.map((m) => m.revenueExVat))
                  const ebitda = sumArr(slice.map((m) => m.ebitda))
                  return <td key={yr}>{rev > 0 ? fmtPct(ebitda / rev) : '-'}</td>
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
