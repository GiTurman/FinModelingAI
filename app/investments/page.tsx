// app/investments/page.tsx
'use client'
import React from 'react'
import { useModelStore } from '@/store/modelStore'
import { InvestmentItem } from '@/types/model'
import { fmtGEL } from '@/lib/calculations'
import { generateTimeline } from '@/lib/time'
import { Plus, Trash2 } from 'lucide-react'

export default function InvestmentsPage() {
  const { investments, addInvestment, updateInvestment, removeInvestment, ops, config } = useModelStore()
  const { dividendDeclarations, addDividendDeclaration, removeDividendDeclaration } = useModelStore()
  const timeline = generateTimeline(config.startDate, config.modelLengthMonths)

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

  const handleAdd = () => {
    addInvestment(newInvestment())
  }

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Financing & Investments</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Define equity, grants, and loans to fund the business.
            </p>
          </div>
          <button onClick={handleAdd} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Plus size={14} />
            Add Financing
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <table className="fm-table">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Drawdown Month</th>
                <th>Interest Rate (%)</th>
                <th>Term (Months)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {investments.map((item) => (
                <tr key={item.id}>
                  <td className="text-left">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateInvestment(item.id, { name: e.target.value })}
                      className="bg-transparent outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-500 w-full text-sm"
                    />
                  </td>
                  <td>
                    <select
                      value={item.type}
                      onChange={(e) => updateInvestment(item.id, { type: e.target.value as InvestmentItem['type'] })}
                      className="bg-transparent outline-none text-xs"
                    >
                      <option value="Equity">Equity</option>
                      <option value="Loan">Loan</option>
                      <option value="Grant">Grant</option>
                    </select>
                  </td>
                  <td className="input-cell">
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateInvestment(item.id, { amount: Number(e.target.value) })}
                      onFocus={(e) => e.target.select()}
                      className="bg-transparent text-right outline-none w-24 font-mono focus:ring-1 ring-blue-500 rounded"
                    />
                  </td>
                  <td>
                    <select
                      value={item.monthIndex}
                      onChange={(e) => updateInvestment(item.id, { monthIndex: Number(e.target.value) })}
                      className="bg-transparent outline-none text-xs"
                    >
                      {timeline.map(t => <option key={t.index} value={t.index}>{t.label}</option>)}
                    </select>
                  </td>
                  <td className="input-cell">
                    {item.type === 'Loan' && <input type="number" value={item.interestRate} onChange={(e) => updateInvestment(item.id, { interestRate: Number(e.target.value) })} onFocus={(e) => e.target.select()} className="bg-transparent text-right outline-none w-20 font-mono focus:ring-1 ring-blue-500 rounded" />}
                  </td>
                  <td className="input-cell">
                    {item.type === 'Loan' && <input type="number" value={item.termMonths} onChange={(e) => updateInvestment(item.id, { termMonths: Number(e.target.value) })} onFocus={(e) => e.target.select()} className="bg-transparent text-right outline-none w-20 font-mono focus:ring-1 ring-blue-500 rounded" />}
                  </td>
                  <td>
                    <button onClick={() => removeInvestment(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {investments.filter(i => i.type === 'Loan').length > 0 && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
            <p className="text-xs text-purple-700 dark:text-purple-300">
              <strong>შენიშვნა:</strong> სესხის პროცენტის და ძირითადი თანხის გადახდა იწყება მიღების მომდევნო თვიდან. გათვლილია ანუიტეტური გადახდის მეთოდით.
            </p>
          </div>
        )}

        {/* ── Dividend Declarations (Georgian CIT / Estonian Model) ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Dividend Declarations
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                საქართველოს ესტონური მოდელი — CIT გადაიხდება მხოლოდ დივიდენდის განაწილებისას
              </p>
            </div>
            <button
              onClick={() => addDividendDeclaration({
                year: 1,
                amount: 0,
                description: 'Annual dividend'
              })}
              className="flex items-center gap-1.5 bg-teal-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              <Plus size={14}/> Declare Dividend
            </button>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-xs text-amber-800 dark:text-amber-300">
            <strong>🇬🇪 Georgian Tax Code Art. 97:</strong> Corporate Income Tax (15%) applies only
            when profit is distributed. Retained earnings accumulate tax-free.
            After CIT, a 5% withholding tax applies on the net dividend paid to shareholders.
          </div>

          {dividendDeclarations.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
              <table className="fm-table">
                <thead>
                  <tr>
                    <th className="text-left">Description</th>
                    <th>Year</th>
                    <th>Gross Dividend (₾)</th>
                    <th>CIT 15% (₾)</th>
                    <th>Withholding 5% (₾)</th>
                    <th>Net to Shareholder (₾)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dividendDeclarations.map((decl) => {
                    const cit = decl.amount * 0.15
                    const withholding = (decl.amount - cit) * 0.05
                    const net = decl.amount - cit - withholding
                    return (
                      <tr key={decl.id}>
                        <td className="text-left">
                          <input
                            value={decl.description}
                            onChange={(e) => {
                              const updated = dividendDeclarations.map(d =>
                                d.id === decl.id ? { ...d, description: e.target.value } : d
                              )
                            }}
                            className="bg-transparent outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-500 w-full text-sm"
                          />
                        </td>
                        <td>
                          <select
                            value={decl.year}
                            onChange={(e) => {
                              const year = Number(e.target.value)
                            }}
                            className="bg-transparent outline-none text-xs"
                          >
                            {[1,2,3,4,5].map(y => <option key={y} value={y}>Y{y}</option>)}
                          </select>
                        </td>
                        <td className="input-cell">
                          <input
                            type="number" value={decl.amount}
                            inputMode="decimal"
                            onChange={(e) => {}}
                            onFocus={(e) => e.target.select()}
                            className="bg-transparent text-right outline-none w-24 font-mono focus:ring-1 ring-blue-500 rounded"
                          />
                        </td>
                        <td className="font-mono text-orange-600 dark:text-orange-400">{fmtGEL(cit)}</td>
                        <td className="font-mono text-orange-600 dark:text-orange-400">{fmtGEL(withholding)}</td>
                        <td className="font-mono font-semibold">{fmtGEL(net)}</td>
                        <td>
                          <button onClick={() => removeDividendDeclaration(decl.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14}/>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}