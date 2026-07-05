'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Patient, Todo } from '@/lib/db'
import { relativeDaysLabel, isOverdue, isDueToday, isDressingDue, isBloodTestDue } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { FileText, Droplet, Stethoscope, Users, Trash2 } from 'lucide-react'

interface PatientCardProps {
  patient: Patient
  todos: Todo[]
  onDelete?: (patient: Patient) => void
  onChangeGroup?: (patient: Patient, group: string) => void
}

export function PatientCard({ patient, todos, onDelete, onChangeGroup }: PatientCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = todos.filter((t) => t.status === 'pending')
  const dueToday = pending.filter((t) => isDueToday(t.dueDate))
  const overdue = pending.filter((t) => isOverdue(t.dueDate))
  const dressingDue = isDressingDue(patient)
  const bloodDue = isBloodTestDue(patient)

  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => setMenuOpen(true), 500)
  }
  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuOpen(true)
  }

  const handleChangeGroup = () => {
    const group = prompt('请输入新分组', patient.group || '')
    if (group !== null && onChangeGroup) {
      onChangeGroup(patient, group.trim())
    }
    setMenuOpen(false)
  }

  const handleDelete = () => {
    if (confirm('确定删除该病人？相关待办也会被删除。')) {
      onDelete?.(patient)
    }
    setMenuOpen(false)
  }

  return (
    <>
      <Link href={`/patient/${patient.id}`}>
        <div
          className="bg-card rounded-xl border border-custom p-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
          onContextMenu={handleContextMenu}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchMove={cancelLongPress}
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ backgroundColor: patient.groupColor || '#e2e8f0', color: '#1e293b' }}
          >
            {patient.bedNumber}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-main truncate">{patient.name}</span>
              <span className="text-xs text-muted truncate">{patient.diagnosis}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
              {patient.group && (
                <span className="px-1.5 py-0.5 rounded bg-muted/10 text-muted">{patient.group}</span>
              )}
              {pending.length > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {pending.length}
                </span>
              )}
              {(dueToday.length > 0 || overdue.length > 0) && (
                <span className={cn('px-1.5 py-0.5 rounded', overdue.length > 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600')}>
                  {overdue.length > 0 ? `逾期 ${overdue.length}` : `今天 ${dueToday.length}`}
                </span>
              )}
              {dressingDue && (
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 flex items-center gap-1">
                  <Droplet className="w-3 h-3" /> 换药
                </span>
              )}
              {bloodDue && (
                <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" /> 查血
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setMenuOpen(false)}>
          <div className="bg-card rounded-xl border border-custom p-2 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleChangeGroup} className="flex items-center gap-2 w-full px-3 py-3 text-sm text-main rounded-lg hover:bg-muted/10">
              <Users className="w-4 h-4" /> 更改分组
            </button>
            <button onClick={handleDelete} className="flex items-center gap-2 w-full px-3 py-3 text-sm text-red-500 rounded-lg hover:bg-red-50">
              <Trash2 className="w-4 h-4" /> 删除病人
            </button>
          </div>
        </div>
      )}
    </>
  )
}
