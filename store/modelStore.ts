// store/modelStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  ModelStore, Config, TaxRates, Ops, SalesItem, CogsItem, OpexItem,
  CapexItem, InvestmentItem, CustomCategory, Scenario, DividendDeclaration
} from '@/types/model'
import { v4 as uuidv4 } from 'uuid'
import { buildIS, buildCF } from '@/lib/calculations'
import { generateTimeline } from '@/lib/time'

const initialConfig: Config = {
  modelName: 'My Financial Model',
  currency: 'GEL',
  startDate: new Date().toISOString().split('T')[0],
  modelLengthMonths: 60,
  territory: 'Georgia'
}

const initialTaxRates: TaxRates = {
  vatRate: 0.18,
  corporateTaxRate: 0.15,
  dividendTaxRate: 0.05,
  pensionRate: 0.04,
  personalIncomeTaxRate: 0.20
}

const initialOps: Ops = {
  inflationRate: 8,
  defaultLoanRate: 15,
  dso: 60,
  dpo: 30,
  fxRates: {
    usd: 2.7,
    eur: 2.9
  }
}

const initialScenarios = {
  active: 'base' as 'base' | 'bull' | 'bear',
  base: { revenueMultiplier: 1.0, cogsMultiplier: 1.0, opexMultiplier: 1.0, capexMultiplier: 1.0 },
  bull: { revenueMultiplier: 1.25, cogsMultiplier: 0.92, opexMultiplier: 0.95, capexMultiplier: 1.0 },
  bear: { revenueMultiplier: 0.75, cogsMultiplier: 1.15, opexMultiplier: 1.05, capexMultiplier: 1.0 },
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set, get) => ({
      config: initialConfig,
      taxRates: initialTaxRates,
      ops: initialOps,
      salesItems: [] as SalesItem[],
      cogsItems: [] as CogsItem[],
      opexItems: [] as OpexItem[],
      capexItems: [] as CapexItem[],
      investments: [] as InvestmentItem[],
      customCategories: [] as CustomCategory[],
      scenarios: initialScenarios,
      dividendDeclarations: [] as DividendDeclaration[],
      language: 'ka',
      selectedView: 'annual',

      setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
      setTaxRates: (taxRates) => set((state) => ({ taxRates: { ...state.taxRates, ...taxRates } })),
      setOps: (ops) => set((state) => ({ ops: { ...state.ops, ...ops } })),
      setLanguage: (lang) => set({ language: lang }),
      setSelectedView: (view) => set({ selectedView: view }),
      setActiveScenario: (scenario) => set((state) => ({ scenarios: { ...state.scenarios, active: scenario } })),
      
      getTimeline: () => {
        const state = get()
        return generateTimeline(state.config.startDate, state.config.modelLengthMonths)
      },
      getIS: (scenario) => {
        const state = get()
        return buildIS(state, scenario)
      },
      getCF: (scenario) => {
        const state = get()
        const isData = buildIS(state, scenario)
        return buildCF(state, isData, scenario)
      },
      updateScenario: (scenario, multipliers) => set((state) => ({
        scenarios: {
          ...state.scenarios,
          [scenario]: { ...state.scenarios[scenario], ...multipliers },
        },
      })),

      addSalesItem: (item) => set((state) => ({ salesItems: [...state.salesItems, { ...item, id: uuidv4() }] })),
      updateSalesItem: (id, item) => set((state) => ({
        salesItems: state.salesItems.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeSalesItem: (id) => set((state) => ({
        salesItems: state.salesItems.filter((i) => i.id !== id),
      })),

      addCogsItem: (item) => set((state) => ({ cogsItems: [...state.cogsItems, { ...item, id: uuidv4() }] })),
      updateCogsItem: (id, item) => set((state) => ({
        cogsItems: state.cogsItems.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeCogsItem: (id) => set((state) => ({
        cogsItems: state.cogsItems.filter((i) => i.id !== id),
      })),

      addOpexItem: (item) => set((state) => ({ opexItems: [...state.opexItems, { ...item, id: uuidv4() }] })),
      updateOpexItem: (id, item) => set((state) => ({
        opexItems: state.opexItems.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeOpexItem: (id) => set((state) => ({
        opexItems: state.opexItems.filter((i) => i.id !== id),
      })),

      addCapexItem: (item) => set((state) => ({ capexItems: [...state.capexItems, { ...item, id: uuidv4() }] })),
      updateCapexItem: (id, item) => set((state) => ({
        capexItems: state.capexItems.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeCapexItem: (id) => set((state) => ({
        capexItems: state.capexItems.filter((i) => i.id !== id),
      })),

      addInvestment: (item) => set((state) => ({ investments: [...state.investments, { ...item, id: uuidv4() }] })),
      updateInvestment: (id, item) => set((state) => ({
        investments: state.investments.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeInvestment: (id) => set((state) => ({
        investments: state.investments.filter((i) => i.id !== id),
      })),

      addCustomCategory: (item) => set((state) => ({ customCategories: [...state.customCategories, { ...item, id: uuidv4() }] })),
      updateCustomCategory: (id, item) => set((state) => ({
        customCategories: state.customCategories.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeCustomCategory: (id) => set((state) => ({
        customCategories: state.customCategories.filter((i) => i.id !== id),
      })),

      addDividendDeclaration: (item) => set((state) => ({ dividendDeclarations: [...state.dividendDeclarations, { ...item, id: uuidv4() }] })),
      updateDividendDeclaration: (id, item) => set((state) => ({
        dividendDeclarations: state.dividendDeclarations.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeDividendDeclaration: (id) => set((state) => ({
        dividendDeclarations: state.dividendDeclarations.filter((i) => i.id !== id),
      })),

      hydrate: (data) => set(data),
    }),
    {
      name: 'financial-model-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
        taxRates: state.taxRates,
        ops: state.ops,
        salesItems: state.salesItems,
        cogsItems: state.cogsItems,
        opexItems: state.opexItems,
        capexItems: state.capexItems,
        investments: state.investments,
        customCategories: state.customCategories,
        scenarios: state.scenarios,
        dividendDeclarations: state.dividendDeclarations,
      }),
    }
  )
)