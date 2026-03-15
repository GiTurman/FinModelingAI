'use client'
// app/investments/page.tsx
import { useModelStore } from '@/store/modelStore'
import { InvestmentItem } from '@/types/model'
import { fmtGEL, sumArr } from '@/lib/calculations'
import { Plus, Trash2, Landmark, Wallet, Coins } from 'lucide-react'

function newItem(type: InvestmentItem['type']): Omit<InvestmentItem, 'id'> {
  return {
    name: `New ${type}`,
    type,
    amount: 50000,
    monthIndex: 0,
    interestRate: type === 'Loan' ? 12 : 0,
    termMonths: type === 'Loan' ? 24 : 0,
  }
}

export default function InvestmentsPage() {
  const { investments, addInvestment, updateInvestment, removeInvestment, getTimeline } = useModelStore()
  const timeline = getTimeline()

  const totalEquity = sumArr(investments.filter(i => i.type === 'Equity').map(i => i.amount))
  const totalLoans = sumArr(investments.filter(i => i.type === 'Loan').map(i => i.amount))
  const totalGrants = sumArr(investments.filter(i => i.type === 'Grant').map(i => i.amount))

  return (
    <div className="page-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Investments & Funding</h1>
          <p className="text-xs text-slate-400 mt-1">კაპიტალი, სესხები და გრანტები</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => addInvestment(newItem('Equity'))} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold"><Plus size={14}/> Equity</button>
          <button onClick={() => addInvestment(newItem('Loan'))} className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold"><Plus size={14}/> Loan</button>
          <button onClick={() => addInvestment(newItem('Grant'))} className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold"><Plus size={14}/> Grant</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Equity', val: totalEquity, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Total Loans', val: totalLoans, icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Total Grants', val: totalGrants, icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-4">
            <div className={`w-10 h-10 ${s.bg} dark:bg-opacity-20 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{s.label}</p>
              <p className="text-lg font-bold font-mono text-slate-800 dark:text-white">{fmtGEL(s.val, true)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <table className="fm-table">
          <thead>
            <tr>
              <th className="text-left">Funding Source</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Month</th>
              <th>Rate %</th>
              <th>Term (Mo)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {investments.map((item) => (
              <tr key={item.id}>
                <td className="text-left">
                  <input value={item.name} onChange={e => updateInvestment(item.id, { name: e.target.value })} className="bg-transparent outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-500 w-full" />
                </td>
                <td>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.type === 'Equity' ? 'bg-blue-100 text-blue-700' :
                    item.type === 'Loan' ? 'bg-purple-100 text-purple-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>{item.type}</span>
                </td>
                <td className="input-cell">
                  <input type="number" value={item.amount} onChange={e => updateInvestment(item.id, { amount: Number(e.target.value) })} className="bg-transparent text-right outline-none w-24 font-mono" />
                </td>
                <td>
                  <select value={item.monthIndex} onChange={e => updateInvestment(item.id, { monthIndex: Number(e.target.value) })} className="bg-transparent outline-none text-xs">
                    {timeline.map(c => <option key={c.index} value={c.index}>{c.label}</option>)}
                  </select>
                </td>
                <td className="input-cell">
                  {item.type === 'Loan' ? (
                    <input type="number" value={item.interestRate} onChange={e => updateInvestment(item.id, { interestRate: Number(e.target.value) })} className="bg-transparent text-right outline-none w-12 font-mono" />
                  ) : '-'}
                </td>
                <td className="input-cell">
                  {item.type === 'Loan' ? (
                    <input type="number" value={item.termMonths} onChange={e => updateInvestment(item.id, { termMonths: Number(e.target.value) })} className="bg-transparent text-right outline-none w-12 font-mono" />
                  ) : '-'}
                </td>
                <td>
                  <button onClick={() => removeInvestment(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
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
    </div>
  )
}
