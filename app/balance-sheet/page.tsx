// app/balance-sheet/page.tsx
'use client'
import React, { useState, useMemo } from 'react'
import { useModelStore } from '@/store/modelStore'
import { buildIS, buildCF, buildBS } from '@/lib/calculations'
import { generateTimeline } from '@/lib/time'
import { CapexItem } from '@/types/model'
import FinancialStatement from '@/components/financial/FinancialStatement'
import { AlertTriangle } from 'lucide-react'

export default function BalanceSheetPage() {
  const store = useModelStore()
  const { capexItems } = store
  const [view, setView] = useState<'monthly' | 'quarterly' | 'annual'>('annual')

  const timeline = useMemo(() => generateTimeline(store.config.startDate, store.config.modelLengthMonths), [store.config.startDate, store.config.modelLengthMonths])

  const { isData, cfData, bsData } = useMemo(() => {
    const isData = buildIS(store)
    const cfData = buildCF(store, isData)
    const bsData = buildBS(store, isData, cfData)
    return { isData, cfData, bsData }
  }, [store])

  const data = useMemo(() => {
    return timeline.map((t, i) => {
      const is = isData[i]
      const cf = cfData[i]
      const bs = bsData[i]

      // Assets
      const cash = bs.cash
      const accountsReceivable = bs.accountsReceivable
      const inventory = 0 // Placeholder
      const currentAssets = cash + accountsReceivable + inventory

      const capexItemsData = capexItems
      const netPPE = capexItemsData.reduce((sum: number, item: CapexItem) => {
        if (i < item.monthIndex) return sum
        const monthsDepreciated = i - item.monthIndex + 1
        const depreciable = item.amount - (item.residualValue ?? 0)
        const accDep = (depreciable / Math.max(item.usefulLifeMonths, 1)) * monthsDepreciated
        return sum + Math.max(item.amount - accDep, 0)
      }, 0)

      const totalAssets = currentAssets + netPPE

      // Liabilities
      const accountsPayable = bs.accountsPayable
      const currentLiabilities = accountsPayable // + current portion of LTD
      const longTermDebt = bs.longTermDebt
      const totalLiabilities = currentLiabilities + longTermDebt

      // Equity
      const paidInCapital = bs.paidInCapital
      const retainedEarnings = bs.retainedEarnings
      const totalEquity = paidInCapital + retainedEarnings

      const totalLiabilitiesEquity = totalLiabilities + totalEquity
      const check = totalAssets - totalLiabilitiesEquity

      const hasCapexData = capexItems.length > 0
      const bsIsComplete = hasCapexData

      return {
        ...t,
        cash,
        accountsReceivable,
        inventory,
        currentAssets,
        netPPE,
        totalAssets,
        accountsPayable,
        currentLiabilities,
        longTermDebt,
        totalLiabilities,
        paidInCapital,
        retainedEarnings,
        totalEquity,
        totalLiabilitiesEquity,
        check,
        bsIsComplete,
      }
    })
  }, [timeline, isData, cfData, bsData, capexItems])

  const rows = [
    { key: 'cash', label: 'Cash & Equivalents', bold: false, indent: 1 },
    { key: 'accountsReceivable', label: 'Accounts Receivable', bold: false, indent: 1 },
    { key: 'inventory', label: 'Inventory', bold: false, indent: 1, isPlaceholder: true },
    { key: 'currentAssets', label: 'Total Current Assets', bold: true, indent: 0 },
    { key: 'netPPE', label: 'Net Property, Plant & Equipment', bold: false, indent: 1 },
    { key: 'totalAssets', label: 'Total Assets', bold: true, indent: 0, isHeader: true },
    { key: 'separator', label: '', isSeparator: true },
    { key: 'accountsPayable', label: 'Accounts Payable', bold: false, indent: 1 },
    { key: 'currentLiabilities', label: 'Total Current Liabilities', bold: true, indent: 0 },
    { key: 'longTermDebt', label: 'Long-Term Debt', bold: false, indent: 1 },
    { key: 'totalLiabilities', label: 'Total Liabilities', bold: true, indent: 0, isHeader: true },
    { key: 'separator', label: '', isSeparator: true },
    { key: 'paidInCapital', label: 'Paid-in Capital', bold: false, indent: 1 },
    { key: 'retainedEarnings', label: 'Retained Earnings', bold: false, indent: 1 },
    { key: 'totalEquity', label: 'Total Equity', bold: true, indent: 0 },
    { key: 'totalLiabilitiesEquity', label: 'Total Liabilities & Equity', bold: true, indent: 0, isHeader: true },
    { key: 'separator', label: '', isSeparator: true },
    { key: 'check', label: 'Balance Check', bold: true, indent: 0, isCheck: true },
  ]

  const lastMonth = data[data.length - 1]
  const isBalanced = lastMonth && Math.abs(lastMonth.check) < 1
  const isComplete = lastMonth && lastMonth.bsIsComplete

  const balanceStatus = () => {
    if (!isComplete) {
      return (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm">
          <AlertTriangle size={16} />
          <span>Model Incomplete: Some schedules are not yet fully integrated. Balance sheet may not balance.</span>
        </div>
      )
    }
    if (isBalanced) {
      return (
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <span>Assets = Liabilities + Equity. The balance sheet is balanced.</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        <span>Balance sheet is NOT balanced. Check input schedules for errors.</span>
      </div>
    )
  }

  return (
    <FinancialStatement
      title="Balance Sheet"
      data={data}
      rows={rows}
      view={view}
      setView={setView}
      infoPanel={balanceStatus()}
    />
  )
}