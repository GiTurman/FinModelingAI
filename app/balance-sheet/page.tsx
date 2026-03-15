'use client'
// app/balance-sheet/page.tsx
import { useModelStore } from '@/store/modelStore'
import { fmtGEL } from '@/lib/calculations'
import { MonthColumn } from '@/types/model'
import { CheckCircle2, AlertCircle } from 'lucide-react'

function filterCols(cols: MonthColumn[], view: string): MonthColumn[] {
  if (view === 'annual') return cols.filter((c) => c.monthLabel === 'M1')
  if (view === 'quarterly') return cols.filter((c) => [1,4,7,10].includes(c.month))
  return cols
}

export default function BSPage() {
  const { getCF, getIS, getTimeline, selectedView, salesItems, taxRates, ops } = useModelStore()
  const timeline = getTimeline()
  const cfData = getCF()
  const isData = getIS()
  const cols = filterCols(timeline, selectedView)

  // Build simple BS from CF closing cash + IS data
  const bs = cfData.map((cf, i) => {
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

    const retainedEarnings = isData.slice(0, i+1).reduce((s, m) => s + m.netIncome, 0)
    const totalEquity = retainedEarnings
    const check = totalAssets - (totalLiab + totalEquity)

    return { cash, ar, totalCurrentAssets, netPPE, totalAssets, ap, vatPayable, totalCurrentLiab, longTermDebt, totalLiab, retainedEarnings, totalEquity, check }
  })

  if (salesItems.length === 0) {
    return <div className="page-in flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">Sales-ში გაყიდვები დაამატეთ</div>
  }

  type BSKey = keyof typeof bs[0]
  const rows: { label: string; key: BSKey; type?: 'section'|'subtotal'|'total'|'indent' }[] = [
    { label: 'ASSETS', key: 'cash', type: 'section' },
    { label: 'Current Assets', key: 'cash', type: 'section' },
    { label: '  Cash & Equivalents', key: 'cash', type: 'indent' },
    { label: '  Accounts Receivable (DSO=' + ops.dso + 'd)', key: 'ar', type: 'indent' },
    { label: 'Total Current Assets', key: 'totalCurrentAssets', type: 'subtotal' },
    { label: 'Non-Current Assets', key: 'netPPE', type: 'section' },
    { label: '  Net PP&E', key: 'netPPE', type: 'indent' },
    { label: 'TOTAL ASSETS', key: 'totalAssets', type: 'total' },
    { label: 'LIABILITIES & EQUITY', key: 'ap', type: 'section' },
    { label: 'Current Liabilities', key: 'ap', type: 'section' },
    { label: '  Accounts Payable', key: 'ap', type: 'indent' },
    { label: '  VAT Payable', key: 'vatPayable', type: 'indent' },
    { label: 'Total Current Liabilities', key: 'totalCurrentLiab', type: 'subtotal' },
    { label: '  Long-Term Debt', key: 'longTermDebt', type: 'indent' },
    { label: 'Total Liabilities', key: 'totalLiab', type: 'subtotal' },
    { label: 'Equity', key: 'retainedEarnings', type: 'section' },
    { label: '  Retained Earnings', key: 'retainedEarnings', type: 'indent' },
    { label: 'Total Equity', key: 'totalEquity', type: 'subtotal' },
    { label: 'TOTAL LIABILITIES + EQUITY', key: 'check', type: 'total' },
  ]

  const lastMonth = bs[bs.length - 1]
  const isBalanced = lastMonth ? Math.abs(lastMonth.check) < 1 : true

  return (
    <div className="page-in space-y-4">
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
                  {cols.map((c) => {
                    const v = bs[c.index]?.[row.key] ?? 0
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
