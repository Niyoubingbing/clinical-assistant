 'use client'
 
 import { motion, AnimatePresence } from 'framer-motion'
 import { cn } from '@/lib/utils'
 import { X } from 'lucide-react'
 
 interface BottomSheetProps {
   open: boolean
   onClose: () => void
   title?: string
   children: React.ReactNode
   className?: string
 }
 
 export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
   return (
     <AnimatePresence>
       {open && (
         <>
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/40 z-40"
             onClick={onClose}
           />
           <motion.div
             initial={{ y: '100%' }}
             animate={{ y: 0 }}
             exit={{ y: '100%' }}
             transition={{ type: 'spring', damping: 25, stiffness: 300 }}
             className={cn(
               'fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card p-4 shadow-2xl border-t border-custom',
               className
             )}
           >
             <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted/30" />
             <div className="flex items-center justify-between mb-4">
               {title ? <h2 className="text-lg font-semibold text-main">{title}</h2> : <div />}
               <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/10">
                 <X className="w-5 h-5 text-muted" />
               </button>
             </div>
             {children}
           </motion.div>
         </>
       )}
     </AnimatePresence>
   )
 }
