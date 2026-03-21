'use client'
// app/sales/page.tsx
import { useMemo, useState } from 'react'
import { useModelStore } from '@/store/modelStore'
import { SalesItem } from '@/types/model'
import { TimePeriod, generateTimeline } from '@/lib/time'
import { fmtGEL, sumArr } from '@/lib/calculations'
import { Plus, Trash2, ChevronDown, ChevronUp, Settings } from 'lucide-react'
import Link from 'next/link'

const MONTHS = 60

function newItem(language: string): Omit<SalesItem, 'id'> {
  return {
    name: language === 'ka' ? 'ახალი პროდუქტი' : 'New Product',
    category: 'General',
    unitPrice: 100,
    monthlyUnits: Array(MONTHS).fill(0),
    vatIncluded: true,
  }
}

export default function SalesPage() {
  const store = useModelStore()
  const { salesItems, addSalesItem, updateSalesItem, removeSalesItem, taxRates, language, config, scenarios, setActiveScenario } = store
  const activeScenario = scenarios[scenarios.active]
  const timeline = useMemo(() => generateTimeline(config.startDate, config.modelLengthMonths), [config.startDate, config.modelLengthMonths])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showMonthly, setShowMonthly] = useState<string | null>(null)

  const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id)
  const toggleMonthly = (id: string) => setShowMonthly(showMonthly === id ? null : id)

  const updateUnits = (id: string, monthIdx: number, val: number) => {
    const item = salesItems.find((i: SalesItem) => i.id === id)
    if (!item) return
    const units = [...item.monthlyUnits]
    units[monthIdx] = val
    updateSalesItem(id, { monthlyUnits: units })
  }

  const fillUniform = (id: string, val: number) => {
    updateSalesItem(id, { monthlyUnits: Array(MONTHS).fill(val) })
  }

  const fillGrowth = (id: string, start: number, growthPct: number) => {
    const units = Array(MONTHS).fill(0).map((_, i) =>
      Math.round(start * Math.pow(1 + growthPct / 100, i))
    )
    updateSalesItem(id, { monthlyUnits: units })
  }

  return (
    <div className="page-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{language === 'ka' ? 'გაყიდვები' : 'Sales Schedule'}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ka' ? 'გაყიდვების გეგმა — 60 თვე' : 'Sales Plan — 60 months'} • VAT {(taxRates.vatRate * 100).toFixed(0)}%
            <span className={`ml-2 font-bold ${scenarios.active === 'bull' ? 'text-emerald-500' : scenarios.active === 'bear' ? 'text-red-500' : 'text-blue-500'}`}>
              • {language === 'ka' ? (scenarios.active === 'base' ? 'ბაზისური სცენარი' : scenarios.active === 'bull' ? 'ოპტიმისტური სცენარი' : 'პესიმისტური სცენარი') : `${scenarios.active.toUpperCase()} Scenario`}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/line-items"
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Settings size={15} /> {language === 'ka' ? 'მუხლების მართვა' : 'Manage Line Items'}
          </Link>
          <button
            onClick={() => addSalesItem(newItem(language))}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus size={15} /> {language === 'ka' ? 'პროდუქტის დამატება' : 'Add Product'}
          </button>
        </div>
      </div>

      {salesItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-400 text-sm mb-4">{language === 'ka' ? 'გაყიდვების სტრიქონი არ არის' : 'No sales items'}</p>
          <button onClick={() => addSalesItem(newItem(language))} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
            <Plus size={15} /> {language === 'ka' ? 'პირველი პროდუქტის დამატება' : 'Add First Product'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {salesItems.map((item: SalesItem) => {
          const totalUnits = sumArr(item.monthlyUnits)
          const totalRevBase = totalUnits * item.unitPrice
          const totalRevScenario = totalRevBase * activeScenario.revenueMultiplier
          
          const netPrice = item.vatIncluded ? item.unitPrice / (1 + taxRates.vatRate) : item.unitPrice
          const vatAmount = item.vatIncluded ? item.unitPrice - netPrice : item.unitPrice * taxRates.vatRate
          const grossPrice = item.vatIncluded ? item.unitPrice : item.unitPrice + vatAmount

          const isExp = expanded === item.id

          return (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
              {/* Header row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => toggleExpand(item.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  {isExp ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>

                {/* Name */}
                <input
                  value={item.name}
                  onChange={(e) => updateSalesItem(item.id, { name: e.target.value })}
                  className="flex-1 text-sm font-semibold bg-transparent outline-none text-slate-800 dark:text-white border-b border-transparent hover:border-slate-300 focus:border-blue-500 transition-colors"
                />

                {/* Unit price */}
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">{language === 'ka' ? 'ფასი:' : 'Price:'}</span>
                    <input
                      type="number" min={0} step={1}
                      inputMode="decimal"
                      value={item.unitPrice}
                      onChange={(e) => updateSalesItem(item.id, { unitPrice: Number(e.target.value) })}
                      onFocus={(e) => e.target.select()}
                      className="w-24 text-right text-sm font-mono text-blue-700 dark:text-blue-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-400">₾</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.vatIncluded ? (
                      <span>{language === 'ka' ? 'დღგ-ს გარეშე:' : 'Ex-VAT:'} {fmtGEL(netPrice)}</span>
                    ) : (
                      <span>{language === 'ka' ? 'დღგ-ს ჩათვლით:' : 'Incl-VAT:'} {fmtGEL(grossPrice)}</span>
                    )}
                  </div>
                </div>

                {/* VAT toggle */}
                <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.vatIncluded}
                    onChange={(e) => updateSalesItem(item.id, { vatIncluded: e.target.checked })}
                    className="accent-blue-600"
                  />
                  {language === 'ka' ? 'დღგ ჩათვლით' : 'VAT incl.'}
                </label>

                {/* Summary */}
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400">{totalUnits.toLocaleString()} {language === 'ka' ? 'ერთეული' : 'units'}</p>
                  <p className="text-sm font-mono font-semibold text-slate-800 dark:text-white">
                    {fmtGEL(totalRevScenario, true)}
                    {activeScenario.revenueMultiplier !== 1 && (
                      <span className="text-[10px] text-blue-500 ml-1">({(activeScenario.revenueMultiplier * 100).toFixed(0)}%)</span>
                    )}
                  </p>
                </div>

                <button onClick={() => removeSalesItem(item.id)} className="text-red-400 hover:text-red-600 p-1 ml-1">
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Expanded controls */}
              {isExp && (
                <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-4">
                  {/* Quick fill */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{language === 'ka' ? 'ერთგვაროვანი შევსება:' : 'Uniform fill:'}</span>
                      <input
                        type="number" min={0} placeholder={language === 'ka' ? 'ერთეული/თვე' : 'units/mo'}
                        className="w-24 text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 outline-none focus:ring-1 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') fillUniform(item.id, Number((e.target as HTMLInputElement).value))
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const inp = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement)
                          fillUniform(item.id, Number(inp?.value ?? 0))
                        }}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700"
                      >{language === 'ka' ? 'გამოყენება' : 'Apply'}</button>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{language === 'ka' ? 'ზრდით შევსება:' : 'Growth fill:'}</span>
                      <input id={`start-${item.id}`} type="number" min={0} placeholder={language === 'ka' ? 'საწყისი' : 'start'} className="w-20 text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 outline-none" />
                      <span className="text-xs text-slate-400">+</span>
                      <input id={`growth-${item.id}`} type="number" placeholder={language === 'ka' ? '% თვე' : '% mo'} className="w-16 text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 outline-none" />
                      <button
                        onClick={() => {
                          const s = Number((document.getElementById(`start-${item.id}`) as HTMLInputElement)?.value ?? 0)
                          const g = Number((document.getElementById(`growth-${item.id}`) as HTMLInputElement)?.value ?? 0)
                          fillGrowth(item.id, s, g)
                        }}
                        className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-700"
                      >{language === 'ka' ? 'გამოყენება' : 'Apply'}</button>
                    </div>
                  </div>

                  {/* Monthly units grid */}
                  <div>
                    <button onClick={() => toggleMonthly(item.id)} className="text-xs text-blue-600 font-semibold mb-2 hover:underline">
                      {showMonthly === item.id ? (language === 'ka' ? '▲ დამალვა' : '▲ Hide') : (language === 'ka' ? '▼ ჩვენება' : '▼ Show')} {language === 'ka' ? 'თვიური ერთეულების ცხრილი' : 'monthly units table'}
                    </button>
                    {showMonthly === item.id && (
                      <div className="overflow-x-auto">
                        <table className="text-xs font-mono">
                          <thead>
                            <tr>
                              {timeline.map((c: TimePeriod) => (
                                <th key={c.index} className="px-1.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal whitespace-nowrap">{c.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {timeline.map((c: TimePeriod) => (
                                <td key={c.index} className="px-0.5 py-0.5">
                                  <input
                                    type="number" min={0}
                                    inputMode="decimal"
                                    value={item.monthlyUnits[c.index] ?? 0}
                                    onChange={(e) => updateUnits(item.id, c.index, Number(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                    className="w-14 text-right text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 bg-white dark:bg-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Year summary */}
                  <div className="grid grid-cols-5 gap-2">
                    {[1,2,3,4,5].map((yr) => {
                      const slice = item.monthlyUnits.slice((yr-1)*12, yr*12)
                      const units = sumArr(slice)
                      const rev = units * item.unitPrice
                      return (
                        <div key={yr} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400 mb-1">{language === 'ka' ? `წ${yr}` : `Y${yr}`}</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{units.toLocaleString()} {language === 'ka' ? 'ე' : 'u'}</p>
                          <p className="text-xs font-mono text-blue-700 dark:text-blue-400">{fmtGEL(rev, true)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Total */}
      {salesItems.length > 0 && (
        <div className="bg-slate-800 text-white rounded-xl p-4 flex items-center justify-between">
          <span className="font-semibold">{language === 'ka' ? 'ჯამური შემოსავალი (60თ, დღგ-ს ჩათვლით)' : 'Total Revenue (60M, incl. VAT)'}</span>
          <span className="font-mono font-bold text-xl">
            {fmtGEL(sumArr(salesItems.map((item: SalesItem) => sumArr(item.monthlyUnits) * item.unitPrice)), true)}
          </span>
        </div>
      )}
    </div>
  )
}
