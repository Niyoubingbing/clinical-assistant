'use client'

import { useEffect, useMemo, useState } from 'react'
import { db, Patient, Todo, Settings, getSettings } from '@/lib/db'
import { AlertBar } from '@/components/alert-bar'
import { SummaryCard } from '@/components/summary-card'
import { GroupFilter } from '@/components/group-filter'
import { SearchInput } from '@/components/search-input'
import { PatientCard } from '@/components/patient-card'
import { FabMenu } from '@/components/fab-menu'
import { BottomSheet } from '@/components/bottom-sheet'
import { PatientForm } from '@/components/patient-form'
import { ImportDialog } from '@/components/import-dialog'
import { NavBar } from '@/components/nav-bar'
import { matchesSearch } from '@/lib/pinyin'
import { toast } from '@/components/toast'

export default function HomePage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('')
  const [sheet, setSheet] = useState<'patient' | 'import' | null>(null)
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>()

  const load = async () => {
    const [p, t, s] = await Promise.all([db.patients.toArray(), db.todos.toArray(), getSettings()])
    setPatients(p)
    setTodos(t)
    setSettings(s)
  }

  useEffect(() => { load() }, [])

  const groups = useMemo(() => Array.from(new Set(patients.map((p) => p.group).filter(Boolean))) as string[], [patients])

  const filteredPatients = useMemo(() => {
    let list = patients
    if (group) list = list.filter((p) => p.group === group)
    if (search.trim()) {
      const q = search.trim()
      list = list.filter((p) => matchesSearch(q, p.name) || matchesSearch(q, p.bedNumber) || matchesSearch(q, p.diagnosis))
    }
    const order = settings?.roundingOrder || []
    const orderIndex = (bed: string) => { const idx = order.indexOf(bed); return idx === -1 ? Infinity : idx }
    return [...list].sort((a, b) => {
      const ai = orderIndex(a.bedNumber)
      const bi = orderIndex(b.bedNumber)
      if (ai !== bi) return ai - bi
      return a.bedNumber.localeCompare(b.bedNumber, undefined, { numeric: true })
    })
  }, [patients, group, search, settings])

  const handleOpenAddPatient = () => { setEditingPatient(undefined); setSheet('patient') }
  const handleOpenImport = () => setSheet('import')
  const handleOpenGlobalTodo = () => {
    const content = prompt('请输入通用待办内容（例如：全院查血）')
    if (!content?.trim()) return
    Promise.all(patients.map((p) => db.todos.add({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      patientId: p.id,
      content: content.trim(),
      type: '其他',
      status: 'pending',
      createdAt: Date.now()
    }))).then(() => {
      load()
      toast('通用待办已添加')
    })
  }

  return (
    <main className="min-h-screen pb-24 px-4 pt-4 bg-surface">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-main">查房</h1>
        <AlertBar todos={todos} />
        <SummaryCard patients={patients} todos={todos} />
        <SearchInput value={search} onChange={setSearch} />
        <GroupFilter groups={groups} active={group} onChange={setGroup} />
        <div className="grid gap-3">
          {filteredPatients.map((p) => (
            <PatientCard key={p.id} patient={p} todos={todos.filter((t) => t.patientId === p.id)} />
          ))}
          {filteredPatients.length === 0 && (
            <div className="text-center text-muted py-12 text-sm">暂无病人</div>
          )}
        </div>
      </div>
      <FabMenu onAddPatient={handleOpenAddPatient} onImport={handleOpenImport} onAddGlobalTodo={handleOpenGlobalTodo} />
      <BottomSheet open={sheet === 'patient'} onClose={() => setSheet(null)} title={editingPatient ? '编辑病人' : '添加病人'}>
        <PatientForm patient={editingPatient} onSaved={() => { load(); setSheet(null) }} onCancel={() => setSheet(null)} />
      </BottomSheet>
      <BottomSheet open={sheet === 'import'} onClose={() => setSheet(null)} title="批量导入">
        <ImportDialog onClose={() => setSheet(null)} onImported={() => { load(); setSheet(null) }} />
      </BottomSheet>
      <NavBar />
    </main>
  )
}
