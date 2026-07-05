 'use client'
 
 import { QuickTodo } from '@/lib/db'
 import { cn } from '@/lib/utils'
 
 interface QuickTodoBarProps {
   quickTodos: QuickTodo[]
   onSelect: (qt: QuickTodo) => void
 }
 
 export function QuickTodoBar({ quickTodos, onSelect }: QuickTodoBarProps) {
   if (quickTodos.length === 0) return null
   return (
     <div className="flex flex-wrap gap-2">
       {quickTodos.map((qt) => (
         <button
           key={qt.label}
           onClick={() => onSelect(qt)}
           className="px-3 py-1.5 rounded-full text-sm bg-primary/10 text-primary border border-primary/20 active:scale-95 transition-transform"
         >
           + {qt.label}
         </button>
       ))}
     </div>
   )
 }
