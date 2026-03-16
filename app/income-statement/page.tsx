'use client'
// app/income-statement/page.tsx
import { useMemo } from 'react'
import { useModelStore } from '@/store/modelStore'
import MonthlyTable, { TableRow } from '@/components/tables/MonthlyTable'
import { MonthColumn } from '@/types/model'


export default function ISPage() {
  const getIS = useModelStore((s) => s.getIS)
  const getTimeline = useModelStore((s) => s.getTimeline)
  const selectedView = useModelStore((s) => s.selectedView)
  const salesItems = useModelStore((s) => s.salesItems)
  const cogsItems = useModelStore((s) => s.cogsItems)
  const opexItems = useModelStore((s) => s.opexItems)
  const capexItems = useModelStore((s) => s.capexItems)
  const investments = useModelStore((s) => s.investments)
  const taxRates = useModelStore((s) => s.taxRates)
  const ops = useModelStore((s) => s.ops)
  const config = useModelStore((s) => s.config)
  const activeScenario = useModelStore((s) => s.scenarios.active)
  const scenarioConfig = useModelStore((s) => s.scenarios[s.scenarios.active])

  const timeline = useMemo(() => getTimeline(), [getTimeline, config])
  const isData = useMemo(() => getIS(), [getIS, salesItems, cogsItems, opexItems, capexItems, investments, taxRates, ops, config, activeScenario, scenarioConfig])

  const { cols, displayData } = useMemo(() => {
    if (selectedView === 'monthly') {
      return { cols: timeline, displayData: isData }
    }

    const newCols: any[] = []
    const newData: any[] = []

    const periodSize = selectedView === 'annual' ? 12 : 3
    const numPeriods = Math.ceil(isData.length / periodSize)

    for (let i = 0; i < numPeriods; i++) {
      const slice = isData.slice(i * periodSize, (i + 1) * periodSize)
      if (slice.length === 0) break

      const year = Math.floor((i * periodSize) / 12) + 1
      const quarter = Math.floor(((i * periodSize) % 12) / 3) + 1

      newCols.push({
        index: i,
        label: selectedView === 'annual' ? `Year ${year}` : `Q${quarter} Y${year}`,
        yearLabel: `Y${year}`,
        monthLabel: selectedView === 'annual' ? 'Total' : `Q${quarter}`
      })

      const periodSum = slice.reduce((acc, m) => ({
        revenue: acc.revenue + m.revenue,
        revenueExVat: acc.revenueExVat + m.revenueExVat,
        cogs: acc.cogs + m.cogs,
        grossProfit: acc.grossProfit + m.grossProfit,
        salaries: acc.salaries + m.salaries,
        pension: acc.pension + m.pension,
        otherOpex: acc.otherOpex + m.otherOpex,
        totalOpex: acc.totalOpex + m.totalOpex,
        ebitda: acc.ebitda + m.ebitda,
        depreciation: acc.depreciation + m.depreciation,
        ebit: acc.ebit + m.ebit,
        interestExpense: acc.interestExpense + m.interestExpense,
        ebt: acc.ebt + m.ebt,
        corporateTax: acc.corporateTax + m.corporateTax,
        netIncome: acc.netIncome + m.netIncome,
        grossMargin: 0,
        ebitdaMargin: 0,
        netMargin: 0
      }), {
        revenue: 0, revenueExVat: 0, cogs: 0, grossProfit: 0, salaries: 0,
        pension: 0, otherOpex: 0, totalOpex: 0, ebitda: 0, depreciation: 0,
        ebit: 0, interestExpense: 0, ebt: 0, corporateTax: 0, netIncome: 0,
        grossMargin: 0, ebitdaMargin: 0, netMargin: 0
      })

      periodSum.grossMargin = periodSum.revenueExVat > 0 ? periodSum.grossProfit / periodSum.revenueExVat : 0
      periodSum.ebitdaMargin = periodSum.revenueExVat > 0 ? periodSum.ebitda / periodSum.revenueExVat : 0
      periodSum.netMargin = periodSum.revenueExVat > 0 ? periodSum.netIncome / periodSum.revenueExVat : 0

      newData.push(periodSum)
    }

    return { cols: newCols, displayData: newData }
  }, [selectedView, timeline, isData])

  const rows: TableRow[] = useMemo(() => [
    { id: 's1', label: 'INCOME STATEMENT', values: cols.map(() => 0), type: 'section' },
    { id: 'rev', label: 'Revenue (incl. VAT)', values: cols.map((c, i) => displayData[i]?.revenue ?? 0), type: 'normal' },
    { id: 'vat', label: '  VAT (18%)', values: cols.map((c, i) => (displayData[i]?.revenue ?? 0) - (displayData[i]?.revenueExVat ?? 0)), type: 'indent', inverted: true },
    { id: 'revex', label: 'Revenue (ex-VAT)', values: cols.map((c, i) => displayData[i]?.revenueExVat ?? 0), type: 'subtotal' },
    { id: 'cogs', label: '  COGS', values: cols.map((c, i) => displayData[i]?.cogs ?? 0), type: 'indent' },
    { id: 'gp', label: 'Gross Profit', values: cols.map((c, i) => displayData[i]?.grossProfit ?? 0), type: 'subtotal' },
    { id: 'gpm', label: '  Gross Margin %', values: cols.map((c, i) => displayData[i]?.grossMargin ?? 0), type: 'indent', format: 'percent' },
    { id: 's2', label: 'OPERATING EXPENSES', values: cols.map(() => 0), type: 'section' },
    { id: 'sal', label: '  Salaries', values: cols.map((c, i) => displayData[i]?.salaries ?? 0), type: 'indent', inverted: true },
    { id: 'pen', label: '  Pension (4%)', values: cols.map((c, i) => displayData[i]?.pension ?? 0), type: 'indent', inverted: true },
    { id: 'opx', label: '  Other OPEX', values: cols.map((c, i) => displayData[i]?.otherOpex ?? 0), type: 'indent', inverted: true },
    { id: 'toopx', label: 'Total OPEX', values: cols.map((c, i) => displayData[i]?.totalOpex ?? 0), type: 'subtotal', inverted: true },
    { id: 'ebitda', label: 'EBITDA', values: cols.map((c, i) => displayData[i]?.ebitda ?? 0), type: 'subtotal' },
    { id: 'ebitdam', label: '  EBITDA Margin %', values: cols.map((c, i) => displayData[i]?.ebitdaMargin ?? 0), type: 'indent', format: 'percent' },
    { id: 'dep', label: '  Depreciation & Amortization', values: cols.map((c, i) => displayData[i]?.depreciation ?? 0), type: 'indent', inverted: true },
    { id: 'ebit', label: 'EBIT', values: cols.map((c, i) => displayData[i]?.ebit ?? 0), type: 'subtotal' },
    { id: 'int', label: '  Interest Expense', values: cols.map((c, i) => displayData[i]?.interestExpense ?? 0), type: 'indent', inverted: true },
    { id: 'ebt', label: 'EBT (Earnings Before Tax)', values: cols.map((c, i) => displayData[i]?.ebt ?? 0), type: 'subtotal' },
    { id: 'tax', label: '  Corporate Tax (15%)', values: cols.map((c, i) => displayData[i]?.corporateTax ?? 0), type: 'indent', inverted: true },
    { id: 'ni', label: 'NET INCOME', values: cols.map((c, i) => displayData[i]?.netIncome ?? 0), type: 'total' },
    { id: 'nim', label: '  Net Margin %', values: cols.map((c, i) => displayData[i]?.netMargin ?? 0), type: 'indent', format: 'percent' },
  ], [cols, displayData])

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
