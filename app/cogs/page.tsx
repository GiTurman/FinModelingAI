'use client'
// app/cogs/page.tsx
import { useModelStore } from '@/store/modelStore'
import { fmtGEL } from '@/lib/calculations'
import { Plus, Trash2, Package, Info } from 'lucide-react'

export default function CogsPage() {
  const { salesItems, cogsItems, addCogsItem, updateCogsItem, removeCogsItem } = useModelStore()

  return (
    <div className="page-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">COGS Schedule</h1>
          <p className="text-xs text-slate-400 mt-1">პირდაპირი ხარჯები პროდუქტების მიხედვით (Unit Cost)</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-xl border border-blue-100 dark:border-blue-800">
          <Info size={14} className="text-blue-500" />
          <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-tight">
            აქ დაამატეთ ხარჯები, რომლებიც პირდაპირ კავშირშია პროდუქტის ერთეულთან.<br/>
            ჯამური COGS = (Unit Cost) × (Sold Units)
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {salesItems.map((product) => {
          const productCogs = cogsItems.filter(c => c.salesItemId === product.id)
          const totalUnitCost = productCogs.reduce((sum, c) => sum + c.unitCost, 0)

          return (
            <div key={product.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              {/* Product Header */}
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{product.name}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Product / Service</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Unit Cost</p>
                  <p className="text-lg font-mono font-bold text-orange-600 dark:text-orange-400">{fmtGEL(totalUnitCost, true)}</p>
                </div>
              </div>

              {/* Cost Components */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  {productCogs.length > 0 ? (
                    productCogs.map((cogs) => (
                      <div key={cogs.id} className="flex items-center gap-4 group">
                        <input
                          value={cogs.name}
                          onChange={(e) => updateCogsItem(cogs.id, { name: e.target.value })}
                          placeholder="Cost component name (e.g. Raw Material)..."
                          className="flex-1 text-sm bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-orange-500 outline-none py-1 transition-colors"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Unit Cost:</span>
                          <input
                            type="number"
                            value={cogs.unitCost}
                            onChange={(e) => updateCogsItem(cogs.id, { unitCost: Number(e.target.value) })}
                            className="w-24 text-right text-sm font-mono font-semibold text-orange-600 dark:text-orange-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                        <button 
                          onClick={() => removeCogsItem(cogs.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">ხარჯის კომპონენტები არ არის დამატებული</p>
                  )}
                </div>

                <button
                  onClick={() => addCogsItem({ salesItemId: product.id, name: 'New Cost Component', unitCost: 0 })}
                  className="flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors"
                >
                  <Plus size={14} /> ხარჯის კომპონენტის დამატება
                </button>
              </div>
            </div>
          )
        })}

        {salesItems.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 text-sm">ჯერ დაამატეთ პროდუქტები გაყიდვების გვერდზე</p>
          </div>
        )}
      </div>
    </div>
  )
}
