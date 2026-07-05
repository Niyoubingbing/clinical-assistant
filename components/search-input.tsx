 'use client'
 
 import { Search, X } from 'lucide-react'
 
 export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
   return (
     <div className="relative">
       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
       <input
         type="text"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder || '??????????...'}
         className="w-full h-10 pl-9 pr-8 rounded-xl bg-card border border-custom text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-main"
       />
       {value && (
         <button onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5">
           <X className="w-4 h-4 text-muted" />
         </button>
       )}
     </div>
   )
 }
