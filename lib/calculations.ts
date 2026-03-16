// lib/calculations.ts
import { MonthColumn, IncomeStatementMonth, CashFlowMonth, ModelStore } from '@/types/model'
import { addMonths, format } from 'date-fns'

export const sumArr = (arr: number[]) => arr.reduce((a, b) => a + b, 0)

export const fmtGEL = (val: number, isK = false) => {
  const v = isK ? val / 1000 : val
  return new Intl.NumberFormat('ka-GE', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v) + (isK ? 'K' : '') + ' ₾'
}

export const fmtPct = (val: number) => `${(val * 100).toFixed(1)}%`

export function generateTimeline(startDate: string, length: number): MonthColumn[] {
  const start = new Date(startDate)
  return Array.from({ length }).map((_, i) => {
    const d = addMonths(start, i)
    return {
      index: i,
      label: format(d, 'MMM yyyy'),
      year: Math.floor(i / 12) + 1,
      month: (i % 12) + 1,
      yearLabel: `Y${Math.floor(i / 12) + 1}`,
      monthLabel: `M${(i % 12) + 1}`,
    }
  })
}

export function buildIS(store: ModelStore, scenarioType?: 'base' | 'bull' | 'bear'): IncomeStatementMonth[] {
  const timeline = generateTimeline(store.config.startDate, store.config.modelLengthMonths)
  const sc = store.scenarios[scenarioType || store.scenarios.active]

  return timeline.map((col) => {
    // Revenue
    let revenue = 0
    let revenueExVat = 0
    store.salesItems.forEach((item) => {
      const units = (item.monthlyUnits[col.index] ?? 0) * (sc.revenueMultiplier ?? 1)
      const price = item.unitPrice
      const rev = units * price
      revenue += rev
      revenueExVat += item.vatIncluded ? rev / (1 + store.taxRates.vatRate) : rev
    })

    // COGS
    let cogs = 0
    store.salesItems.forEach((sItem) => {
      const units = (sItem.monthlyUnits[col.index] ?? 0) * (sc.revenueMultiplier ?? 1)
      const productCogsItems = store.cogsItems.filter(c => c.salesItemId === sItem.id)
      const unitCost = productCogsItems.reduce((sum, c) => sum + (c.unitCost ?? 0), 0)
      cogs += units * unitCost * (sc.cogsMultiplier ?? 1)
    })

    const grossProfit = revenueExVat - cogs
    const grossMargin = revenueExVat > 0 ? grossProfit / revenueExVat : 0

    // OPEX
    let salaries = 0
    let otherOpex = 0
    store.opexItems.forEach((item) => {
      let amt = (item.monthlyAmount[col.index] ?? 0) * (sc.opexMultiplier ?? 1)
      if (item.inflationAdjusted) {
        amt *= Math.pow(1 + store.ops.inflationRate / 100, col.year - 1)
      }
      if (item.category === 'G&A' && item.name.toLowerCase().includes('salary')) {
        salaries += amt
      } else {
        otherOpex += amt
      }
    })

    const pension = salaries * store.taxRates.pensionRate
    const totalOpex = salaries + pension + otherOpex
    const ebitda = grossProfit - totalOpex

    // Depreciation
    let depreciation = 0
    store.capexItems.forEach((item) => {
      const monthly = (item.amount * (sc.capexMultiplier ?? 1)) / item.usefulLifeMonths
      if (col.index >= item.monthIndex && col.index < item.monthIndex + item.usefulLifeMonths) {
        depreciation += monthly
      }
    })

    const ebit = ebitda - depreciation

    // Interest (simplified)
    let interestExpense = 0
    store.investments.forEach((inv) => {
      if (inv.type === 'Loan' && col.index > inv.monthIndex && col.index <= inv.monthIndex + inv.termMonths) {
        const monthlyRate = (inv.interestRate / 100) / 12
        const p = inv.amount
        const n = inv.termMonths
        // Annuity: PMT = P * r * (1+r)^n / ((1+r)^n - 1)
        const pmt = p * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1)
        // Interest for month m: Balance_m-1 * r
        // Simplified: avg interest
        interestExpense += (inv.amount / 2) * (inv.interestRate / 100 / 12)
      }
    })

    const ebt = ebit - interestExpense
    const corporateTax = ebt > 0 ? ebt * store.taxRates.corporateTaxRate : 0
    const netIncome = ebt - corporateTax

    return {
      revenue, revenueExVat, cogs, grossProfit, grossMargin,
      salaries, pension, otherOpex, totalOpex, ebitda, ebitdaMargin: revenueExVat > 0 ? ebitda / revenueExVat : 0,
      depreciation, ebit, interestExpense, ebt, corporateTax, netIncome,
      netMargin: revenueExVat > 0 ? netIncome / revenueExVat : 0
    }
  })
}

export function buildCF(store: ModelStore, isData: IncomeStatementMonth[], scenarioType?: 'base' | 'bull' | 'bear'): CashFlowMonth[] {
  const timeline = generateTimeline(store.config.startDate, store.config.modelLengthMonths)
  const sc = store.scenarios[scenarioType || store.scenarios.active]
  const cf: CashFlowMonth[] = []

  let runningCash = 0

  timeline.forEach((col, i) => {
    const is = isData[i]
    const openingCash = runningCash

    // Operations
    const netIncome = is.netIncome
    const depreciation = is.depreciation
    // WC (simplified: DSO/DPO impact)
    const ar = is.revenueExVat * (store.ops.dso / 30)
    const prevAr = i > 0 ? isData[i-1].revenueExVat * (store.ops.dso / 30) : 0
    const changeInWC = -(ar - prevAr)
    const cashFromOps = netIncome + depreciation + changeInWC

    // Investing
    let capexOutflow = 0
    store.capexItems.forEach(item => {
      if (item.monthIndex === col.index) capexOutflow += item.amount * (sc.capexMultiplier ?? 1)
    })
    const cashFromInv = -capexOutflow

    // Financing
    let equityIn = 0
    let loanIn = 0
    let loanOut = 0
    store.investments.forEach(inv => {
      if (inv.monthIndex === col.index) {
        if (inv.type === 'Equity') equityIn += inv.amount
        if (inv.type === 'Loan') loanIn += inv.amount
        if (inv.type === 'Grant') equityIn += inv.amount
      }
      // Repayments
      if (inv.type === 'Loan' && col.index > inv.monthIndex && col.index <= inv.monthIndex + inv.termMonths) {
        loanOut += inv.amount / inv.termMonths
      }
    })
    const cashFromFin = equityIn + loanIn - loanOut

    const netCashChange = cashFromOps + cashFromInv + cashFromFin
    const closingCash = openingCash + netCashChange
    const freeCashFlow = cashFromOps + cashFromInv

    cf.push({
      openingCash, netIncome, depreciation, changeInWC, cashFromOps,
      capexOutflow, cashFromInv, equityIn, loanIn, loanOut, cashFromFin,
      netCashChange, closingCash, freeCashFlow
    })

    runningCash = closingCash
  })

  return cf
}
