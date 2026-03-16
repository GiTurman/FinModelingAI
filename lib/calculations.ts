// lib/calculations.ts
import { ModelStore, IncomeStatementMonth, CashFlowMonth, BalanceSheetMonth } from '@/types/model'
import { generateTimeline, TimePeriod } from './time'

export const sumArr = (arr: number[]): number => arr.reduce((a, b) => a + b, 0)
export const fmtPct = (v: number): string => `${(v * 100).toFixed(1)}%`

export const fmtGEL = (v: number, compact = false): string => {
  if (!compact) {
    const abs = Math.abs(v)
    const fmt = abs.toLocaleString('ka-GE', { maximumFractionDigits: 0 })
    return v < 0 ? `(${fmt} ₾)` : `${fmt} ₾`
  }
  const abs = Math.abs(v)
  const str = abs >= 1_000_000
    ? `${(abs / 1_000_000).toFixed(1)}M`
    : abs >= 1_000
    ? `${(abs / 1_000).toFixed(0)}K`
    : abs.toFixed(0)
  return v < 0 ? `(${str} ₾)` : `${str} ₾`
}

export function buildIS(store: ModelStore, scenarioType?: 'base' | 'bull' | 'bear'): IncomeStatementMonth[] {
  const timeline = generateTimeline(store.config.startDate, store.config.modelLengthMonths)
  const sc = store.scenarios[scenarioType || store.scenarios.active]

  return timeline.map((col) => {
    // ── Revenue ──────────────────────────────────────────
    let revenue = 0
    let revenueExVat = 0
    store.salesItems.forEach((item) => {
      const units = (item.monthlyUnits[col.index] ?? 0) * (sc.revenueMultiplier ?? 1)
      const rev = units * item.unitPrice
      revenue += rev
      revenueExVat += item.vatIncluded ? rev / (1 + store.taxRates.vatRate) : rev
    })

    // ── COGS ─────────────────────────────────────────────
    let cogs = 0
    store.salesItems.forEach((sItem) => {
      const units = (sItem.monthlyUnits[col.index] ?? 0) * (sc.revenueMultiplier ?? 1)
      const productCogsItems = store.cogsItems.filter(c => c.salesItemId === sItem.id)
      const unitCost = productCogsItems.reduce((sum, c) => sum + (c.unitCost ?? 0), 0)
      cogs += units * unitCost * (sc.cogsMultiplier ?? 1)
    })

    const grossProfit = revenueExVat - cogs
    const grossMargin = revenueExVat > 0 ? grossProfit / revenueExVat : 0

    // ── OPEX ─────────────────────────────────────────────
    // Uses isSalary field (not fragile name check)
    let salaries = 0
    let otherOpex = 0
    store.opexItems.forEach((item) => {
      let amt = (item.monthlyAmount[col.index] ?? 0) * (sc.opexMultiplier ?? 1)
      // Monthly compounding inflation: months elapsed / 12
      if (item.inflationAdjusted && store.ops.inflationRate > 0) {
        amt *= Math.pow(1 + store.ops.inflationRate / 100, col.index / 12)
      }
      if (item.isSalary) {
        salaries += amt
      } else {
        otherOpex += amt
      }
    })

    // Georgia pension: employer pays 2% only (not full 4%)
    // Employee's 2% is deducted from gross salary, not an additional employer cost
    const employerPensionRate = store.taxRates.pensionRate / 2  // 0.04 / 2 = 0.02
    const pension = salaries * employerPensionRate

    const totalOpex = salaries + pension + otherOpex
    const ebitda = grossProfit - totalOpex
    const ebitdaMargin = revenueExVat > 0 ? ebitda / revenueExVat : 0

    // ── Custom Values ─────────────────────────────────────
    const customValues: Record<string, number> = {}
    store.opexItems.forEach(item => {
      if (item.customCategoryId) {
        let amt = (item.monthlyAmount[col.index] ?? 0) * (sc.opexMultiplier ?? 1)
        if (item.inflationAdjusted && store.ops.inflationRate > 0) {
          amt *= Math.pow(1 + store.ops.inflationRate / 100, col.index / 12)
        }
        customValues[item.customCategoryId] = (customValues[item.customCategoryId] || 0) + amt
      }
    })

    // ── Depreciation ──────────────────────────────────────
    let depreciation = 0
    store.capexItems.forEach((item) => {
      const depreciable = item.amount * (sc.capexMultiplier ?? 1) - (item.residualValue ?? 0)
      const monthly = depreciable / Math.max(item.usefulLifeMonths, 1)
      if (col.index >= item.monthIndex && col.index < item.monthIndex + item.usefulLifeMonths) {
        depreciation += monthly
      }
    })

    const ebit = ebitda - depreciation

    // ── Interest — ANNUITY amortization schedule ──────────
    let interestExpense = 0
    store.investments.forEach((inv) => {
      if (inv.type !== 'Loan') return
      if (col.index <= inv.monthIndex) return
      if (col.index > inv.monthIndex + inv.termMonths) return

      const r = inv.interestRate / 100 / 12
      const n = inv.termMonths
      const mElapsed = col.index - inv.monthIndex  // months since drawdown

      if (r === 0) {
        // Zero-interest loan: equal principal, no interest
        return
      }
      // Outstanding balance at start of this month (before payment)
      const balance = inv.amount
        * (Math.pow(1 + r, n) - Math.pow(1 + r, mElapsed - 1))
        / (Math.pow(1 + r, n) - 1)
      interestExpense += balance * r
    })

    const ebt = ebit - interestExpense

    // ── Georgian CIT (Estonian Model) ────────────────────
    // CIT is NOT applied monthly on retained earnings.
    // CIT triggers ONLY when dividends are declared.
    // Monthly IS shows zero CIT — tax cost appears in the year dividends are paid.
    // This is the correct treatment per Georgian Tax Code Art. 97.
    const corporateTax = 0  // See DividendDeclaration for actual CIT timing
    const netIncome = ebt  // Pre-tax = post-tax for undistributed profits

    return {
      ...col,
      revenue, revenueExVat, cogs, grossProfit, grossMargin,
      salaries, pension, otherOpex, totalOpex,
      ebitda, ebitdaMargin,
      depreciation, ebit, interestExpense, ebt,
      corporateTax, netIncome,
      netMargin: revenueExVat > 0 ? netIncome / revenueExVat : 0,
      customValues
    }
  })
}

