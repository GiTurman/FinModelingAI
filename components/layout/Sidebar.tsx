'use client'
// components/layout/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Sliders, DollarSign,
  TrendingDown, FileText, PieChart,
  Settings, Briefcase, HardDrive,
  BarChart3, Landmark,
} from 'lucide-react'
import { useModelStore } from '@/store/modelStore'

const NAV_ITEMS = [
  { label: 'Dashboard', labelKa: 'დაშბორდი', icon: LayoutDashboard, href: '/' },
  { label: 'Input', labelKa: 'ინპუტი', icon: Sliders, href: '/input' },
  { label: 'Sales Schedule', labelKa: 'გაყიდვები', icon: DollarSign, href: '/sales' },
  { label: 'COGS Schedule', labelKa: 'პირდაპირი ხარჯები', icon: TrendingDown, href: '/cogs' },
  { label: 'OPEX Schedule', labelKa: 'საოპერაციო ხარჯები', icon: TrendingDown, href: '/opex' },
  { label: 'CapEx Schedule', labelKa: 'კაპიტალური ხარჯები', icon: HardDrive, href: '/capex' },
  { label: 'Investments', labelKa: 'ინვესტიციები', icon: Landmark, href: '/investments' },
  { label: 'Income Statement', labelKa: 'მოგება-ზარალი', icon: FileText, href: '/income-statement' },
  { label: 'Balance Sheet', labelKa: 'ბალანსი', icon: PieChart, href: '/balance-sheet' },
  { label: 'Cash Flow', labelKa: 'ფულადი ნაკადები', icon: Briefcase, href: '/cash-flow' },
  { label: 'Scenarios', labelKa: 'სცენარები', icon: BarChart3, href: '/scenarios' },
  { label: 'Line Items', labelKa: 'მუხლები', icon: Settings, href: '/line-items' },
  { label: 'Tax & Other', labelKa: 'გადასახადები', icon: Settings, href: '/tax-other' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { language } = useModelStore()

  return (
    <aside className="w-[220px] bg-slate-900 text-white flex flex-col h-full border-r border-white/5">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">FM</div>
          <span className="font-bold text-sm tracking-tight">Georgia</span>
        </div>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em]">Financial Model</p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{language === 'ka' ? item.labelKa : item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{language === 'ka' ? 'სტატუსი' : 'Status'}</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-slate-300">{language === 'ka' ? 'მოდელი აქტიურია' : 'Model Active'}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
