'use client'

import { useEffect, useMemo, useState } from 'react'
import { db, Patient, Todo } from '@/lib/db'
import { TodoItem } from '@/components/todo-item'
import { NavBar } from '@/components/nav-bar'
import { cn, isOverdue, isDueToday } from '@/lib/utils'

type Filter = 'all' | 'pending' | 'completed' | 'today' | 'overdue'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '??' },
  { key: 'pending', label: '???' },
  { key: 'completed', label: '???' },
  { key: 'today', label: '????' },
  { key: 'overdue', label: '???' }
]

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [filter, setFilter] = useState<Filter>('all')

  const load = async () => {
    const [t, p] = await Promise.all([db.todos.toArray(), db.patients.toArray()])
    setTodos(t)
    setPatients(p)
  }

  useEffect(() => { load() }, [])

  const filteredTodos = useMemo(() => {
    let list = todos
    if (filter === 'pending') list = list.filter((t) => t.status === 'pending')
    if (filter === 'completed') list = list.filter((t) => t.status === 'completed')
    if (filter === 'today') list = list.filter((t) => t.status === 'pending' && isDueToday(t.dueDate))
    if (filter === 'overdue') list = list.filter((t) => t.status === 'pending' && isOverdue(t.dueDate))
    return [...list].sort((a, b) => {
      const aOverdue = a.status === 'pending' && isOverdue(a.dueDate) ? 3 : a.status === 'pending' && isDueToday(a.dueDate) ? 2 : a.dueDate ? 1 : 0
      const bOverdue = b.status === 'pending' && isOverdue(b.dueDate) ? 3 : b.status === 'pending' && isDueToday(b.dueDate) ? 2 : b.dueDate ? 1 : 0
      if (aOverdue !== bOverdue) return bOverdue - aOverdue
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      return b.createdAt - a.createdAt
    })
  }, [todos, filter])

  const handleToggle = async (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const completed = todo.status === 'completed'
    await db.todos.update(id, {
      status: completed ? 'pending' : 'completed',
      completedAt: completed ? undefined : Date.now()
    })
    if (todo.type === '??' && !completed) {
      const patient = patients.find((p) => p.id === todo.patientId)
      if (patient) {
        await db.patients.update(patient.id, { lastDressingChange: new Date().toISOString().split('T')[0], updatedAt: Date.now() })
      }
    }
    load()
  }

  const handleDelete = async (id: string) => {
    await db.todos.delete(id)
    load()
  }

  return (
    <main className="min-h-screen pb-24 px-4 pt-4 bg-surface">
      <h1 className="text-xl font-bold text-main mb-4">??</h1>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors',
              filter === f.key ? 'bg-primary text-white border-primary' : 'bg-card text-muted border-custom'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filteredTodos.map((t) => (
          <TodoItem key={t.id} todo={t} patient={patients.find((p) => p.id === t.patientId)} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
        {filteredTodos.length === 0 && (
          <div className="text-center text-muted py-12 text-sm">????</div>
        )}
      </div>
      <NavBar />
    </main>
  )
}
