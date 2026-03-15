'use client'
// components/layout/Topbar.tsx
import { useModelStore } from '@/store/modelStore'
import { Sun, Moon, Globe, ChevronDown, Calendar, Database } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function Topbar() {
  const { theme, setTheme } = useTheme()
  const { config, selectedView, setView, scenarios, setActiveScenario, language, setLanguage } = useModelStore()

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-5 flex items-center justify-between z-20">
      <div className="flex items-center gap-6">
        {/* Config Summary */}
        <div className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>Start: {config.startDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database size={12} />
            <span>{config.currency} • {config.territory}</span>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          {(['monthly', 'quarterly', 'annual'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                selectedView === v ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Scenario Select */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
            <span className={`w-2 h-2 rounded-full ${scenarios.active === 'bull' ? 'bg-emerald-500' : scenarios.active === 'bear' ? 'bg-red-500' : 'bg-blue-500'}`} />
            {scenarios.active.toUpperCase()}
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-1 z-50">
            {(['base', 'bull', 'bear'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveScenario(s)}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize"
              >
                {s} Case
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <button
          onClick={() => setLanguage(language === 'ka' ? 'en' : 'ka')}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition-colors flex items-center gap-1.5"
        >
          <Globe size={18} />
          <span className="text-[10px] font-bold uppercase">{language}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
