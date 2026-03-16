// app/investments/page.tsx
'use client'
import React, { useState } from 'react'
import { useModelStore } from '@/store/modelStore'
import { InvestmentItem, DividendDeclaration } from '@/types/model'
import { fmtGEL } from '@/lib/calculations'
import { generateTimeline } from '@/lib/time'
import { Plus, Trash2, Info } from 'lucide-react'

export default function InvestmentsPage() {
  const store = useModelStore()
  const {
    investments, addInvestment, updateInvestment, removeInvestment,
    dividendDeclarations, addDividendDeclaration, removeDividendDeclaration, updateDividendDeclaration,
    ops, taxRates
  } = store

  const timeline = generateTimeline(store.config.startDate, store.config.modelLengthMonths)

  function newInvestment(): Omit<InvestmentItem, 'id'> {
    return {
      name: 'New Investment',
      type: 'Equity',
      amount: 50000,
      monthIndex: 0,
      interestRate: ops.defaultLoanRate,
      termMonths: 60,
    }
  }

  const handleAddInvestment = () => {
    addInvestment(newInvestment())
  }

  function newDividend(year: number): Omit<DividendDeclaration, 'id'> {
    return {
      year,
      amount: 10000,
      description: `Dividend for Year ${year}`
    }
  }

  const handleAddDividend = (year: number) => {
    // Prevent adding duplicate years
    if (dividendDeclarations.some((d: DividendDeclaration) => d.year === year)) return
    addDividendDeclaration(newDividend(year))
  }

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Investments Section */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Financing & Investments</h1>
            <p className="text-sm text-slate-500">
              Define equity, grants, and loans to fund the business.
            </p>
          </div>
          <button onClick={handleAddInvestment} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            {store.language === 'ka' ? 'დაფინანსების დამატება' : 'Add Financing'}
          </button>
        </div>

      {investments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-slate-300 mb-8">
          <p className="text-slate-400 text-sm mb-4">დაფინანსება არ არის დამატებული</p>
          <button onClick={handleAddInvestment} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
            <Plus size={15} /> {store.language === 'ka' ? 'პირველი დაფინანსების დამატება' : 'Add First Financing'}
          </button>
        </div>
      )}

      {investments.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left font-semibold p-3">Name</th>
                <th className="text-left font-semibold p-3">Type</th>
                <th className="text-right font-semibold p-3">Amount (₾)</th>
                <th className="text-left font-semibold p-3">Drawdown Month</th>
                <th className="text-right font-semibold p-3">Interest Rate (%)</th>
                <th className="text-right font-semibold p-3">Term (Months)</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {investments.map((item: InvestmentItem) => (
                <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="p-3 input-cell">
                    <input type="text" value={item.name} onChange={(e) => updateInvestment(item.id, { name: e.target.value })} className="bg-transparent outline-none w-full font-medium text-slate-800" />
                  </td>
                  <td className="p-3 input-cell">
                    <select value={item.type} onChange={(e) => updateInvestment(item.id, { type: e.target.value as InvestmentItem['type'] })} className="bg-transparent outline-none w-full">
                      <option value="Equity">Equity</option>
                      <option value="Loan">Loan</option>
                      <option value="Grant">Grant</option>
                    </select>
                  </td>
                  <td className="p-3 input-cell">
                    <input type="number" inputMode="decimal" value={item.amount} onChange={(e) => updateInvestment(item.id, { amount: Number(e.target.value) })} onFocus={(e) => e.target.select()} className="bg-transparent text-right outline-none w-24 font-mono" />
                  </td>
                  <td className="p-3 input-cell">
                    <select value={item.monthIndex} onChange={(e) => updateInvestment(item.id, { monthIndex: Number(e.target.value) })} className="bg-transparent outline-none w-full">
                      {timeline.map(t => <option key={t.index} value={t.index}>{t.label}</option>)}
                    </select>
                  </td>
                  <td className="p-3 input-cell">
                    {item.type === 'Loan' && <input type="number" inputMode="decimal" value={item.interestRate} onChange={(e) => updateInvestment(item.id, { interestRate: Number(e.target.value) })} onFocus={(e) => e.target.select()} className="bg-transparent text-right outline-none w-20 font-mono" />}
                  </td>
                  <td className="p-3 input-cell">
                    {item.type === 'Loan' && <input type="number" inputMode="numeric" value={item.termMonths} onChange={(e) => updateInvestment(item.id, { termMonths: Number(e.target.value) })} onFocus={(e) => e.target.select()} className="bg-transparent text-right outline-none w-20 font-mono" />}
                  </td>
                  <td className="text-center p-3">
                    <button onClick={() => removeInvestment(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

        {/* Dividend Section */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dividend Declarations (Georgian CIT Model)</h1>
            <div className="mt-2 flex items-start gap-2 text-sm text-slate-600 bg-slate-100 p-3 rounded-md border border-slate-200">
              <Info size={18} className="text-slate-500 mt-0.5 flex-shrink-0" />
              <p>Georgia uses the &quot;Estonian Model&quot; for Corporate Income Tax (CIT). Tax is not paid on profits as they are earned. Instead, a {taxRates.corporateTaxRate * 100}% CIT is paid on the gross amount of declared dividends. A further {taxRates.dividendTaxRate * 100}% withholding tax is applied to the net distribution. This section models that cash flow event.</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left font-semibold p-3">Model Year</th>
                <th className="text-right font-semibold p-3">Amount Declared (₾)</th>
                <th className="text-right font-semibold p-3">CIT ({taxRates.corporateTaxRate * 100}%)</th>
                <th className="text-right font-semibold p-3">Withholding ({taxRates.dividendTaxRate * 100}%)</th>
                <th className="text-right font-semibold p-3">Net to Shareholder</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {dividendDeclarations.sort((a: DividendDeclaration, b: DividendDeclaration) => a.year - b.year).map((item: DividendDeclaration) => {
                const cit = item.amount * taxRates.corporateTaxRate
                const netDistribution = item.amount - cit
                const withholding = netDistribution * taxRates.dividendTaxRate
                const netToShareholder = netDistribution - withholding
                return (
                  <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">Year {item.year}</td>
                    <td className="p-3 input-cell">
                      <input type="number" inputMode="decimal" value={item.amount} onChange={(e) => updateDividendDeclaration(item.id, { amount: Number(e.target.value) })} onFocus={(e) => e.target.select()} className="bg-transparent text-right outline-none w-28 font-mono" />
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">{fmtGEL(cit)}</td>
                    <td className="p-3 text-right font-mono text-slate-500">{fmtGEL(withholding)}</td>
                    <td className="p-3 text-right font-mono font-semibold text-slate-800">{fmtGEL(netToShareholder)}</td>
                    <td className="text-center p-3">
                      <button onClick={() => removeDividendDeclaration(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
            <span className="text-sm text-slate-600">Declare dividend in:</span>
            {Array.from({ length: store.config.modelLengthMonths / 12 }).map((_, i) => {
              const year = i + 1
              const exists = dividendDeclarations.some((d: DividendDeclaration) => d.year === year)
              return (
                <button
                  key={year}
                  onClick={() => handleAddDividend(year)}
                  disabled={exists}
                  className="px-3 py-1 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  Year {year}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}