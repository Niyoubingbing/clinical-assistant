 'use client'
 
 import { useState, useEffect } from 'react'
 import { motion, AnimatePresence } from 'framer-motion'
 
 let toastId = 0
 type ToastType = 'success' | 'error' | 'info'
 interface ToastMessage { id: number; text: string; type: ToastType }
 const listeners = new Set<(toasts: ToastMessage[]) => void>()
 let toasts: ToastMessage[] = []
 
 function notify(text: string, type: ToastType = 'info') {
   toastId++
   toasts = [...toasts, { id: toastId, text, type }]
   listeners.forEach((l) => l([...toasts]))
   setTimeout(() => {
     toasts = toasts.filter((t) => t.id !== toastId)
     listeners.forEach((l) => l([...toasts]))
   }, 2500)
 }
 
 export function toast(text: string, type: ToastType = 'info') {
   notify(text, type)
 }
 
 export function Toaster() {
   const [list, setList] = useState<ToastMessage[]>([])
   useEffect(() => {
     listeners.add(setList)
     return () => { listeners.delete(setList) }
   }, [])
   return (
     <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
       <AnimatePresence>
         {list.map((t) => (
           <motion.div
             key={t.id}
             initial={{ opacity: 0, y: -12 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -12 }}
             className={
               'px-4 py-2 rounded-full text-sm shadow-lg pointer-events-auto ' +
               (t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'error' ? 'bg-red-500 text-white' : 'bg-card text-main border border-custom')
             }
           >
             {t.text}
           </motion.div>
         ))}
       </AnimatePresence>
     </div>
   )
 }
