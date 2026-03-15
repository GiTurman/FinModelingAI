'use client'
// components/dashboard/KPICard.tsx
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  accent: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal'
  change?: string
}

const COLORS = {
  blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
  green: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
  red: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800',
  purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
  orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800',
  teal: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800',
}

export default function KPICard({ title, value, icon: Icon, accent, change }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all ${COLORS[accent].split(' ').slice(2).join(' ')}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${COLORS[accent].split(' ').slice(0,2).join(' ')}`}>
          <Icon size={20} />
        </div>
        {change && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${change.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <div className="kpi-val text-slate-800 dark:text-white truncate">{value}</div>
    </motion.div>
  )
}
