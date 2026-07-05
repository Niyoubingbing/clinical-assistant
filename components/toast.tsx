'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

let toastId = 0
type ToastType = 'success' | 'error' | 'info'
interface ToastMessage { id: number; text: string; type: ToastType; action?: { label: string; onClick: () => void } }
const listeners = new Set<(toasts: ToastMessage[]) => void>()
let toasts: ToastMessage[] = []

function notify(text: string, type: ToastType = 'info', action?: { label: string; onClick: () => void }) {
  toastId++
  const id = toastId
  toasts = [...toasts, { id, text, type, action }]
  listeners.forEach((l) => l([...toasts]))
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    listeners.forEach((l) => l([...toasts]))
  }, 4000)
}

export function toast(text: string, type: ToastType = 'info', action?: { label: string; onClick: () => void }) {
  notify(text, type, action)
}

export function Toaster() {
  const [list, setList] = useState<ToastMessage[]>([])
  useEffect(() => {
    listeners.add(setList)
    return () => { listeners.delete(setList) }
  }, [])
  const dismiss = (id: number) => {
    toasts = toasts.filter((t) => t.id !== id)
    listeners.forEach((l) => l([...toasts]))
  }
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
              'px-4 py-2 rounded-full text-sm shadow-lg pointer-events-auto flex items-center ' +
              (t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'error' ? 'bg-red-500 text-white' : 'bg-card text-main border border-custom')
            }
          >
            {t.text}
            {t.action && (
              <button
                onClick={() => { t.action!.onClick(); dismiss(t.id) }}
                className="ml-3 underline font-medium"
              >
                {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
