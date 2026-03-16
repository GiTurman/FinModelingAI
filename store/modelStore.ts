// store/modelStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ModelStore, SalesItem, CogsItem, OpexItem, CapexItem, InvestmentItem, ScenarioConfig } from '@/types/model'
import { generateTimeline, buildIS, buildCF } from '@/lib/calculations'

export const useModelStore = create<ModelStore>()(
  persist(
    (set, get) => ({
      config: {
        startDate: '2025-01-01',
        modelLengthMonths: 60,
        currency: 'GEL',
        territory: 'Georgia',
      },
      taxRates: {
        vatRate: 0.18,
        corporateTaxRate: 0.15,
        personalIncomeTaxRate: 0.20,
        pensionRate: 0.04,
        dividendTaxRate: 0.05,
      },
      ops: {
        dso: 30,
        dpo: 30,
        inflationRate: 3.5,
        defaultLoanRate: 12,
        fxRates: { usd: 2.7, eur: 2.9 },
      },
      salesItems: [],
      cogsItems: [],
      opexItems: [],
      capexItems: [],
      investments: [],
      scenarios: {
        active: 'base',
        base: { revenueMultiplier: 1, cogsMultiplier: 1, opexMultiplier: 1, capexMultiplier: 1 },
        bull: { revenueMultiplier: 1.2, cogsMultiplier: 1.1, opexMultiplier: 0.9, capexMultiplier: 1 },
        bear: { revenueMultiplier: 0.7, cogsMultiplier: 0.8, opexMultiplier: 1.1, capexMultiplier: 1.2 },
      },
      language: 'ka',
      selectedView: 'monthly',

      // Actions
      setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
      setTaxRates: (rates) => set((state) => ({ taxRates: { ...state.taxRates, ...rates } })),
      setOps: (ops) => set((state) => ({ ops: { ...state.ops, ...ops } })),

      addSalesItem: (item) => set((state) => ({
        salesItems: [...state.salesItems, { ...item, id: Math.random().toString(36).substr(2, 9) }]
      })),
      updateSalesItem: (id, item) => set((state) => ({
        salesItems: state.salesItems.map((i) => (i.id === id ? { ...i, ...item } : i))
      })),
      removeSalesItem: (id) => set((state) => ({
        salesItems: state.salesItems.filter((i) => i.id !== id)
      })),

      addCogsItem: (item) => set((state) => ({
        cogsItems: [...state.cogsItems, { ...item, id: Math.random().toString(36).substr(2, 9) }]
      })),
      updateCogsItem: (id, item) => set((state) => ({
        cogsItems: state.cogsItems.map((i) => (i.id === id ? { ...i, ...item } : i))
      })),
      removeCogsItem: (id) => set((state) => ({
        cogsItems: state.cogsItems.filter((i) => i.id !== id)
      })),

      addOpexItem: (item) => set((state) => ({
        opexItems: [...state.opexItems, { ...item, id: Math.random().toString(36).substr(2, 9) }]
      })),
      updateOpexItem: (id, item) => set((state) => ({
        opexItems: state.opexItems.map((i) => (i.id === id ? { ...i, ...item } : i))
      })),
      removeOpexItem: (id) => set((state) => ({
        opexItems: state.opexItems.filter((i) => i.id !== id)
      })),

      addCapexItem: (item) => set((state) => ({
        capexItems: [...state.capexItems, { ...item, id: Math.random().toString(36).substr(2, 9) }]
      })),
      updateCapexItem: (id, item) => set((state) => ({
        capexItems: state.capexItems.map((i) => (i.id === id ? { ...i, ...item } : i))
      })),
      removeCapexItem: (id) => set((state) => ({
        capexItems: state.capexItems.filter((i) => i.id !== id)
      })),

      addInvestment: (item) => set((state) => ({
        investments: [...state.investments, { ...item, id: Math.random().toString(36).substr(2, 9) }]
      })),
      updateInvestment: (id, item) => set((state) => ({
        investments: state.investments.map((i) => (i.id === id ? { ...i, ...item } : i))
      })),
      removeInvestment: (id) => set((state) => ({
        investments: state.investments.filter((i) => i.id !== id)
      })),

      setActiveScenario: (type) => set((state) => ({ scenarios: { ...state.scenarios, active: type } })),
      updateScenario: (type, config) => set((state) => ({
        scenarios: {
          ...state.scenarios,
          [type]: { ...state.scenarios[type], ...config }
        }
      })),

      setLanguage: (lang) => set({ language: lang }),
      setView: (view) => set({ selectedView: view }),

      // Computed
      getTimeline: () => generateTimeline(get().config.startDate, get().config.modelLengthMonths),
      getIS: (scenarioType) => buildIS(get(), scenarioType),
      getCF: (scenarioType) => buildCF(get(), buildIS(get(), scenarioType), scenarioType),
    }),
    {
      name: 'fm-georgia-storage',
    }
  )
)
