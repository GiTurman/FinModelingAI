'use client'
// app/income-statement/page.tsx
import { useMemo } from 'react'
import { useModelStore } from '@/store/modelStore'
import MonthlyTable, { TableRow } from '@/components/tables/MonthlyTable'
import { ModelStore, IncomeStatementMonth, CustomCategory, MonthColumn } from '@/types/model'
import { buildIS } from '@/lib/calculations'
import { generateTimeline } from '@/lib/time'
import { Settings } from 'lucide-react'
import Link from 'next/link'


export default function ISPage() {
  const store = useModelStore()
  const { selectedView, salesItems, language, config, customCategories } = store

  const timeline = useMemo(() => generateTimeline(config.startDate, config.modelLengthMonths), [config.startDate, config.modelLengthMonths])
  const isData = useMemo(() => buildIS(store), [store])

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
        label: selectedView === 'annual' ? (language === 'ka' ? `წელი ${year}` : `Year ${year}`) : (language === 'ka' ? `კვ${quarter} წ${year}` : `Q${quarter} Y${year}`),
        yearLabel: language === 'ka' ? `წ${year}` : `Y${year}`,
        monthLabel: selectedView === 'annual' ? (language === 'ka' ? 'სულ' : 'Total') : (language === 'ka' ? `კვ${quarter}` : `Q${quarter}`)
      })

      const periodSum = slice.reduce((acc: any, m: IncomeStatementMonth) => {
        const next = {
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
          netMargin: 0,
          customValues: { ...(acc.customValues || {}) }
        }
        if (m.customValues) {
          Object.entries(m.customValues).forEach(([k, v]) => {
            next.customValues[k] = (next.customValues[k] || 0) + v
          })
        }
        return next
      }, {
        revenue: 0, revenueExVat: 0, cogs: 0, grossProfit: 0, salaries: 0,
        pension: 0, otherOpex: 0, totalOpex: 0, ebitda: 0, depreciation: 0,
        ebit: 0, interestExpense: 0, ebt: 0, corporateTax: 0, netIncome: 0,
        grossMargin: 0, ebitdaMargin: 0, netMargin: 0, customValues: {} as Record<string, number>
      })

      periodSum.grossMargin = periodSum.revenueExVat > 0 ? periodSum.grossProfit / periodSum.revenueExVat : 0
      periodSum.ebitdaMargin = periodSum.revenueExVat > 0 ? periodSum.ebitda / periodSum.revenueExVat : 0
      periodSum.netMargin = periodSum.revenueExVat > 0 ? periodSum.netIncome / periodSum.revenueExVat : 0

      newData.push(periodSum)
    }

    return { cols: newCols, displayData: newData }
  }, [selectedView, timeline, isData, language])

  const rows: TableRow[] = useMemo(() => {
    const baseRows: TableRow[] = [
      { id: 's1', label: language === 'ka' ? 'მოგება-ზარალის უწყისი' : 'INCOME STATEMENT', values: cols.map(() => 0), type: 'section' },
      { id: 'rev', label: language === 'ka' ? 'შემოსავალი (დღგ-ს ჩათვლით)' : 'Revenue (incl. VAT)', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.revenue ?? 0), type: 'normal' },
      { id: 'vat', label: language === 'ka' ? '  დღგ (18%)' : '  VAT (18%)', values: cols.map((c: MonthColumn, i: number) => (displayData[i]?.revenue ?? 0) - (displayData[i]?.revenueExVat ?? 0)), type: 'indent', inverted: true },
      { id: 'revex', label: language === 'ka' ? 'შემოსავალი (დღგ-ს გარეშე)' : 'Revenue (ex-VAT)', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.revenueExVat ?? 0), type: 'subtotal' },
      { id: 'cogs', label: language === 'ka' ? '  რეალიზებული პროდუქციის თვითღირებულება' : '  COGS', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.cogs ?? 0), type: 'indent' },
      { id: 'gp', label: language === 'ka' ? 'საერთო მოგება' : 'Gross Profit', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.grossProfit ?? 0), type: 'subtotal' },
      { id: 'gpm', label: language === 'ka' ? '  საერთო მოგების მარჟა %' : '  Gross Margin %', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.grossMargin ?? 0), type: 'indent', format: 'percent' },
      { id: 's2', label: language === 'ka' ? 'საოპერაციო ხარჯები' : 'OPERATING EXPENSES', values: cols.map(() => 0), type: 'section' },
      { id: 'sal', label: language === 'ka' ? '  ხელფასები' : '  Salaries', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.salaries ?? 0), type: 'indent', inverted: true },
      { id: 'pen', label: language === 'ka' ? '  საპენსიო (4%)' : '  Pension (4%)', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.pension ?? 0), type: 'indent', inverted: true },
    ]

    // Custom OpEx rows
    const customOpEx = customCategories.filter((c: CustomCategory) => c.statement === 'IS' && c.section === 'OpEx')
    customOpEx.forEach((cat: CustomCategory) => {
      baseRows.push({
        id: cat.id,
        label: `  ${cat.name}`,
        values: cols.map((c: MonthColumn, i: number) => displayData[i]?.customValues?.[cat.id] ?? 0),
        type: 'indent',
        inverted: true
      })
    })

    baseRows.push(
      { id: 'opx', label: language === 'ka' ? '  სხვა საოპერაციო ხარჯები' : '  Other OPEX', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.otherOpex ?? 0), type: 'indent', inverted: true },
      { id: 'toopx', label: language === 'ka' ? 'სულ საოპერაციო ხარჯები' : 'Total OPEX', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.totalOpex ?? 0), type: 'subtotal', inverted: true },
      { id: 'ebitda', label: 'EBITDA', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.ebitda ?? 0), type: 'subtotal' },
      { id: 'ebitdam', label: language === 'ka' ? '  EBITDA მარჟა %' : '  EBITDA Margin %', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.ebitdaMargin ?? 0), type: 'indent', format: 'percent' },
      { id: 'dep', label: language === 'ka' ? '  ცვეთა და ამორტიზაცია' : '  Depreciation & Amortization', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.depreciation ?? 0), type: 'indent', inverted: true },
      { id: 'ebit', label: 'EBIT', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.ebit ?? 0), type: 'subtotal' },
      { id: 'int', label: language === 'ka' ? '  საპროცენტო ხარჯი' : '  Interest Expense', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.interestExpense ?? 0), type: 'indent', inverted: true },
      { id: 'ebt', label: language === 'ka' ? 'EBT (მოგება დაბეგვრამდე)' : 'EBT (Earnings Before Tax)', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.ebt ?? 0), type: 'subtotal' },
      { id: 'tax', label: language === 'ka' ? '  მოგების გადასახადი (15%)' : '  Corporate Tax (15%)', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.corporateTax ?? 0), type: 'indent', inverted: true },
      { id: 'ni', label: language === 'ka' ? 'წმინდა მოგება' : 'NET INCOME', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.netIncome ?? 0), type: 'total' },
      { id: 'nim', label: language === 'ka' ? '  წმინდა მარჟა %' : '  Net Margin %', values: cols.map((c: MonthColumn, i: number) => displayData[i]?.netMargin ?? 0), type: 'indent', format: 'percent' },
    )

    return baseRows
  }, [cols, displayData, customCategories, language])

  if (salesItems.length === 0) {
    return (
      <div className="page-in flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">
        {language === 'ka' ? 'Sales-ში გაყიდვები დაამატეთ IS-ის სანახავად' : 'Add sales in the Sales tab to view the Income Statement'}
      </div>
    )
  }

  return (
    <div className="page-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{language === 'ka' ? 'მოგება-ზარალის უწყისი' : 'Income Statement'}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ka' ? `მოგება-ზარალის ანგარიშგება • ${timeline.length} თვე • ${selectedView}` : `Income Statement • ${timeline.length} months • ${selectedView}`}
            <span className={`ml-2 font-bold ${store.scenarios.active === 'bull' ? 'text-emerald-500' : store.scenarios.active === 'bear' ? 'text-red-500' : 'text-blue-500'}`}>
              • {language === 'ka' ? (store.scenarios.active === 'base' ? 'ბაზისური სცენარი' : store.scenarios.active === 'bull' ? 'ოპტიმისტური სცენარი' : 'პესიმისტური სცენარი') : `${store.scenarios.active.toUpperCase()} Scenario`}
            </span>
          </p>
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
