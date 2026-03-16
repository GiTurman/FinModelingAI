'use client'
// app/cash-flow/page.tsx
import { useMemo } from 'react'
import { useModelStore } from '@/store/modelStore'
import MonthlyTable, { TableRow } from '@/components/tables/MonthlyTable'
import { MonthColumn } from '@/types/model'


export default function CFPage() {
  const getCF = useModelStore((s) => s.getCF)
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

  const timeline = useMemo(() => getTimeline(), [getTimeline, config])
  const cfData = useMemo(() => getCF(), [getCF, salesItems, opexItems, capexItems, investments, taxRates, ops, config, activeScenario, scenarioConfig])

  const { cols, displayData } = useMemo(() => {
    if (selectedView === 'monthly') {
      return { cols: timeline, displayData: cfData }
    }

    const newCols: any[] = []
    const newData: any[] = []

    const periodSize = selectedView === 'annual' ? 12 : 3
    const numPeriods = Math.ceil(cfData.length / periodSize)

    for (let i = 0; i < numPeriods; i++) {
      const slice = cfData.slice(i * periodSize, (i + 1) * periodSize)
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
        netIncome: acc.netIncome + m.netIncome,
        depreciation: acc.depreciation + m.depreciation,
        changeInWC: acc.changeInWC + m.changeInWC,
        cashFromOps: acc.cashFromOps + m.cashFromOps,
        capexOutflow: acc.capexOutflow + m.capexOutflow,
        cashFromInv: acc.cashFromInv + m.cashFromInv,
        equityIn: acc.equityIn + m.equityIn,
        loanIn: acc.loanIn + m.loanIn,
        loanOut: acc.loanOut + m.loanOut,
        cashFromFin: acc.cashFromFin + m.cashFromFin,
        netCashChange: acc.netCashChange + m.netCashChange,
        freeCashFlow: acc.freeCashFlow + m.freeCashFlow,
        // Point in time
        openingCash: acc.openingCash, // will be set from first month
        closingCash: m.closingCash   // will be set from last month
      }), {
        netIncome: 0, depreciation: 0, changeInWC: 0, cashFromOps: 0,
        capexOutflow: 0, cashFromInv: 0, equityIn: 0, loanIn: 0, loanOut: 0,
        cashFromFin: 0, netCashChange: 0, freeCashFlow: 0,
        openingCash: slice[0].openingCash,
        closingCash: 0
      })

      newData.push(periodSum)
    }

    return { cols: newCols, displayData: newData }
  }, [selectedView, timeline, cfData])

  const rows: TableRow[] = useMemo(() => [
    { id: 's1', label: 'CASH FLOW FROM OPERATIONS', values: cols.map(() => 0), type: 'section' },
    { id: 'ni', label: 'Net Income', values: cols.map((c, i) => displayData[i]?.netIncome ?? 0), type: 'normal' },
    { id: 'dep', label: '  + Depreciation', values: cols.map((c, i) => displayData[i]?.depreciation ?? 0), type: 'indent' },
    { id: 'wc', label: '  Δ Working Capital', values: cols.map((c, i) => displayData[i]?.changeInWC ?? 0), type: 'indent' },
    { id: 'oc', label: 'Cash from Operations', values: cols.map((c, i) => displayData[i]?.cashFromOps ?? 0), type: 'subtotal' },
    { id: 's2', label: 'CASH FLOW FROM INVESTING', values: cols.map(() => 0), type: 'section' },
    { id: 'cap', label: '  - CapEx', values: cols.map((c, i) => displayData[i]?.capexOutflow ?? 0), type: 'indent', inverted: true },
    { id: 'ci', label: 'Cash from Investing', values: cols.map((c, i) => displayData[i]?.cashFromInv ?? 0), type: 'subtotal' },
    { id: 's3', label: 'CASH FLOW FROM FINANCING', values: cols.map(() => 0), type: 'section' },
    { id: 'eq', label: '  + Equity Injections', values: cols.map((c, i) => displayData[i]?.equityIn ?? 0), type: 'indent' },
    { id: 'ln', label: '  + Loan Drawdowns', values: cols.map((c, i) => displayData[i]?.loanIn ?? 0), type: 'indent' },
    { id: 'lp', label: '  - Loan Repayments', values: cols.map((c, i) => displayData[i]?.loanOut ?? 0), type: 'indent', inverted: true },
    { id: 'cf', label: 'Cash from Financing', values: cols.map((c, i) => displayData[i]?.cashFromFin ?? 0), type: 'subtotal' },
    { id: 'fcf', label: 'FREE CASH FLOW', values: cols.map((c, i) => displayData[i]?.freeCashFlow ?? 0), type: 'total' },
    { id: 's4', label: 'CASH BALANCE', values: cols.map(() => 0), type: 'section' },
    { id: 'op', label: 'Opening Cash', values: cols.map((c, i) => displayData[i]?.openingCash ?? 0), type: 'normal' },
    { id: 'nc', label: 'Net Cash Change', values: cols.map((c, i) => displayData[i]?.netCashChange ?? 0), type: 'normal' },
    { id: 'cl', label: 'CLOSING CASH', values: cols.map((c, i) => displayData[i]?.closingCash ?? 0), type: 'total' },
  ], [cols, displayData])

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
