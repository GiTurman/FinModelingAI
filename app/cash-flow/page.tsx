'use client'
// app/cash-flow/page.tsx
import { useModelStore } from '@/store/modelStore'
import MonthlyTable, { TableRow } from '@/components/tables/MonthlyTable'
import { MonthColumn } from '@/types/model'

function filterCols(cols: MonthColumn[], view: string): MonthColumn[] {
  if (view === 'annual') return cols.filter((c) => c.monthLabel === 'M1')
  if (view === 'quarterly') return cols.filter((c) => [1,4,7,10].includes(c.month))
  return cols
}

export default function CFPage() {
  const { getCF, getTimeline, selectedView, salesItems } = useModelStore()
  const timeline = getTimeline()
  const cfData = getCF()
  const cols = filterCols(timeline, selectedView)

  const rows: TableRow[] = [
    { id: 's1', label: 'CASH FLOW FROM OPERATIONS', values: cols.map(() => 0), type: 'section' },
    { id: 'ni', label: 'Net Income', values: cols.map((c) => cfData[c.index]?.netIncome ?? 0), type: 'normal' },
    { id: 'dep', label: '  + Depreciation', values: cols.map((c) => cfData[c.index]?.depreciation ?? 0), type: 'indent' },
    { id: 'wc', label: '  Δ Working Capital', values: cols.map((c) => cfData[c.index]?.changeInWC ?? 0), type: 'indent' },
    { id: 'oc', label: 'Cash from Operations', values: cols.map((c) => cfData[c.index]?.cashFromOps ?? 0), type: 'subtotal' },
    { id: 's2', label: 'CASH FLOW FROM INVESTING', values: cols.map(() => 0), type: 'section' },
    { id: 'cap', label: '  - CapEx', values: cols.map((c) => cfData[c.index]?.capexOutflow ?? 0), type: 'indent', inverted: true },
    { id: 'ci', label: 'Cash from Investing', values: cols.map((c) => cfData[c.index]?.cashFromInv ?? 0), type: 'subtotal' },
    { id: 's3', label: 'CASH FLOW FROM FINANCING', values: cols.map(() => 0), type: 'section' },
    { id: 'eq', label: '  + Equity Injections', values: cols.map((c) => cfData[c.index]?.equityIn ?? 0), type: 'indent' },
    { id: 'ln', label: '  + Loan Drawdowns', values: cols.map((c) => cfData[c.index]?.loanIn ?? 0), type: 'indent' },
    { id: 'lp', label: '  - Loan Repayments', values: cols.map((c) => cfData[c.index]?.loanOut ?? 0), type: 'indent', inverted: true },
    { id: 'cf', label: 'Cash from Financing', values: cols.map((c) => cfData[c.index]?.cashFromFin ?? 0), type: 'subtotal' },
    { id: 'fcf', label: 'FREE CASH FLOW', values: cols.map((c) => cfData[c.index]?.freeCashFlow ?? 0), type: 'total' },
    { id: 's4', label: 'CASH BALANCE', values: cols.map(() => 0), type: 'section' },
    { id: 'op', label: 'Opening Cash', values: cols.map((c) => cfData[c.index]?.openingCash ?? 0), type: 'normal' },
    { id: 'nc', label: 'Net Cash Change', values: cols.map((c) => cfData[c.index]?.netCashChange ?? 0), type: 'normal' },
    { id: 'cl', label: 'CLOSING CASH', values: cols.map((c) => cfData[c.index]?.closingCash ?? 0), type: 'total' },
  ]

  if (salesItems.length === 0) {
    return <div className="page-in flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">Sales-ში გაყიდვები დაამატეთ</div>
  }

  return (
    <div className="page-in space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Cash Flow Statement</h1>
        <p className="text-xs text-slate-400 mt-1">ფულადი ნაკადების ანგარიშგება • {selectedView}</p>
      </div>
      <MonthlyTable columns={cols} rows={rows} />
    </div>
  )
}
