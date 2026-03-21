import { 
  ModelStore, 
  IncomeStatementMonth, 
  BalanceSheetMonth, 
  CashFlowMonth,
  SalesItem,
  OpexItem,
  CapexItem,
  InvestmentItem
} from '@/types/model'
import { FinancialStore, FinancialResults, MonthlyValues } from '@/types/financial-store'
import { generateTimeline } from './time'

// --- Utility Functions ---

export function fmtGEL(val: number, showSymbol: boolean = true): string {
  if (!showSymbol) {
    return new Intl.NumberFormat('ka-GE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }
  return new Intl.NumberFormat('ka-GE', {
    style: 'currency',
    currency: 'GEL',
    maximumFractionDigits: 0,
  }).format(val)
}

export function fmtPct(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(val)
}

export function sumArr(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0)
}

// --- Statement Builders for existing pages (ModelStore) ---

export function buildIS(store: ModelStore, scenarioOverride?: 'base' | 'bull' | 'bear'): IncomeStatementMonth[] {
  const { config, salesItems, opexItems, capexItems, taxRates, investments, scenarios } = store
  const timeline = generateTimeline(config.startDate, config.modelLengthMonths)
  const activeScenario = scenarios[scenarioOverride || scenarios.active]

  return timeline.map((period, i) => {
    // 1. Revenue
    let revenue = 0
    let revenueExVat = 0
    salesItems.forEach(item => {
      const units = (item.monthlyUnits[i] || 0) * activeScenario.revenueMultiplier
      const amount = units * item.unitPrice
      revenue += amount
      if (item.vatIncluded) {
        revenueExVat += amount / (1 + taxRates.vatRate)
      } else {
        revenueExVat += amount
      }
    })

    // 2. COGS
    let cogs = 0
    store.cogsItems.forEach(item => {
      const salesItem = salesItems.find(s => s.id === item.salesItemId)
      if (salesItem) {
        const units = (salesItem.monthlyUnits[i] || 0) * activeScenario.revenueMultiplier
        cogs += units * item.unitCost * activeScenario.cogsMultiplier
      }
    })

    const grossProfit = revenueExVat - cogs
    const grossMargin = revenueExVat > 0 ? grossProfit / revenueExVat : 0

    // 3. OPEX
    let salaries = 0
    let otherOpex = 0
    const customValues: Record<string, number> = {}

    opexItems.forEach(item => {
      let amount = (item.monthlyAmount[i] || 0) * activeScenario.opexMultiplier
      if (item.inflationAdjusted) {
        const yearsPassed = Math.floor(i / 12)
        amount *= Math.pow(1 + store.ops.inflationRate / 100, yearsPassed)
      }

      if (item.isSalary) {
        salaries += amount
      } else if (item.customCategoryId) {
        customValues[item.customCategoryId] = (customValues[item.customCategoryId] || 0) + amount
      } else {
        otherOpex += amount
      }
    })

    const pension = salaries * taxRates.pensionRate
    const totalOpex = salaries + pension + otherOpex + Object.values(customValues).reduce((a, b) => a + b, 0)
    const ebitda = grossProfit - totalOpex
    const ebitdaMargin = revenueExVat > 0 ? ebitda / revenueExVat : 0

    // 4. Depreciation
    let depreciation = 0
    capexItems.forEach(item => {
      if (i >= item.monthIndex) {
        const monthsDepreciated = i - item.monthIndex
        if (monthsDepreciated < item.usefulLifeMonths) {
          depreciation += (item.amount - item.residualValue) / item.usefulLifeMonths
        }
      }
    })

    const ebit = ebitda - depreciation

    // 5. Interest
    let interestExpense = 0
    investments.forEach(inv => {
      if (inv.type === 'Loan' && i >= inv.monthIndex && i < inv.monthIndex + inv.termMonths) {
        interestExpense += (inv.amount * (inv.interestRate / 100)) / 12
      }
    })

    const ebt = ebit - interestExpense
    
    // 6. Tax (Estonian Model - simplified for IS)
    const corporateTax = 0 

    const netIncome = ebt - corporateTax
    const netMargin = revenueExVat > 0 ? netIncome / revenueExVat : 0

    return {
      ...period,
      revenue,
      revenueExVat,
      cogs,
      grossProfit,
      grossMargin,
      salaries,
      pension,
      otherOpex,
      totalOpex,
      ebitda,
      ebitdaMargin,
      depreciation,
      ebit,
      interestExpense,
      ebt,
      corporateTax,
      netIncome,
      netMargin,
      customValues
    }
  })
}

export function buildBS(store: ModelStore, isData?: IncomeStatementMonth[], cfData?: CashFlowMonth[], scenarioOverride?: 'base' | 'bull' | 'bear'): BalanceSheetMonth[] {
  const is = isData || buildIS(store, scenarioOverride)
  const { config, capexItems, investments, ops } = store
  const timeline = generateTimeline(config.startDate, config.modelLengthMonths)

  let cumulativeRetainedEarnings = 0

  return timeline.map((period, i) => {
    const monthIS = is[i]
    cumulativeRetainedEarnings += monthIS.netIncome

    const accountsReceivable = monthIS.revenue * (ops.dso / 30)
    
    let netPPE = 0
    capexItems.forEach(item => {
      if (i >= item.monthIndex) {
        const monthsDepreciated = Math.min(i - item.monthIndex + 1, item.usefulLifeMonths)
        const depPerMonth = (item.amount - item.residualValue) / item.usefulLifeMonths
        netPPE += Math.max(item.amount - (monthsDepreciated * depPerMonth), item.residualValue)
      }
    })

    const accountsPayable = monthIS.totalOpex * (ops.dpo / 30)
    
    let longTermDebt = 0
    let currentPaidInCapital = 0
    investments.forEach(inv => {
      if (inv.type === 'Loan' && i >= inv.monthIndex) {
        const monthsPassed = i - inv.monthIndex + 1
        const principalRepaid = (inv.amount / inv.termMonths) * Math.min(monthsPassed, inv.termMonths)
        longTermDebt += Math.max(inv.amount - principalRepaid, 0)
      } else if (inv.type === 'Equity' && i >= inv.monthIndex) {
        currentPaidInCapital += inv.amount
      }
    })

    const totalEquity = currentPaidInCapital + cumulativeRetainedEarnings
    const totalLiabilities = accountsPayable + longTermDebt
    const otherAssets = accountsReceivable + netPPE
    
    // Use cfData if available for cash, otherwise approximate
    const cash = cfData ? cfData[i].closingCash : Math.max(totalEquity + totalLiabilities - otherAssets, 0)

    const totalAssets = cash + accountsReceivable + netPPE
    const totalLiabilitiesEquity = totalLiabilities + totalEquity

    return {
      ...period,
      cash,
      accountsReceivable,
      inventory: 0,
      currentAssets: cash + accountsReceivable,
      netPPE,
      totalAssets,
      accountsPayable,
      currentLiabilities: accountsPayable,
      longTermDebt,
      totalLiabilities,
      paidInCapital: currentPaidInCapital,
      retainedEarnings: cumulativeRetainedEarnings,
      totalEquity,
      totalLiabilitiesEquity,
      check: totalAssets - totalLiabilitiesEquity
    }
  })
}

export function buildCF(store: ModelStore, isData?: IncomeStatementMonth[], scenarioOverride?: 'base' | 'bull' | 'bear'): CashFlowMonth[] {
  const is = isData || buildIS(store, scenarioOverride)
  const { config, capexItems, investments, ops } = store
  const timeline = generateTimeline(config.startDate, config.modelLengthMonths)

  let prevCash = 0
  let prevAR = 0
  let prevAP = 0

  return timeline.map((period, i) => {
    const monthIS = is[i]
    
    const accountsReceivable = monthIS.revenue * (ops.dso / 30)
    const accountsPayable = monthIS.totalOpex * (ops.dpo / 30)

    const changeInAR = accountsReceivable - prevAR
    const changeInAP = accountsPayable - prevAP
    const changeInWC = changeInAP - changeInAR

    const cashFromOps = monthIS.netIncome + monthIS.depreciation + changeInWC

    let capexOutflow = 0
    capexItems.forEach(item => {
      if (item.monthIndex === i) {
        capexOutflow += item.amount
      }
    })

    let equityIn = 0
    let loanIn = 0
    let loanOut = 0
    investments.forEach(inv => {
      if (inv.monthIndex === i) {
        if (inv.type === 'Equity') equityIn += inv.amount
        if (inv.type === 'Loan') loanIn += inv.amount
      }
      if (inv.type === 'Loan' && i >= inv.monthIndex && i < inv.monthIndex + inv.termMonths) {
        loanOut += inv.amount / inv.termMonths
      }
    })

    const cashFromFin = equityIn + loanIn - loanOut
    const netCashChange = cashFromOps - capexOutflow + cashFromFin
    const closingCash = prevCash + netCashChange

    const res = {
      ...period,
      openingCash: prevCash,
      netIncome: monthIS.netIncome,
      depreciation: monthIS.depreciation,
      changeInWC,
      cashFromOps,
      capexOutflow,
      cashFromInv: -capexOutflow,
      equityIn,
      loanIn,
      loanOut,
      cashFromFin,
      netCashChange,
      closingCash,
      freeCashFlow: cashFromOps - capexOutflow
    }

    prevCash = closingCash
    prevAR = accountsReceivable
    prevAP = accountsPayable
    return res
  })
}

/**
 * მთავარი ფუნქცია, რომელიც აწარმოებს 60-თვიან ფინანსურ მოდელირებას.
 * @param inputs - Zustand store-ის მიმდინარე მდგომარეობა (მხოლოდ inputs ნაწილი).
 * @returns გამოთვლილი P&L, Balance Sheet და Cash Flow.
 */
export function calculateModel(
  inputs: FinancialStore['inputs']
): FinancialResults {
  const MONTHS = 60;

  // --- ინიციალიზაცია ---
  const pnl = initializePnl(MONTHS);
  const balanceSheet = initializeBalanceSheet(MONTHS);
  const cashFlow = initializeCashFlow(MONTHS);

  // დამხმარე ცვლადები PPE-სთვის
  const accumulatedDepreciation: MonthlyValues = new Array(MONTHS).fill(0);
  const grossPPE: MonthlyValues = new Array(MONTHS).fill(0);

  // --- მთავარი ციკლი (60 თვე) ---
  for (let month = 0; month < MONTHS; month++) {
    // 1. P&L-ის გამოთვლა (Accrual Basis)

    // Revenue & COGS
    let monthlyRevenue = 0;
    let monthlyCogs = 0;

    for (const sale of inputs.sales) {
      const seasonalityFactor = sale.seasonality[month % 12] || 1;
      const units = sale.monthlyBaseUnits * Math.pow(1 + sale.growthRate, month) * seasonalityFactor;
      
      monthlyRevenue += units * sale.unitPrice;
      monthlyCogs += units * sale.unitCost;
    }

    pnl.revenue[month] = monthlyRevenue;
    pnl.cogs[month] = monthlyCogs;
    pnl.grossProfit[month] = monthlyRevenue - monthlyCogs;

    // Operating Expenses (OPEX)
    let monthlyOpex = 0;
    for (const opex of inputs.opex) {
      if (month >= opex.startDate && month <= opex.endDate) {
        if (opex.category === 'fixed') {
          monthlyOpex += opex.amount;
        } else {
          monthlyOpex += (opex.amount / 100) * monthlyRevenue;
        }
      }
    }
    pnl.operatingExpenses[month] = monthlyOpex;
    pnl.ebitda[month] = pnl.grossProfit[month] - monthlyOpex;

    // Depreciation (Straight-line)
    let monthlyDepreciation = 0;
    for (const capex of inputs.capex) {
      if (month > capex.purchaseMonth) {
        const monthsSinceStart = month - capex.purchaseMonth;
        if (monthsSinceStart <= capex.usefulLifeMonths) {
          monthlyDepreciation += capex.amount / capex.usefulLifeMonths;
        }
      }
    }
    pnl.depreciation[month] = monthlyDepreciation;
    pnl.ebit[month] = pnl.ebitda[month] - monthlyDepreciation;
    pnl.earningsBeforeTax[month] = pnl.ebit[month]; 

    // Georgian Tax System (Estonian Model)
    const dividend = inputs.dividends.find(d => d.month === month)?.amount || 0;
    const monthlyIncomeTax = (dividend / 0.85) * 0.15;
    
    pnl.incomeTax[month] = monthlyIncomeTax;
    pnl.netIncome[month] = pnl.earningsBeforeTax[month] - monthlyIncomeTax;

    // 2. Balance Sheet & Cash Flow
    const prevGrossPPE = month > 0 ? grossPPE[month - 1] : 0;
    const monthlyCapex = inputs.capex
      .filter(c => c.purchaseMonth === month)
      .reduce((sum, c) => sum + c.amount, 0);
    
    grossPPE[month] = prevGrossPPE + monthlyCapex;
    
    const prevAccDep = month > 0 ? accumulatedDepreciation[month - 1] : 0;
    accumulatedDepreciation[month] = prevAccDep + monthlyDepreciation;
    
    balanceSheet.propertyPlantEquipment[month] = grossPPE[month] - accumulatedDepreciation[month];

    balanceSheet.accountsReceivable[month] = (monthlyRevenue / 30) * inputs.global.accountsReceivableDays;
    balanceSheet.accountsPayable[month] = (monthlyCogs / 30) * inputs.global.accountsPayableDays;

    const prevAR = month > 0 ? balanceSheet.accountsReceivable[month - 1] : 0;
    const prevAP = month > 0 ? balanceSheet.accountsPayable[month - 1] : 0;
    
    const deltaAR = balanceSheet.accountsReceivable[month] - prevAR;
    const deltaAP = balanceSheet.accountsPayable[month] - prevAP;
    cashFlow.changeInWorkingCapital[month] = deltaAR - deltaAP;

    cashFlow.netIncome[month] = pnl.netIncome[month];
    cashFlow.depreciation[month] = pnl.depreciation[month];
    
    cashFlow.cashFromOperations[month] = 
      cashFlow.netIncome[month] + 
      cashFlow.depreciation[month] - 
      cashFlow.changeInWorkingCapital[month];

    cashFlow.capex[month] = -monthlyCapex;
    cashFlow.cashFromInvesting[month] = cashFlow.capex[month];

    cashFlow.dividendsPaid[month] = -dividend;
    cashFlow.incomeTaxPaid[month] = -monthlyIncomeTax;
    cashFlow.cashFromFinancing[month] = cashFlow.dividendsPaid[month] + cashFlow.incomeTaxPaid[month];

    cashFlow.netCashFlow[month] = 
      cashFlow.cashFromOperations[month] + 
      cashFlow.cashFromInvesting[month] + 
      cashFlow.cashFromFinancing[month];

    const beginningCash = month === 0 ? inputs.global.initialCash : cashFlow.endingCash[month - 1];
    cashFlow.beginningCash[month] = beginningCash;
    cashFlow.endingCash[month] = beginningCash + cashFlow.netCashFlow[month];

    balanceSheet.cash[month] = cashFlow.endingCash[month];

    balanceSheet.totalLiabilities[month] = balanceSheet.accountsPayable[month];
    balanceSheet.shareCapital[month] = month === 0 ? 0 : balanceSheet.shareCapital[month - 1]; 
    
    const prevRE = month === 0 ? 0 : balanceSheet.retainedEarnings[month - 1];
    balanceSheet.retainedEarnings[month] = prevRE + pnl.netIncome[month];
    balanceSheet.totalEquity[month] = balanceSheet.shareCapital[month] + balanceSheet.retainedEarnings[month];

    balanceSheet.totalAssets[month] = 
      balanceSheet.cash[month] + 
      balanceSheet.accountsReceivable[month] + 
      balanceSheet.propertyPlantEquipment[month];
    
    balanceSheet.totalLiabilitiesAndEquity[month] = 
      balanceSheet.totalLiabilities[month] + 
      balanceSheet.totalEquity[month];
  }

  return {
    pnl,
    balanceSheet,
    cashFlow,
  };
}

// --- დამხმარე ფუნქციები ინიციალიზაციისთვის ---

function initializePnl(months: number): FinancialResults['pnl'] {
  return {
    revenue: new Array(months).fill(0),
    cogs: new Array(months).fill(0),
    grossProfit: new Array(months).fill(0),
    operatingExpenses: new Array(months).fill(0),
    ebitda: new Array(months).fill(0),
    depreciation: new Array(months).fill(0),
    ebit: new Array(months).fill(0),
    earningsBeforeTax: new Array(months).fill(0),
    incomeTax: new Array(months).fill(0),
    netIncome: new Array(months).fill(0),
  };
}

function initializeBalanceSheet(months: number): FinancialResults['balanceSheet'] {
  return {
    cash: new Array(months).fill(0),
    accountsReceivable: new Array(months).fill(0),
    propertyPlantEquipment: new Array(months).fill(0),
    totalAssets: new Array(months).fill(0),
    accountsPayable: new Array(months).fill(0),
    totalLiabilities: new Array(months).fill(0),
    shareCapital: new Array(months).fill(0),
    retainedEarnings: new Array(months).fill(0),
    totalEquity: new Array(months).fill(0),
    totalLiabilitiesAndEquity: new Array(months).fill(0),
  };
}

function initializeCashFlow(months: number): FinancialResults['cashFlow'] {
  return {
    netIncome: new Array(months).fill(0),
    depreciation: new Array(months).fill(0),
    changeInWorkingCapital: new Array(months).fill(0),
    cashFromOperations: new Array(months).fill(0),
    capex: new Array(months).fill(0),
    cashFromInvesting: new Array(months).fill(0),
    dividendsPaid: new Array(months).fill(0),
    incomeTaxPaid: new Array(months).fill(0),
    cashFromFinancing: new Array(months).fill(0),
    netCashFlow: new Array(months).fill(0),
    beginningCash: new Array(months).fill(0),
    endingCash: new Array(months).fill(0),
  };
}
