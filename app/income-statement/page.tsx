'use client'
// app/income-statement/page.tsx
import { useModelStore } from '@/store/modelStore'
import MonthlyTable, { TableRow } from '@/components/tables/MonthlyTable'
import { MonthColumn } from '@/types/model'

function filterCols(cols: MonthColumn[], view: string): MonthColumn[] {
  if (view === 'annual') {
    return cols.filter((c) => c.monthLabel === 'M1')
  }
  if (view === 'quarterly') {
    return cols.filter((c) => [1,4,7,10].includes(c.month))
  }
  return cols
}

export default function ISPage() {
  const { getIS, getTimeline, selectedView, salesItems } = useModelStore()
  const timeline = getTimeline()
  const isData = getIS()
  const cols = filterCols(timeline, selectedView)

  const rows: TableRow[] = [
    { id: 's1', label: 'INCOME STATEMENT', values: cols.map(() => 0), type: 'section' },
    { id: 'rev', label: 'Revenue (incl. VAT)', values: cols.map((c) => isData[c.index]?.revenue ?? 0), type: 'normal' },
    { id: 'vat', label: '  VAT (18%)', values: cols.map((c) => (isData[c.index]?.revenue ?? 0) - (isData[c.index]?.revenueExVat ?? 0)), type: 'indent', inverted: true },
    { id: 'revex', label: 'Revenue (ex-VAT)', values: cols.map((c) => isData[c.index]?.revenueExVat ?? 0), type: 'subtotal' },
    { id: 'cogs', label: '  COGS', values: cols.map((c) => isData[c.index]?.cogs ?? 0), type: 'indent' },
    { id: 'gp', label: 'Gross Profit', values: cols.map((c) => isData[c.index]?.grossProfit ?? 0), type: 'subtotal' },
    { id: 'gpm', label: '  Gross Margin %', values: cols.map((c) => isData[c.index]?.grossMargin ?? 0), type: 'indent', format: 'percent' },
    { id: 's2', label: 'OPERATING EXPENSES', values: cols.map(() => 0), type: 'section' },
    { id: 'sal', label: '  Salaries', values: cols.map((c) => isData[c.index]?.salaries ?? 0), type: 'indent', inverted: true },
    { id: 'pen', label: '  Pension (4%)', values: cols.map((c) => isData[c.index]?.pension ?? 0), type: 'indent', inverted: true },
    { id: 'opx', label: '  Other OPEX', values: cols.map((c) => isData[c.index]?.otherOpex ?? 0), type: 'indent', inverted: true },
    { id: 'toopx', label: 'Total OPEX', values: cols.map((c) => isData[c.index]?.totalOpex ?? 0), type: 'subtotal', inverted: true },
    { id: 'ebitda', label: 'EBITDA', values: cols.map((c) => isData[c.index]?.ebitda ?? 0), type: 'subtotal' },
    { id: 'ebitdam', label: '  EBITDA Margin %', values: cols.map((c) => isData[c.index]?.ebitdaMargin ?? 0), type: 'indent', format: 'percent' },
    { id: 'dep', label: '  Depreciation & Amortization', values: cols.map((c) => isData[c.index]?.depreciation ?? 0), type: 'indent', inverted: true },
    { id: 'ebit', label: 'EBIT', values: cols.map((c) => isData[c.index]?.ebit ?? 0), type: 'subtotal' },
    { id: 'int', label: '  Interest Expense', values: cols.map((c) => isData[c.index]?.interestExpense ?? 0), type: 'indent', inverted: true },
    { id: 'ebt', label: 'EBT (Earnings Before Tax)', values: cols.map((c) => isData[c.index]?.ebt ?? 0), type: 'subtotal' },
    { id: 'tax', label: '  Corporate Tax (15%)', values: cols.map((c) => isData[c.index]?.corporateTax ?? 0), type: 'indent', inverted: true },
    { id: 'ni', label: 'NET INCOME', values: cols.map((c) => isData[c.index]?.netIncome ?? 0), type: 'total' },
    { id: 'nim', label: '  Net Margin %', values: cols.map((c) => isData[c.index]?.netMargin ?? 0), type: 'indent', format: 'percent' },
  ]

  if (salesItems.length === 0) {
    return (
      <div className="page-in flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">
        Sales-ში გაყიდვები დაამატეთ IS-ის სანახავად
      </div>
    )
  }

  return (
    <div className="page-in space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Income Statement</h1>
        <p className="text-xs text-slate-400 mt-1">მოგება-ზარალის ანგარიშგება • {timeline.length} თვე • {selectedView}</p>
      </div>
      <MonthlyTable columns={cols} rows={rows} />
    </div>
  )
}