export function buildCF(
  store: ModelStore,
  isData: IncomeStatementMonth[],
  scenarioType?: 'base' | 'bull' | 'bear'
): CashFlowMonth[] {
  const timeline = generateTimeline(store.config.startDate, store.config.modelLengthMonths)
  const sc = store.scenarios[scenarioType || store.scenarios.active]
  const cf: CashFlowMonth[] = []
  let runningCash = 0

  timeline.forEach((col, i) => {
    const is = isData[i]
    const openingCash = runningCash

    // ── Operating CF ──────────────────────────────────────
    const netIncome = is.netIncome
    const depreciation = is.depreciation

    // AR based on DSO (days / 30 = months of revenue outstanding)
    const ar = is.revenueExVat * (store.ops.dso / 30)
    const prevAr = i > 0 ? (isData[i - 1].revenueExVat * (store.ops.dso / 30)) : 0
    const deltaAR = -(ar - prevAr)  // increase in AR = cash outflow (negative)

    // AP based on DPO (delay in paying suppliers)
    const totalCogs = is.cogs + is.totalOpex
    const ap = totalCogs * (store.ops.dpo / 30)
    const prevAp = i > 0 ? ((isData[i - 1].cogs + isData[i - 1].totalOpex) * (store.ops.dpo / 30)) : 0
    const deltaAP = ap - prevAp   // increase in AP = cash inflow (positive)

    const changeInWC = deltaAR + deltaAP
    const cashFromOps = netIncome + depreciation + changeInWC

    // ── Investing CF ─────────────────────────────────────
    let capexOutflow = 0
    store.capexItems.forEach(item => {
      if (item.monthIndex === col.index) {
        capexOutflow += item.amount * (sc.capexMultiplier ?? 1)
      }
    })
    const cashFromInv = -capexOutflow

    // ── Financing CF ─────────────────────────────────────
    let equityIn = 0
    let loanIn = 0
    let loanOut = 0  // principal repayment only (interest is in IS/operating)

    store.investments.forEach(inv => {
      // Inflows on drawdown month
      if (inv.monthIndex === col.index) {
        if (inv.type === 'Equity' || inv.type === 'Grant') equityIn += inv.amount
        if (inv.type === 'Loan') loanIn += inv.amount
      }

      // Annuity principal repayments for active loans
      if (inv.type === 'Loan' && col.index > inv.monthIndex
          && col.index <= inv.monthIndex + inv.termMonths) {
        const r = inv.interestRate / 100 / 12
        const n = inv.termMonths
        const mElapsed = col.index - inv.monthIndex

        if (r === 0) {
          loanOut += inv.amount / n  // Zero-interest: equal principal
          return
        }
        const balance = inv.amount
          * (Math.pow(1 + r, n) - Math.pow(1 + r, mElapsed - 1))
          / (Math.pow(1 + r, n) - 1)
        const interest = balance * r
        const pmt = inv.amount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
        loanOut += pmt - interest  // Principal portion of annuity payment
      }
    })

    // CIT on dividends declared this month
    let citOnDistribution = 0
    let dividendWithholding = 0
    if (store.dividendDeclarations) {
      store.dividendDeclarations.forEach(decl => {
        // Convert model year to month range
        const declMonthStart = (decl.year - 1) * 12
        // Pay CIT in the first month of the declaration year
        if (col.index === declMonthStart) {
          citOnDistribution = decl.amount * store.taxRates.corporateTaxRate
          dividendWithholding = (decl.amount - citOnDistribution) * store.taxRates.dividendTaxRate
        }
      })
    }

    const cashFromFin = equityIn + loanIn - loanOut - citOnDistribution - dividendWithholding
    const netCashChange = cashFromOps + cashFromInv + cashFromFin
    const closingCash = openingCash + netCashChange
    const freeCashFlow = cashFromOps - capexOutflow

    cf.push({
      ...col,
      openingCash, netIncome, depreciation, changeInWC, cashFromOps,
      capexOutflow, cashFromInv,
      equityIn, loanIn, loanOut, cashFromFin,
      netCashChange, closingCash, freeCashFlow,
    })

    runningCash = closingCash
  })

  return cf
}

