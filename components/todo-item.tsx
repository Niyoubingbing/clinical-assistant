 'use client'
 
 import { Todo, Patient } from '@/lib/db'
 import { relativeDaysLabel, isOverdue, isDueToday, cn } from '@/lib/utils'
 import { Check, Trash2 } from 'lucide-react'
 import { useState } from 'react'
 
 interface TodoItemProps {
   todo: Todo
   patient?: Patient
   onToggle: (id: string) => void
   onDelete: (id: string) => void
 }
 
 export function TodoItem({ todo, patient, onToggle, onDelete }: TodoItemProps) {
   const [showActions, setShowActions] = useState(false)
   const label = relativeDaysLabel(todo.dueDate)
   const overdue = isOverdue(todo.dueDate)
   const dueToday = isDueToday(todo.dueDate)
 
   return (
     <div
       className={cn(
         'flex items-center gap-3 p-3 rounded-xl border transition-all bg-card',
         overdue ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : dueToday ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20' : 'border-custom'
       )}
     >
       <button
         onClick={() => onToggle(todo.id)}
         className={cn(
           'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0',
           todo.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-muted'
         )}
       >
         {todo.status === 'completed' && <Check className="w-3.5 h-3.5 text-white" />}
       </button>
       <div className="flex-1 min-w-0">
         {patient && (
           <div className="text-xs text-muted mb-0.5">
             {patient.bedNumber} {patient.name}
           </div>
         )}
         <div className={cn('text-sm text-main', todo.status === 'completed' && 'line-through text-muted')}>
           {todo.content}
         </div>
         {label && (
           <div className={cn('text-xs mt-0.5', overdue ? 'text-red-600' : dueToday ? 'text-orange-600' : 'text-muted')}>
             {label}
           </div>
         )}
       </div>
       <button onClick={() => onDelete(todo.id)} className="p-2 text-muted hover:text-red-500">
         <Trash2 className="w-4 h-4" />
       </button>
     </div>
   )
 }
