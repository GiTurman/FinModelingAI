// types/model.ts
import { TimePeriod } from '@/lib/time'

export interface Config {
  modelName: string
  currency: string
  startDate: string // YYYY-MM-DD
  modelLengthMonths: number
  territory: string
}

export interface TaxRates {
  vatRate: number
  corporateTaxRate: number
  dividendTaxRate: number
  pensionRate: number
  personalIncomeTaxRate: number
}

export interface Ops {
  inflationRate: number
  defaultLoanRate: number
  dso: number // Days Sales Outstanding
  dpo: number // Days Payable Outstanding
  fxRates: {
    usd: number
    eur: number
  }
}

export interface SalesItem {
  id: string
  name: string
  category: string
  unitPrice: number
  vatIncluded: boolean
  monthlyUnits: number[]
}

export interface CogsItem {
  id:string
  name: string
  salesItemId: string
  unitCost: number
}

export interface OpexItem {
  id: string
  name: string
  category: 'G&A' | 'S&M' | 'R&D'
  customCategoryId?: string
  monthlyAmount: number[]
  inflationAdjusted: boolean
  isSalary: boolean // ADDED
}

export interface CapexItem {
  id: string
  name: string
  amount: number
  monthIndex: number
  usefulLifeMonths: number
  residualValue: number // ADDED
}

export interface InvestmentItem {
  id: string
  name: string
  type: 'Equity' | 'Loan' | 'Grant'
  amount: number
  monthIndex: number // VERIFIED
  interestRate: number // VERIFIED
  termMonths: number // VERIFIED
}

export interface CustomCategory {
  id: string
  name: string
  statement: 'IS' | 'BS' | 'CF'
  section: string
}

export interface Scenario {
  revenueMultiplier: number
  cogsMultiplier: number
  opexMultiplier: number
  capexMultiplier: number
}

// ADDED
export interface DividendDeclaration {
  id: string
  year: number          // 1-5 (model year)
  amount: number        // GEL amount declared
  description: string
}

export interface ModelStore {
  config: Config
  taxRates: TaxRates
  ops: Ops
  salesItems: SalesItem[]
  cogsItems: CogsItem[]
  opexItems: OpexItem[]
  capexItems: CapexItem[]
  investments: InvestmentItem[]
  customCategories: CustomCategory[]
  scenarios: {
    active: 'base' | 'bull' | 'bear'
    base: Scenario
    bull: Scenario
    bear: Scenario
  }
  dividendDeclarations: DividendDeclaration[] // ADDED
  language: 'en' | 'ka'
  setLanguage: (lang: 'en' | 'ka') => void
  selectedView: 'monthly' | 'quarterly' | 'annual'
  setSelectedView: (view: 'monthly' | 'quarterly' | 'annual') => void

  // Helper getters
  getTimeline: () => TimePeriod[]
  getIS: (scenario?: 'base' | 'bull' | 'bear') => IncomeStatementMonth[]
  getCF: (scenario?: 'base' | 'bull' | 'bear') => CashFlowMonth[]

  // Actions
  setConfig: (config: Partial<Config>) => void
  setTaxRates: (taxRates: Partial<TaxRates>) => void
  setOps: (ops: Partial<Ops>) => void
  setActiveScenario: (scenario: 'base' | 'bull' | 'bear') => void
  updateScenario: (scenario: 'base' | 'bull' | 'bear', multipliers: Partial<Scenario>) => void

  addSalesItem: (item: Omit<SalesItem, 'id'>) => void
  updateSalesItem: (id: string, item: Partial<SalesItem>) => void
  removeSalesItem: (id: string) => void

  addCogsItem: (item: Omit<CogsItem, 'id'>) => void
  updateCogsItem: (id: string, item: Partial<CogsItem>) => void
  removeCogsItem: (id: string) => void

  addOpexItem: (item: Omit<OpexItem, 'id'>) => void
  updateOpexItem: (id: string, item: Partial<OpexItem>) => void
  removeOpexItem: (id: string) => void

  addCapexItem: (item: Omit<CapexItem, 'id'>) => void
  updateCapexItem: (id: string, item: Partial<CapexItem>) => void
  removeCapexItem: (id: string) => void

  addInvestment: (item: Omit<InvestmentItem, 'id'>) => void
  updateInvestment: (id: string, item: Partial<InvestmentItem>) => void
  removeInvestment: (id: string) => void

  addCustomCategory: (item: Omit<CustomCategory, 'id'>) => void
  updateCustomCategory: (id: string, item: Partial<CustomCategory>) => void
  removeCustomCategory: (id: string) => void

  addDividendDeclaration: (item: Omit<DividendDeclaration, 'id'>) => void
  updateDividendDeclaration: (id: string, item: Partial<DividendDeclaration>) => void
  removeDividendDeclaration: (id: string) => void

  hydrate: (data: Partial<ModelStore>) => void
}

// Financial Statement Interfaces
export interface IncomeStatementMonth extends TimePeriod {
  revenue: number
  revenueExVat: number
  cogs: number
  grossProfit: number
  grossMargin: number
  salaries: number
  pension: number
  otherOpex: number
  totalOpex: number
  ebitda: number
  ebitdaMargin: number
  depreciation: number
  ebit: number
  interestExpense: number
  ebt: number
  corporateTax: number
  netIncome: number
  netMargin: number
  customValues: Record<string, number>
}

export interface CashFlowMonth extends TimePeriod {
  openingCash: number
  netIncome: number
  depreciation: number
  changeInWC: number
  cashFromOps: number
  capexOutflow: number
  cashFromInv: number
  equityIn: number
  loanIn: number
  loanOut: number
  cashFromFin: number
  netCashChange: number
  closingCash: number
  freeCashFlow: number
}

export interface BalanceSheetMonth extends TimePeriod {
  cash: number
  accountsReceivable: number
  inventory: number // Placeholder
  currentAssets: number
  netPPE: number
  totalAssets: number
  accountsPayable: number
  currentLiabilities: number
  longTermDebt: number
  totalLiabilities: number
  paidInCapital: number
  retainedEarnings: number
  totalEquity: number
  totalLiabilitiesEquity: number
  check: number
}

export type MonthColumn = TimePeriod
