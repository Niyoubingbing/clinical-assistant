 'use client'
 
 import { cn } from '@/lib/utils'
 
 export function GroupFilter({ groups, active, onChange }: { groups: string[]; active: string; onChange: (g: string) => void }) {
   if (groups.length === 0) return null
   const all = ['全部', ...groups]
   return (
     <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
       {all.map((g) => (
         <button
           key={g}
           onClick={() => onChange(g === '全部' ? '' : g)}
           className={cn(
             'shrink-0 px-3 py-1 rounded-full text-sm border transition-colors',
             active === (g === '全部' ? '' : g)
               ? 'bg-primary text-white border-primary'
               : 'bg-card text-muted border-custom'
           )}
         >
           {g}
         </button>
       ))}
     </div>
   )
 }
