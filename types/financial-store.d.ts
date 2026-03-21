/**
 * გლობალური პარამეტრები, რომლებიც გავლენას ახდენს მთლიან მოდელზე.
 */
export interface GlobalInputs {
  modelName: string;
  currency: 'GEL' | 'USD' | 'EUR';
  initialCash: number; // საწყისი ფულადი ნაშთი (თვის 0-ისთვის)
  accountsReceivableDays: number; // დებიტორული დავალიანების ბრუნვადობა დღეებში
  accountsPayableDays: number; // კრედიტორული დავალიანების ბრუნვადობა დღეებში
}

/**
 * შემოსავლების მოდელირების ერთეული.
 */
export interface SalesInput {
  id: string;
  productName: string;
  unitPrice: number; // ერთეულის გასაყიდი ფასი
  unitCost: number; // ერთეულის თვითღირებულება (COGS)
  monthlyBaseUnits: number; // გაყიდვების საბაზისო რაოდენობა თვეში
  growthRate: number; // ყოველთვიური ზრდის ტემპი (მაგ: 0.05 = 5%)
  seasonality: number[]; // 12-თვიანი სეზონურობის კოეფიციენტები (მაგ: [1.0, 1.0, 1.2, ...])
}

/**
 * საოპერაციო ხარჯების (OPEX) ერთეული.
 */
export interface OpexInput {
  id: string;
  name: string;
  category: 'fixed' | 'variable'; // 'fixed' - ფიქსირებული, 'variable' - ცვლადი (% შემოსავლიდან)
  amount: number; // ფიქსირებულისთვის - თვიური თანხა, ცვლადისთვის - %
  startDate: number; // თვის ინდექსი (0-59)
  endDate: number; // თვის ინდექსი (0-59)
}

/**
 * კაპიტალური დანახარჯების (CAPEX) ერთეული.
 */
export interface CapexInput {
  id: string;
  assetName: string;
  amount: number; // აქტივის ღირებულება
  purchaseMonth: number; // შესყიდვის თვის ინდექსი (0-59)
  usefulLifeMonths: number; // ცვეთის პერიოდი თვეებში (სწორხაზოვანი მეთოდი)
}

/**
 * დივიდენდების განაწილების გრაფიკი.
 */
export interface DividendPayout {
    month: number; // თვის ინდექსი (0-59)
    amount: number; // გასანაწილებელი დივიდენდის თანხა
}

// --- გამოთვლილი შედეგების სტრუქტურა ---

/**
 * ყოველთვიური მონაცემების მასივი (60 თვე).
 */
export type MonthlyValues = number[];

export interface ProfitAndLoss {
  revenue: MonthlyValues;
  cogs: MonthlyValues;
  grossProfit: MonthlyValues;
  operatingExpenses: MonthlyValues;
  ebitda: MonthlyValues;
  depreciation: MonthlyValues;
  ebit: MonthlyValues;
  earningsBeforeTax: MonthlyValues;
  incomeTax: MonthlyValues; // მხოლოდ დივიდენდზე დარიცხული
  netIncome: MonthlyValues;
}

export interface BalanceSheet {
  cash: MonthlyValues;
  accountsReceivable: MonthlyValues;
  propertyPlantEquipment: MonthlyValues; // Net of accumulated depreciation
  totalAssets: MonthlyValues;
  accountsPayable: MonthlyValues;
  totalLiabilities: MonthlyValues;
  shareCapital: MonthlyValues;
  retainedEarnings: MonthlyValues;
  totalEquity: MonthlyValues;
  totalLiabilitiesAndEquity: MonthlyValues; // საკონტროლო ჯამი
}

export interface CashFlowStatement {
  netIncome: MonthlyValues;
  depreciation: MonthlyValues;
  changeInWorkingCapital: MonthlyValues;
  cashFromOperations: MonthlyValues;
  capex: MonthlyValues;
  cashFromInvesting: MonthlyValues;
  dividendsPaid: MonthlyValues;
  incomeTaxPaid: MonthlyValues; // ფულადი გადახდა
  cashFromFinancing: MonthlyValues;
  netCashFlow: MonthlyValues;
  beginningCash: MonthlyValues;
  endingCash: MonthlyValues;
}

export interface FinancialResults {
  pnl: ProfitAndLoss;
  balanceSheet: BalanceSheet;
  cashFlow: CashFlowStatement;
}

/**
 * Zustand Store-ის მთავარი ინტერფეისი.
 */
export interface FinancialStore {
  inputs: {
    global: GlobalInputs;
    sales: SalesInput[];
    opex: OpexInput[];
    capex: CapexInput[];
    dividends: DividendPayout[];
  };
  results: FinancialResults;
  actions: {
    recalculateModel: () => void;
    setGlobalInput: (key: keyof GlobalInputs, value: any) => void;
    addSalesItem: (item: SalesInput) => void;
    addOpexItem: (item: OpexInput) => void;
    addCapexItem: (item: CapexInput) => void;
    addDividend: (item: DividendPayout) => void;
  };
}