export function buildBS(
  store: ModelStore,
  isData: IncomeStatementMonth[],
  cfData: CashFlowMonth[],
  scenarioType?: 'base' | 'bull' | 'bear'
): BalanceSheetMonth[] {
  const timeline = generateTimeline(store.config.startDate, store.config.modelLengthMonths)
  const sc = store.scenarios[scenarioType || store.scenarios.active]
  let cumulativeRetainedEarnings = 0
  let totalPaidInCapital = 0

  return timeline.map((col, i) => {
    const is = isData[i]
    const cf = cfData[i]

    // Assets
    const cash = cf.closingCash
    const accountsReceivable = is.revenueExVat * (store.ops.dso / 30)
    const inventory = 0 // Placeholder
    const currentAssets = cash + accountsReceivable + inventory

    let netPPE = 0
    store.capexItems.forEach(item => {
      const itemCost = item.amount * (sc.capexMultiplier ?? 1)
      if (i >= item.monthIndex) {
        const monthsDepreciated = Math.min(i - item.monthIndex + 1, item.usefulLifeMonths)
        const depreciable = itemCost - (item.residualValue ?? 0)
        const monthlyDep = depreciable / Math.max(item.usefulLifeMonths, 1)
        const accumulatedDepreciation = monthlyDep * monthsDepreciated
        netPPE += Math.max(0, itemCost - accumulatedDepreciation)
      }
    })

    const totalAssets = currentAssets + netPPE

    // Liabilities
    const accountsPayable = (is.cogs + is.totalOpex) * (store.ops.dpo / 30)
    const currentLiabilities = accountsPayable // Plus current portion of LTD

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
    totalPaidInCapital += cf.equityIn
    cumulativeRetainedEarnings += is.netIncome

    // Dividends reduce retained earnings
    if (store.dividendDeclarations) {
      store.dividendDeclarations.forEach(decl => {
        const declMonthStart = (decl.year - 1) * 12
        if (i === declMonthStart) {
          // Full declared amount reduces RE. The cash outflow is handled in CF.
          cumulativeRetainedEarnings -= decl.amount
        }
      })
    }

    const retainedEarnings = cumulativeRetainedEarnings
    const totalEquity = totalPaidInCapital + retainedEarnings
    const totalLiabilitiesEquity = totalLiabilities + totalEquity
    const check = totalAssets - totalLiabilitiesEquity

    return {
      ...col,
      cash, accountsReceivable, inventory, currentAssets, netPPE, totalAssets,
      accountsPayable, currentLiabilities, longTermDebt, totalLiabilities,
      paidInCapital: totalPaidInCapital, retainedEarnings, totalEquity,
      totalLiabilitiesEquity, check
    }
  })
}