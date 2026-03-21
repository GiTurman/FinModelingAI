'use client'
// app/cash-flow/page.tsx
import { useMemo } from 'react'
import { useModelStore } from '@/store/modelStore'
import MonthlyTable, { TableRow } from '@/components/tables/MonthlyTable'
import { ModelStore, CashFlowMonth, MonthColumn } from '@/types/model'
import { buildIS, buildCF } from '@/lib/calculations'
import { generateTimeline } from '@/lib/time'
import { Settings } from 'lucide-react'
import Link from 'next/link'


export default function CFPage() {
  const store = useModelStore()
  const { selectedView, salesItems, language, config } = store

  const timeline = useMemo(() => generateTimeline(config.startDate, config.modelLengthMonths), [config.startDate, config.modelLengthMonths])
  const cfData = useMemo(() => {
    const isData = buildIS(store)
    return buildCF(store, isData)
  }, [store])

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
        label: selectedView === 'annual' ? (language === 'ka' ? `წელი ${year}` : `Year ${year}`) : (language === 'ka' ? `კვ${quarter} წ${year}` : `Q${quarter} Y${year}`),
        yearLabel: language === 'ka' ? `წ${year}` : `Y${year}`,
        monthLabel: selectedView === 'annual' ? (language === 'ka' ? 'სულ' : 'Total') : (language === 'ka' ? `კვ${quarter}` : `Q${quarter}`)
      })

      const periodSum = slice.reduce((acc: any, m: CashFlowMonth) => ({
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
  }, [selectedView, timeline, cfData, language])

  const rows: TableRow[] = useMemo(() => [
    { id: 's1', label: language === 'ka' ? 'საოპერაციო ფულადი ნაკადები' : 'CASH FLOW FROM OPERATIONS', values: cols.map(() => 0), type: 'section' },
    { id: 'ni', label: language === 'ka' ? 'წმინდა მოგება' : 'Net Income', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.netIncome ?? 0), type: 'normal' },
    { id: 'dep', label: language === 'ka' ? '  + ცვეთა' : '  + Depreciation', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.depreciation ?? 0), type: 'indent' },
    { id: 'wc', label: language === 'ka' ? '  Δ საბრუნავი კაპიტალი' : '  Δ Working Capital', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.changeInWC ?? 0), type: 'indent' },
    { id: 'oc', label: language === 'ka' ? 'ფულადი ნაკადები ოპერაციებიდან' : 'Cash from Operations', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.cashFromOps ?? 0), type: 'subtotal' },
    { id: 's2', label: language === 'ka' ? 'საინვესტიციო ფულადი ნაკადები' : 'CASH FLOW FROM INVESTING', values: cols.map(() => 0), type: 'section' },
    { id: 'cap', label: language === 'ka' ? '  - კაპიტალური დანახარჯები (CapEx)' : '  - CapEx', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.capexOutflow ?? 0), type: 'indent', inverted: true },
    { id: 'ci', label: language === 'ka' ? 'ფულადი ნაკადები ინვესტიციებიდან' : 'Cash from Investing', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.cashFromInv ?? 0), type: 'subtotal' },
    { id: 's3', label: language === 'ka' ? 'საფინანსო ფულადი ნაკადები' : 'CASH FLOW FROM FINANCING', values: cols.map(() => 0), type: 'section' },
    { id: 'eq', label: language === 'ka' ? '  + კაპიტალის ინექციები' : '  + Equity Injections', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.equityIn ?? 0), type: 'indent' },
    { id: 'ln', label: language === 'ka' ? '  + სესხის აღება' : '  + Loan Drawdowns', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.loanIn ?? 0), type: 'indent' },
    { id: 'lp', label: language === 'ka' ? '  - სესხის დაფარვა' : '  - Loan Repayments', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.loanOut ?? 0), type: 'indent', inverted: true },
    { id: 'cf', label: language === 'ka' ? 'ფულადი ნაკადები დაფინანსებიდან' : 'Cash from Financing', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.cashFromFin ?? 0), type: 'subtotal' },
    { id: 'fcf', label: language === 'ka' ? 'თავისუფალი ფულადი ნაკადები' : 'FREE CASH FLOW', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.freeCashFlow ?? 0), type: 'total' },
    { id: 's4', label: language === 'ka' ? 'ფულადი სახსრების ბალანსი' : 'CASH BALANCE', values: cols.map(() => 0), type: 'section' },
    { id: 'op', label: language === 'ka' ? 'საწყისი ფულადი სახსრები' : 'Opening Cash', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.openingCash ?? 0), type: 'normal' },
    { id: 'nc', label: language === 'ka' ? 'წმინდა ფულადი სახსრების ცვლილება' : 'Net Cash Change', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.netCashChange ?? 0), type: 'normal' },
    { id: 'cl', label: language === 'ka' ? 'საბოლოო ფულადი სახსრები' : 'CLOSING CASH', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.closingCash ?? 0), type: 'total' },
  ], [cols, displayData, language])

  if (salesItems.length === 0) {
    return <div className="page-in flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">{language === 'ka' ? 'Sales-ში გაყიდვები დაამატეთ CF-ის სანახავად' : 'Add sales in the Sales page to view CF'}</div>
  }

  return (
    <div className="page-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{language === 'ka' ? 'ფულადი ნაკადების ანგარიშგება' : 'Cash Flow Statement'}</h1>
          <p className="text-xs text-slate-400 mt-1">{language === 'ka' ? `ფულადი ნაკადები • ${selectedView}` : `Cash Flow • ${selectedView}`}</p>
        </div>
        <Link
          href="/line-items"
          className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Settings size={15} /> {language === 'ka' ? 'მუხლების მართვა' : 'Manage Line Items'}
        </Link>
      </div>
      <MonthlyTable columns={cols} rows={rows} />
    </div>
  )
}
