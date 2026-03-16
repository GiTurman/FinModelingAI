'use client'
// app/line-items/page.tsx
import { useState } from 'react'
import { useModelStore } from '@/store/modelStore'
import { CustomCategory } from '@/types/model'
import { Plus, Trash2, Save } from 'lucide-react'

export default function LineItemsPage() {
  const { customCategories, addCustomCategory, updateCustomCategory, removeCustomCategory, language } = useModelStore()
  const [newName, setNewName] = useState('')
  const [newStatement, setNewStatement] = useState<'IS' | 'BS' | 'CF'>('IS')
  const [newSection, setNewSection] = useState('OpEx')

  const handleAdd = () => {
    if (!newName.trim()) return
    addCustomCategory({
      name: newName,
      statement: newStatement,
      section: newSection
    })
    setNewName('')
  }

  const sections = {
    IS: ['Revenue', 'COGS', 'OpEx'],
    BS: ['Assets', 'Liabilities', 'Equity'],
    CF: ['Operations', 'Investing', 'Financing']
  }

  return (
    <div className="page-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          {language === 'ka' ? 'მუხლების მართვა' : 'Line Items Management'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {language === 'ka' ? 'განსაზღვრეთ ფინანსური უწყისების მუხლები (კლასი 1)' : 'Define financial statement line items (Class 1)'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              {language === 'ka' ? 'დასახელება' : 'Name'}
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
              placeholder={language === 'ka' ? 'მაგ: მარკეტინგის ხარჯი' : 'e.g. Marketing Costs'}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-500/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              {language === 'ka' ? 'უწყისი' : 'Statement'}
            </label>
            <select
              value={newStatement}
              onChange={(e) => {
                const s = e.target.value as any
                setNewStatement(s)
                setNewSection(sections[s as keyof typeof sections][0])
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value="IS">Income Statement</option>
              <option value="BS">Balance Sheet</option>
              <option value="CF">Cash Flow</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              {language === 'ka' ? 'სექცია' : 'Section'}
            </label>
            <select
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none"
            >
              {sections[newStatement].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} /> {language === 'ka' ? 'დამატება' : 'Add'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['IS', 'BS', 'CF'] as const).map(stmt => (
          <div key={stmt} className="space-y-3">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {stmt === 'IS' ? 'Income Statement' : stmt === 'BS' ? 'Balance Sheet' : 'Cash Flow'}
            </h2>
            <div className="space-y-2">
              {customCategories.filter(c => c.statement === stmt).map(cat => (
                <div key={cat.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{cat.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{cat.section}</p>
                  </div>
                  <button
                    onClick={() => removeCustomCategory(cat.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {customCategories.filter(c => c.statement === stmt).length === 0 && (
                <p className="text-xs text-slate-400 italic py-2">No custom items defined</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
