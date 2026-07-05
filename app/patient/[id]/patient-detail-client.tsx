'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { db, Patient, Todo, Settings, getSettings } from '@/lib/db'
import { BottomSheet } from '@/components/bottom-sheet'
import { PatientForm } from '@/components/patient-form'
import { TodoForm } from '@/components/todo-form'
import { TodoItem } from '@/components/todo-item'
import { QuickTodoBar } from '@/components/quick-todo-bar'
import { toast } from '@/components/toast'
import { today } from '@/lib/utils'
import { ArrowLeft, Stethoscope, Droplet, ClipboardPlus, Pencil } from 'lucide-react'

export default function PatientDetailClient({ id: initialId }: { id: string }) {
  const params = useParams()
  const id = (params.id as string) || initialId
  const [patient, setPatient] = useState<Patient | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [sheet, setSheet] = useState<'todo' | 'edit' | null>(null)

  const load = async () => {
    const [p, t, s] = await Promise.all([
      db.patients.get(id),
      db.todos.where('patientId').equals(id).toArray(),
      getSettings()
    ])
    setPatient(p || null)
    setTodos(t)
    setSettings(s)
  }

  useEffect(() => { load() }, [id])

  const handleAddTodo = async (content: string, type: string) => {
    const existing = todos.find((t) => t.status === 'pending' && t.content === content)
    if (existing) {
      toast('该待办已存在')
      return
    }
    await db.todos.add({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      patientId: id,
      content,
      type,
      status: 'pending',
      createdAt: Date.now()
    })
    load()
    toast('已添加')
  }

  const handleQuickTodo = (qt: { label: string; type: string; content?: string }) => {
    handleAddTodo(qt.content || qt.label, qt.type)
  }

  const handleMarkDressing = async () => {
    await db.todos.add({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      patientId: id,
      content: '今日换药',
      type: '换药',
      dueDate: today(),
      status: 'pending',
      createdAt: Date.now()
    })
    await db.patients.update(id, { lastDressingChange: today(), updatedAt: Date.now() })
    load()
    toast('换药日期已更新')
  }

  const handleMarkBlood = async () => {
    await db.todos.add({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      patientId: id,
      content: '今日查血',
      type: '查血',
      dueDate: today(),
      status: 'pending',
      createdAt: Date.now()
    })
    load()
    toast('已添加查血待办')
  }

  const handleToggle = async (todoId: string) => {
    const todo = todos.find((t) => t.id === todoId)
    if (!todo) return
    const completed = todo.status === 'completed'
    await db.todos.update(todoId, {
      status: completed ? 'pending' : 'completed',
      completedAt: completed ? undefined : Date.now()
    })
    if (todo.type === '换药' && !completed) {
      await db.patients.update(id, { lastDressingChange: today(), updatedAt: Date.now() })
      toast('换药日期已更新')
    }
    load()
  }

  const handleDelete = async (todoId: string) => {
    await db.todos.delete(todoId)
    load()
  }

  if (!patient) {
    return (
      <main className="min-h-screen p-4 bg-surface flex flex-col items-center justify-center">
        <div className="text-muted text-sm mb-4">未找到病人</div>
        <Link href="/" className="text-primary">返回首页</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-24 px-4 pt-4 bg-surface">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/" className="p-2 rounded-full bg-card border border-custom">
          <ArrowLeft className="w-5 h-5 text-main" />
        </Link>
        <h1 className="text-xl font-bold text-main">{patient.name}</h1>
      </div>

      <div className="bg-card rounded-xl border border-custom p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: patient.groupColor || '#e2e8f0' }}>
            {patient.bedNumber}
          </div>
          <div>
            <div className="font-semibold text-main">{patient.diagnosis}</div>
            {patient.group && <div className="text-xs text-muted">{patient.group}</div>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted">手术日期</div>
          <div className="text-main text-right">{patient.surgeryDate || '-'}</div>
          <div className="text-muted">换药频率</div>
          <div className="text-main text-right">{patient.dressingFrequency ? `${patient.dressingFrequency} 天` : '-'}</div>
          <div className="text-muted">上次换药</div>
          <div className="text-main text-right">{patient.lastDressingChange || '-'}</div>
          <div className="text-muted">查血日期</div>
          <div className="text-main text-right">{patient.bloodTestDay || '-'}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <button onClick={handleMarkDressing} className="py-2 rounded-xl bg-card border border-custom text-sm text-main flex flex-col items-center gap-1">
          <Droplet className="w-4 h-4 text-primary" /> 换药
        </button>
        <button onClick={handleMarkBlood} className="py-2 rounded-xl bg-card border border-custom text-sm text-main flex flex-col items-center gap-1">
          <Stethoscope className="w-4 h-4 text-primary" /> 查血
        </button>
        <button onClick={() => setSheet('todo')} className="py-2 rounded-xl bg-card border border-custom text-sm text-main flex flex-col items-center gap-1">
          <ClipboardPlus className="w-4 h-4 text-primary" /> 添加待办
        </button>
      </div>

      <div className="mb-4">
        <QuickTodoBar quickTodos={settings?.quickTodos || []} onSelect={handleQuickTodo} />
      </div>

      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-main">待办</h2>
        <button onClick={() => setSheet('edit')} className="flex items-center gap-1 text-sm text-primary">
          <Pencil className="w-4 h-4" /> 编辑病人
        </button>
      </div>
      <div className="space-y-3">
        {todos.map((t) => (
          <TodoItem key={t.id} todo={t} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
        {todos.length === 0 && <div className="text-center text-muted py-8 text-sm">暂无待办</div>}
      </div>

      <BottomSheet open={sheet === 'todo'} onClose={() => setSheet(null)} title="添加待办">
        <TodoForm patientId={id} onSaved={() => { load(); setSheet(null) }} />
      </BottomSheet>
      <BottomSheet open={sheet === 'edit'} onClose={() => setSheet(null)} title="编辑病人">
        <PatientForm patient={patient} onSaved={() => { load(); setSheet(null) }} onCancel={() => setSheet(null)} />
      </BottomSheet>
    </main>
  )
}
