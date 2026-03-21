import { create } from 'zustand';
import { FinancialStore, FinancialResults } from '@/types/financial-store';
import { calculateModel } from '@/lib/calculations';

const INITIAL_INPUTS: FinancialStore['inputs'] = {
  global: {
    modelName: 'New Project',
    currency: 'GEL',
    initialCash: 10000,
    accountsReceivableDays: 30,
    accountsPayableDays: 30,
  },
  sales: [],
  opex: [],
  capex: [],
  dividends: [],
};

export const useFinancialStore = create<FinancialStore>((set, get) => ({
  inputs: INITIAL_INPUTS,
  results: calculateModel(INITIAL_INPUTS),
  actions: {
    recalculateModel: () => {
      const { inputs } = get();
      set({ results: calculateModel(inputs) });
    },
    setGlobalInput: (key, value) => {
      set((state) => {
        const newInputs = {
          ...state.inputs,
          global: { ...state.inputs.global, [key]: value },
        };
        return {
          inputs: newInputs,
          results: calculateModel(newInputs),
        };
      });
    },
    addSalesItem: (item) => {
      set((state) => {
        const newInputs = {
          ...state.inputs,
          sales: [...state.inputs.sales, item],
        };
        return {
          inputs: newInputs,
          results: calculateModel(newInputs),
        };
      });
    },
    addOpexItem: (item) => {
      set((state) => {
        const newInputs = {
          ...state.inputs,
          opex: [...state.inputs.opex, item],
        };
        return {
          inputs: newInputs,
          results: calculateModel(newInputs),
        };
      });
    },
    addCapexItem: (item) => {
      set((state) => {
        const newInputs = {
          ...state.inputs,
          capex: [...state.inputs.capex, item],
        };
        return {
          inputs: newInputs,
          results: calculateModel(newInputs),
        };
      });
    },
    addDividend: (item) => {
      set((state) => {
        const newInputs = {
          ...state.inputs,
          dividends: [...state.inputs.dividends, item],
        };
        return {
          inputs: newInputs,
          results: calculateModel(newInputs),
        };
      });
    },
  },
}));
