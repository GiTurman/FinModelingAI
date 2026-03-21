// app/balance-sheet/page.tsx
'use client'
import React, { useState, useMemo } from 'react'
import { useModelStore } from '@/store/modelStore'
import { buildIS, buildCF, buildBS } from '@/lib/calculations'
import { generateTimeline } from '@/lib/time'
import FinancialStatement from '@/components/financial/FinancialStatement'
import { CapexItem } from '@/types/model'

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

      // Assets
      const cash = cf.closingCash
      const accountsReceivable = is.revenueExVat * (store.ops.dso / 30)
      const inventory = 0 // Placeholder
      const currentAssets = cash + accountsReceivable + inventory

      // Real PP&E from CapEx schedule with accumulated depreciation
      const netPPE = capexItems.reduce((sum: number, item) => {
        if (i < item.monthIndex) return sum
        const monthsDepreciated = i - item.monthIndex + 1
        const depreciable = item.amount - (item.residualValue ?? 0)
        const accDep = (depreciable / Math.max(item.usefulLifeMonths, 1)) * monthsDepreciated
        return sum + Math.max(item.amount - accDep, 0)
      }, 0)

      const totalAssets = currentAssets + netPPE

      // Liabilities
      const accountsPayable = (is.cogs + is.totalOpex) * (store.ops.dpo / 30)
      const currentLiabilities = accountsPayable // + current portion of LTD

      let longTermDebt = 0
      store.investments.forEach(inv => {
        if (inv.type !== 'Loan') return
        if (i < inv.monthIndex) return

        const r = inv.interestRate / 100 / 12
        const n = inv.termMonths
        const mElapsed = i - inv.monthIndex + 1

        if (mElapsed > n) return // Loan paid off

        if (r === 0) {
          longTermDebt += inv.amount * (1 - mElapsed / n)
          return
        }

        const balance = inv.amount
          * (Math.pow(1 + r, n) - Math.pow(1 + r, mElapsed))
          / (Math.pow(1 + r, n) - 1)
        longTermDebt += balance
      })

      const totalLiabilities = currentLiabilities + longTermDebt

      // Equity
      let paidInCapital = 0
      for (let j = 0; j <= i; j++) {
        paidInCapital += cfData[j].equityIn
      }

      let retainedEarnings = 0
      for (let j = 0; j <= i; j++) {
        retainedEarnings += isData[j].netIncome
      }

      const totalEquity = paidInCapital + retainedEarnings

      const totalLiabilitiesEquity = totalLiabilities + totalEquity
      const check = totalAssets - totalLiabilitiesEquity

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
      }
    })
  }, [timeline, isData, cfData, store.ops.dso, store.ops.dpo, store.investments, capexItems])

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

  return (
    <FinancialStatement
      title="Balance Sheet"
      data={data}
      rows={rows}
      view={view}
      setView={setView}
    />
  )
}