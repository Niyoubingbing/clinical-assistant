 'use client'
 
 import { useState } from 'react'
 import { motion, AnimatePresence } from 'framer-motion'
 import { Plus, UserPlus, FileInput, ClipboardList } from 'lucide-react'
 import { cn } from '@/lib/utils'
 
 interface FabMenuProps {
   onAddPatient: () => void
   onImport: () => void
   onAddGlobalTodo: () => void
 }
 
 export function FabMenu({ onAddPatient, onImport, onAddGlobalTodo }: FabMenuProps) {
   const [open, setOpen] = useState(false)
 
   const items = [
     { label: '添加病人', icon: UserPlus, onClick: onAddPatient },
     { label: '批量导入', icon: FileInput, onClick: onImport },
     { label: '通用待办', icon: ClipboardList, onClick: onAddGlobalTodo }
   ]
 
   return (
     <div className="fixed bottom-16 right-4 z-40 flex flex-col items-end gap-3">
       <AnimatePresence>
         {open && (
           <>
             {items.map((item, i) => {
               const Icon = item.icon
               return (
                 <motion.button
                   key={item.label}
                   initial={{ opacity: 0, y: 20, scale: 0.8 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 20, scale: 0.8 }}
                   transition={{ delay: i * 0.05 }}
                   onClick={() => { item.onClick(); setOpen(false) }}
                   className="flex items-center gap-2"
                 >
                   <span className="text-sm text-main bg-card border border-custom px-2 py-1 rounded-lg shadow-sm">{item.label}</span>
                   <div className="w-10 h-10 rounded-full bg-card border border-custom flex items-center justify-center text-main shadow-sm">
                     <Icon className="w-4 h-4" />
                   </div>
                 </motion.button>
               )
             })}
           </>
         )}
       </AnimatePresence>
       <button
         onClick={() => setOpen(!open)}
         className={cn(
           'w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-transform',
           open && 'rotate-45'
         )}
       >
         <Plus className="w-6 h-6" />
       </button>
     </div>
   )
 }
