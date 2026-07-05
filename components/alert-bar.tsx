'use client'

import Link from 'next/link'
import { Patient, Todo } from '@/lib/db'
import { isDueToday, isOverdue, isDressingDue, isBloodTestDue, cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface AlertBarProps {
  patients: Patient[]
  todos: Todo[]
}

export function AlertBar({ patients, todos }: AlertBarProps) {
  const dueToday = todos.filter((t) => t.status === 'pending' && isDueToday(t.dueDate)).length
  const overdue = todos.filter((t) => t.status === 'pending' && isOverdue(t.dueDate)).length
  const dressingDue = patients.filter((p) => isDressingDue(p)).length
  const bloodDue = patients.filter((p) => isBloodTestDue(p)).length

  if (dueToday === 0 && overdue === 0 && dressingDue === 0 && bloodDue === 0) return null

  const parts: string[] = []
  if (dressingDue > 0) parts.push(`${dressingDue} 人需换药`)
  if (bloodDue > 0) parts.push(`${bloodDue} 人需查血`)
  if (dueToday > 0) parts.push(`${dueToday} 个待办今天到期`)
  if (overdue > 0) parts.push(`${overdue} 个待办已逾期`)

  return (
    <Link href="/todos">
      <div className={cn(
        'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium',
        overdue > 0 ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
      )}>
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>{parts.join('，')}</span>
      </div>
    </Link>
  )
}
