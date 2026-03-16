'use client'
// app/balance-sheet/page.tsx
import { useMemo } from 'react'
import { useModelStore } from '@/store/modelStore'
import { fmtGEL } from '@/lib/calculations'
import { MonthColumn } from '@/types/model'
import { CheckCircle2, AlertCircle, Settings } from 'lucide-react'
import Link from 'next/link'


export default function BSPage() {
  const getCF = useModelStore((s) => s.getCF)
  const getIS = useModelStore((s) => s.getIS)
  const getTimeline = useModelStore((s) => s.getTimeline)
  const selectedView = useModelStore((s) => s.selectedView)
  const salesItems = useModelStore((s) => s.salesItems)
  const opexItems = useModelStore((s) => s.opexItems)
  const capexItems = useModelStore((s) => s.capexItems)
  const investments = useModelStore((s) => s.investments)
  const taxRates = useModelStore((s) => s.taxRates)
  const ops = useModelStore((s) => s.ops)
  const config = useModelStore((s) => s.config)
  const activeScenario = useModelStore((s) => s.scenarios.active)
  const scenarioConfig = useModelStore((s) => s.scenarios[s.scenarios.active])
  const customCategories = useModelStore((s) => s.customCategories)
  const language = useModelStore((s) => s.language)

  const timeline = useMemo(() => getTimeline(), [getTimeline, config])
  const cfData = useMemo(() => getCF(), [getCF, salesItems, opexItems, capexItems, investments, taxRates, ops, config, activeScenario, scenarioConfig])
  const isData = useMemo(() => getIS(), [getIS, salesItems, opexItems, capexItems, investments, taxRates, ops, config, activeScenario, scenarioConfig])

  // Build simple BS from CF closing cash + IS data
  const bs = useMemo(() => {
    let runningRetainedEarnings = 0
    return cfData.map((cf, i) => {
      const is = isData[i] ?? { revenueExVat: 0, netIncome: 0, depreciation: 0 }
      const ar = is.revenueExVat * (ops.dso / 30)
      const cash = cf.closingCash
      const totalCurrentAssets = cash + ar
      const netPPE = 0 // tracked in CAPEX page
      const totalAssets = totalCurrentAssets + netPPE

      const ap = 0
      const vatPayable = (is.revenueExVat * taxRates.vatRate)
      const totalCurrentLiab = ap + vatPayable
      const longTermDebt = cf.openingCash < 0 ? Math.abs(cf.openingCash) : 0
      const totalLiab = totalCurrentLiab + longTermDebt

      runningRetainedEarnings += is.netIncome
      const totalEquity = runningRetainedEarnings
      const check = totalAssets - (totalLiab + totalEquity)

      return { cash, ar, totalCurrentAssets, netPPE, totalAssets, ap, vatPayable, totalCurrentLiab, longTermDebt, totalLiab, retainedEarnings: runningRetainedEarnings, totalEquity, check }
    })
  }, [cfData, isData, ops.dso, taxRates.vatRate])

  const { cols, displayData } = useMemo(() => {
    if (selectedView === 'monthly') {
      return { cols: timeline, displayData: bs }
    }

    const newCols: any[] = []
    const newData: any[] = []

    const periodSize = selectedView === 'annual' ? 12 : 3
    const numPeriods = Math.ceil(bs.length / periodSize)

    for (let i = 0; i < numPeriods; i++) {
      const lastMonthIdx = Math.min((i + 1) * periodSize - 1, bs.length - 1)
      const periodEndData = bs[lastMonthIdx]
      if (!periodEndData) break

      const year = Math.floor((i * periodSize) / 12) + 1
      const quarter = Math.floor(((i * periodSize) % 12) / 3) + 1

      newCols.push({
        index: i,
        label: selectedView === 'annual' ? `Year ${year}` : `Q${quarter} Y${year}`,
        yearLabel: `Y${year}`,
        monthLabel: selectedView === 'annual' ? 'Total' : `Q${quarter}`
      })

      newData.push(periodEndData)
    }

    return { cols: newCols, displayData: newData }
  }, [selectedView, timeline, bs])

  if (salesItems.length === 0) {
    return <div className="page-in flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">Sales-ში გაყიდვები დაამატეთ</div>
  }

  type BSKey = keyof typeof bs[0]
  const rows: { id?: string; label: string; key?: BSKey; type?: 'section'|'subtotal'|'total'|'indent'; customId?: string }[] = useMemo(() => {
    const baseRows: any[] = [
      { label: 'ASSETS', type: 'section' },
      { label: 'Current Assets', type: 'section' },
      { label: '  Cash & Equivalents', key: 'cash', type: 'indent' },
      { label: '  Accounts Receivable (DSO=' + ops.dso + 'd)', key: 'ar', type: 'indent' },
    ]

    // Custom Assets
    customCategories.filter(c => c.statement === 'BS' && c.section === 'Assets').forEach(cat => {
      baseRows.push({ label: `  ${cat.name}`, customId: cat.id, type: 'indent' })
    })

    baseRows.push(
      { label: 'Total Current Assets', key: 'totalCurrentAssets', type: 'subtotal' },
      { label: 'Non-Current Assets', type: 'section' },
      { label: '  Net PP&E', key: 'netPPE', type: 'indent' },
      { label: 'TOTAL ASSETS', key: 'totalAssets', type: 'total' },
      { label: 'LIABILITIES & EQUITY', type: 'section' },
      { label: 'Current Liabilities', type: 'section' },
      { label: '  Accounts Payable', key: 'ap', type: 'indent' },
      { label: '  VAT Payable', key: 'vatPayable', type: 'indent' },
    )

    // Custom Liabilities
    customCategories.filter(c => c.statement === 'BS' && c.section === 'Liabilities').forEach(cat => {
      baseRows.push({ label: `  ${cat.name}`, customId: cat.id, type: 'indent' })
    })

    baseRows.push(
      { label: 'Total Current Liabilities', key: 'totalCurrentLiab', type: 'subtotal' },
      { label: '  Long-Term Debt', key: 'longTermDebt', type: 'indent' },
      { label: 'Total Liabilities', key: 'totalLiab', type: 'subtotal' },
      { label: 'Equity', type: 'section' },
      { label: '  Retained Earnings', key: 'retainedEarnings', type: 'indent' },
    )

    // Custom Equity
    customCategories.filter(c => c.statement === 'BS' && c.section === 'Equity').forEach(cat => {
      baseRows.push({ label: `  ${cat.name}`, customId: cat.id, type: 'indent' })
    })

    baseRows.push(
      { label: 'Total Equity', key: 'totalEquity', type: 'subtotal' },
      { label: 'TOTAL LIABILITIES + EQUITY', key: 'check', type: 'total' },
    )

    return baseRows
  }, [ops.dso, customCategories])

  const lastMonth = bs[bs.length - 1]
  const isBalanced = lastMonth ? Math.abs(lastMonth.check) < 1 : true

  return (
    <div className="page-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Balance Sheet</h1>
            <p className="text-xs text-slate-400 mt-1">ბალანსი • {selectedView}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${isBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {isBalanced ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
            {isBalanced ? 'BALANCED ✓' : 'NOT BALANCED'}
          </div>
        </div>
        <Link
          href="/line-items"
          className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Settings size={15} /> {language === 'ka' ? 'მუხლების მართვა' : 'Manage Line Items'}
        </Link>
      </div>

      <div className="table-scroll">
        <table className="fm-table">
          <thead>
            <tr>
              <th className="text-left">Item</th>
              {cols.map((c) => <th key={c.index}>{c.yearLabel} {c.monthLabel}</th>)}
            </tr>
            <tr className="bg-slate-700">
              <th className="text-left sticky left-0 bg-slate-700 text-slate-300">Date</th>
              {cols.map((c) => <th key={c.index} className="text-slate-300 font-normal">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              if (row.type === 'section') {
                return (
                  <tr key={row.label} className="row-section">
                    <td colSpan={cols.length + 1} className="text-white bg-slate-700">{row.label}</td>
                  </tr>
                )
              }
              return (
                <tr key={row.label} className={row.type === 'total' ? 'row-total' : row.type === 'subtotal' ? 'row-subtotal' : ''}>
                  <td className={`text-left ${row.type === 'indent' ? 'pl-6 text-slate-500' : ''} ${row.type === 'total' ? 'text-white bg-slate-800' : ''}`}>
                    {row.label}
                  </td>
                  {cols.map((c, i) => {
                    const v = row.key ? (displayData[i]?.[row.key] ?? 0) : 0
                    // Note: BS custom values are not yet fully integrated into calculations
                    // but we show the row as requested.
                    return (
                      <td key={c.index} className={`${v < 0 ? 'negative' : ''} ${row.type === 'total' ? 'text-white' : ''}`}>
                        {fmtGEL(v as number)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
