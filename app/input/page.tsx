'use client'
// app/input/page.tsx
import React, { useState, useEffect } from 'react'
import { useModelStore } from '@/store/modelStore'
import { Settings, MapPin, Calendar, DollarSign } from 'lucide-react'

export default function InputPage() {
  const { config, setConfig, language } = useModelStore()
  const [localLength, setLocalLength] = useState(config.modelLengthMonths.toString())

  useEffect(() => {
    setLocalLength(config.modelLengthMonths.toString())
  }, [config.modelLengthMonths])

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocalLength(val)
    
    const num = parseInt(val)
    if (!isNaN(num) && num >= 1 && num <= 240) {
      setConfig({ modelLengthMonths: num })
    }
  }

  const handleBlur = () => {
    let num = parseInt(localLength)
    if (isNaN(num) || num < 12) num = 12
    if (num > 120) num = 120
    setLocalLength(num.toString())
    setConfig({ modelLengthMonths: num })
  }

  return (
    <div className="page-in max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">{language === 'ka' ? 'ინპუტი' : 'Input'}</h1>
        <p className="text-sm text-slate-500 mt-1">{language === 'ka' ? 'მოდელის ძირითადი პარამეტრები — Excel-ის "Input" sheet-ის ანალოგი' : 'Core model parameters — analogous to the Excel "Input" sheet'}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 divide-y divide-slate-100 dark:divide-slate-800">
        {/* Starting Date */}
        <div className="flex items-center gap-4 p-5">
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar size={16} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{language === 'ka' ? 'დასაწყისი თარიღი' : 'Starting Date'}</label>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) => setConfig({ startDate: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <p className="text-xs text-slate-400 w-24">{language === 'ka' ? '60-თვიანი მოდელის დასაწყისი' : 'Starting Date of the 60-month model'}</p>
        </div>

        {/* Model Length */}
        <div className="flex items-center gap-4 p-5">
          <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <Settings size={16} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{language === 'ka' ? 'მოდელის ხანგრძლივობა' : 'Model Length'}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={localLength}
                onChange={handleLengthChange}
                onBlur={handleBlur}
                className="w-28 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span className="text-sm text-slate-500">{language === 'ka' ? 'თვე' : 'months'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 w-24">{language === 'ka' ? 'ნაგულისხმევი: 60 თვე (5 წელი)' : 'Default: 60 months (5 years)'}</p>
        </div>

        {/* Territory */}
        <div className="flex items-center gap-4 p-5">
          <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin size={16} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{language === 'ka' ? 'ტერიტორია' : 'Territory'}</label>
            <input
              type="text"
              value={config.territory}
              onChange={(e) => setConfig({ territory: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <p className="text-xs text-slate-400 w-24">{language === 'ka' ? 'ლოკაცია მოქმედებს საგადასახადო წესებზე' : 'Location affects tax rules'}</p>
        </div>

        {/* Currency */}
        <div className="flex items-center gap-4 p-5">
          <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign size={16} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{language === 'ka' ? 'საოპერაციო ვალუტა' : 'Operating Currency'}</label>
            <select
              value={config.currency}
              onChange={(e) => setConfig({ currency: e.target.value })}
              className="w-40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {['GEL','USD','EUR','TRY','CNY'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400 w-24">{language === 'ka' ? 'ყველა შედეგი ამ ვალუტაშია' : 'All outputs in this currency'}</p>
        </div>
      </div>

      {/* Model summary */}
      <div className="bg-slate-800 rounded-xl p-5 text-white">
        <h3 className="text-sm font-semibold mb-3 text-slate-300">{language === 'ka' ? 'მოდელის რეზიუმე' : 'Model Summary'}</h3>
        <div className="grid grid-cols-2 gap-3 text-sm font-mono">
          <div><span className="text-slate-400">{language === 'ka' ? 'დასაწყისი' : 'Start'}:</span> <span className="text-blue-300">{config.startDate}</span></div>
          <div><span className="text-slate-400">{language === 'ka' ? 'ხანგრძლივობა' : 'Length'}:</span> <span className="text-blue-300">{config.modelLengthMonths} {language === 'ka' ? 'თვე' : 'months'}</span></div>
          <div><span className="text-slate-400">{language === 'ka' ? 'ტერიტორია' : 'Territory'}:</span> <span className="text-blue-300">{config.territory}</span></div>
          <div><span className="text-slate-400">{language === 'ka' ? 'ვალუტა' : 'Currency'}:</span> <span className="text-blue-300">{config.currency}</span></div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>🔵 {language === 'ka' ? 'ლურჯი' : 'Blue'}</strong> = Input (hardcoded) &nbsp;|&nbsp;
          <strong>⚫ {language === 'ka' ? 'შავი' : 'Black'}</strong> = {language === 'ka' ? 'ფორმულა' : 'Formula'} &nbsp;|&nbsp;
          <strong>🟢 {language === 'ka' ? 'მწვანე' : 'Green'}</strong> = {language === 'ka' ? 'სხვა შიტიდან ლინკი' : 'Link from another sheet'}
        </p>
      </div>
    </div>
  )
}
