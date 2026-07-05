'use client'

import { Todo, Patient } from '@/lib/db'
import { relativeDaysLabel, isOverdue, isDueToday, cn } from '@/lib/utils'
import { Check, Trash2 } from 'lucide-react'
import { useState, useRef } from 'react'

interface TodoItemProps {
  todo: Todo
  patient?: Patient
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onClick?: (todo: Todo) => void
}

export function TodoItem({ todo, patient, onToggle, onDelete, onClick }: TodoItemProps) {
  const [swiped, setSwiped] = useState(false)
  const touchStartX = useRef(0)
  const label = relativeDaysLabel(todo.dueDate)
  const overdue = isOverdue(todo.dueDate)
  const dueToday = isDueToday(todo.dueDate)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (diff < -50) setSwiped(true)
    if (diff > 50) setSwiped(false)
  }

  return (
    <div className="relative overflow-hidden rounded-xl" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="absolute inset-y-0 right-0 flex items-center justify-end gap-2 px-3 bg-red-50 dark:bg-red-950/20">
        <button
          onClick={() => { onDelete(todo.id); setSwiped(false) }}
          className="p-2 text-red-500 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl border transition-transform bg-card',
          overdue ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : dueToday ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20' : 'border-custom'
        )}
        style={{ transform: swiped ? 'translateX(-80px)' : 'translateX(0)' }}
        onClick={(e) => {
          if (swiped) {
            setSwiped(false)
            return
          }
          onClick?.(todo)
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(todo.id) }}
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
      </div>
    </div>
  )
}
