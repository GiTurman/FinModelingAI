// types/model.ts

export interface MonthColumn {
  index: number
  label: string
  year: number
  month: number
  yearLabel: string
  monthLabel: string
}

export interface ModelConfig {
  startDate: string
  modelLengthMonths: number
  currency: string
  territory: string
}

export interface TaxRates {
  vatRate: number
  corporateTaxRate: number
  personalIncomeTaxRate: number
  pensionRate: number
  dividendTaxRate: number
}

export interface OperationalSettings {
  dso: number
  dpo: number
  inflationRate: number
  defaultLoanRate: number
  fxRates: { [key: string]: number }
}

export interface SalesItem {
  id: string
  name: string
  unitPrice: number
  monthlyUnits: number[]
  vatIncluded: boolean
}

export interface OpexItem {
  id: string
  name: string
  category: 'S&M' | 'G&A' | 'R&D' | 'Operations' | 'Other'
  monthlyAmount: number[]
  inflationAdjusted: boolean
}

export interface CapexItem {
  id: string
  name: string
  amount: number
  monthIndex: number
  usefulLifeMonths: number
}

export interface InvestmentItem {
  id: string
  name: string
  type: 'Equity' | 'Loan' | 'Grant'
  amount: number
  monthIndex: number
  interestRate: number
  termMonths: number
}

export interface CogsItem {
  id: string
  salesItemId: string
  name: string
  unitCost: number
}

export interface ScenarioConfig {
  revenueMultiplier: number
  cogsMultiplier: number
  opexMultiplier: number
  capexMultiplier: number
}

export interface IncomeStatementMonth {
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
}

export interface CashFlowMonth {
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

export interface ModelStore {
  config: ModelConfig
  taxRates: TaxRates
  ops: OperationalSettings
  salesItems: SalesItem[]
  cogsItems: CogsItem[]
  opexItems: OpexItem[]
  capexItems: CapexItem[]
  investments: InvestmentItem[]
  scenarios: {
    active: 'base' | 'bull' | 'bear'
    base: ScenarioConfig
    bull: ScenarioConfig
    bear: ScenarioConfig
  }
  language: 'ka' | 'en' | 'ru'
  selectedView: 'monthly' | 'quarterly' | 'annual'

  // Actions
  setConfig: (config: Partial<ModelConfig>) => void
  setTaxRates: (rates: Partial<TaxRates>) => void
  setOps: (ops: Partial<OperationalSettings>) => void
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
  setActiveScenario: (type: 'base' | 'bull' | 'bear') => void
  updateScenario: (type: 'base' | 'bull' | 'bear', config: Partial<ScenarioConfig>) => void
  setLanguage: (lang: 'ka' | 'en' | 'ru') => void
  setView: (view: 'monthly' | 'quarterly' | 'annual') => void

  // Computed
  getTimeline: () => MonthColumn[]
  getIS: (scenarioType?: 'base' | 'bull' | 'bear') => IncomeStatementMonth[]
  getCF: (scenarioType?: 'base' | 'bull' | 'bear') => CashFlowMonth[]
}
