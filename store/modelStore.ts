// store/modelStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  ModelStore, Config, TaxRates, Ops, SalesItem, CogsItem, OpexItem,
  CapexItem, InvestmentItem, CustomCategory, Scenario
} from '@/types/model'

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      config: {
        modelName: 'Financial Model',
        startDate: '2026-03-15',
        modelLengthMonths: 60,
        currency: 'GEL',
        territory: 'Tbilisi, Georgia',
      },
      taxRates: {
        vatRate: 0.18,
        corporateTaxRate: 0.15,
        dividendTaxRate: 0.05,
        pensionRate: 0.04,
        personalIncomeTaxRate: 0.20,
      },
      ops: {
        dso: 60,
        dpo: 30,
        inflationRate: 8,
        defaultLoanRate: 15,
        fxRates: { usd: 2.7, eur: 2.9 },
      },
      salesItems: [],
      cogsItems: [],
      opexItems: [],
      capexItems: [],
      investments: [],
      dividendDeclarations: [],
      scenarios: {
        active: 'base',
        base: { revenueMultiplier: 1.0, cogsMultiplier: 1.0,  opexMultiplier: 1.0,  capexMultiplier: 1.0 },
        bull: { revenueMultiplier: 1.25, cogsMultiplier: 0.92, opexMultiplier: 0.95, capexMultiplier: 1.0 },
        bear: { revenueMultiplier: 0.75, cogsMultiplier: 1.15, opexMultiplier: 1.05, capexMultiplier: 1.0 },
      },
      customCategories: [],
      language: 'ka',
      selectedView: 'annual',

      setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
      setTaxRates: (taxRates) => set((state) => ({ taxRates: { ...state.taxRates, ...taxRates } })),
      setOps: (ops) => set((state) => ({ ops: { ...state.ops, ...ops } })),
      setActiveScenario: (scenario) => set((state) => ({ scenarios: { ...state.scenarios, active: scenario } })),
      setScenarioMultipliers: (scenario, multipliers) => set((state) => ({
        scenarios: {
          ...state.scenarios,
          [scenario]: { ...state.scenarios[scenario], ...multipliers },
        },
      })),

      addSalesItem: (item) => set((state) => ({ salesItems: [...state.salesItems, { ...item, id: Math.random().toString(36).substr(2, 9) }] })),
      updateSalesItem: (id, item) => set((state) => ({
        salesItems: state.salesItems.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeSalesItem: (id) => set((state) => ({
        salesItems: state.salesItems.filter((i) => i.id !== id),
      })),

      addCogsItem: (item) => set((state) => ({ cogsItems: [...state.cogsItems, { ...item, id: Math.random().toString(36).substr(2, 9) }] })),
      updateCogsItem: (id, item) => set((state) => ({
        cogsItems: state.cogsItems.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeCogsItem: (id) => set((state) => ({
        cogsItems: state.cogsItems.filter((i) => i.id !== id),
      })),

      addOpexItem: (item) => set((state) => ({ opexItems: [...state.opexItems, { ...item, id: Math.random().toString(36).substr(2, 9) }] })),
      updateOpexItem: (id, item) => set((state) => ({
        opexItems: state.opexItems.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeOpexItem: (id) => set((state) => ({
        opexItems: state.opexItems.filter((i) => i.id !== id),
      })),

      addCapexItem: (item) => set((state) => ({ capexItems: [...state.capexItems, { ...item, id: Math.random().toString(36).substr(2, 9) }] })),
      updateCapexItem: (id, item) => set((state) => ({
        capexItems: state.capexItems.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeCapexItem: (id) => set((state) => ({
        capexItems: state.capexItems.filter((i) => i.id !== id),
      })),

      addInvestment: (item) => set((state) => ({ investments: [...state.investments, { ...item, id: Math.random().toString(36).substr(2, 9) }] })),
      updateInvestment: (id, item) => set((state) => ({
        investments: state.investments.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeInvestment: (id) => set((state) => ({
        investments: state.investments.filter((i) => i.id !== id)
      })),

      addDividendDeclaration: (item) => set((state) => ({
        dividendDeclarations: [
          ...state.dividendDeclarations,
          { ...item, id: Math.random().toString(36).substr(2, 9) }
        ]
      })),
      removeDividendDeclaration: (id) => set((state) => ({
        dividendDeclarations: state.dividendDeclarations.filter((i) => i.id !== id)
      })),
      updateDividendDeclaration: (id, item) => set((state) => ({
        dividendDeclarations: state.dividendDeclarations.map((i) => (i.id === id ? { ...i, ...item } : i))
      })),

      addCustomCategory: (item) => set((state) => ({ customCategories: [...state.customCategories, { ...item, id: Math.random().toString(36).substr(2, 9) }] })),
      updateCustomCategory: (id, item) => set((state) => ({
        customCategories: state.customCategories.map((i) => (i.id === id ? { ...i, ...item } : i)),
      })),
      removeCustomCategory: (id) => set((state) => ({
        customCategories: state.customCategories.filter((i) => i.id !== id),
      })),

      setLanguage: (language) => set({ language }),
      setSelectedView: (selectedView) => set({ selectedView }),

      hydrate: (data) => set(data),
    }),
    {
      name: 'financial-model-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)