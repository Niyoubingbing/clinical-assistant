'use client'

import { useEffect, useMemo, useState } from 'react'
import { db, Settings, getSettings, saveSettings, QuickTodo, Patient } from '@/lib/db'
import { NavBar } from '@/components/nav-bar'
import { useTheme } from '@/components/providers'
import { toast } from '@/components/toast'
import { cn, today } from '@/lib/utils'
import { Sun, Moon, Monitor, Download, Upload, Trash2, Plus, X, GripVertical } from 'lucide-react'

const THEME_OPTIONS = [
  { key: 'light', label: '浅色', icon: Sun },
  { key: 'dark', label: '深色', icon: Moon },
  { key: 'system', label: '系统', icon: Monitor }
] as const

function sortPatients(patients: Patient[]) {
  return [...patients].sort((a, b) => {
    const na = parseInt(a.bedNumber.match(/\d+/)?.[0] || '0', 10)
    const nb = parseInt(b.bedNumber.match(/\d+/)?.[0] || '0', 10)
    if (na !== nb) return na - nb
    return a.bedNumber.localeCompare(b.bedNumber)
  })
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [defaultOrder, setDefaultOrder] = useState<string[]>([])
  const { theme, setTheme } = useTheme()
  const [orderText, setOrderText] = useState('')
  const [newQuickLabel, setNewQuickLabel] = useState('')
  const [newQuickType, setNewQuickType] = useState('其他')

  const load = async () => {
    const [s, p] = await Promise.all([getSettings(), db.patients.toArray()])
    setSettings(s)
    setPatients(p)
    const sorted = sortPatients(p)
    setDefaultOrder(sorted.map((x) => x.bedNumber))
    setOrderText((s.roundingOrder || []).join('\n'))
  }

  useEffect(() => { load() }, [])

  const preview = useMemo(() => {
    const explicit = orderText.split('\n').map((l) => l.trim()).filter(Boolean)
    const seen = new Set<string>()
    const ordered: Patient[] = []
    for (const bed of explicit) {
      if (seen.has(bed)) continue
      const p = patients.find((x) => x.bedNumber === bed)
      if (p) {
        ordered.push(p)
        seen.add(bed)
      }
    }
    const sorted = sortPatients(patients)
    for (const p of sorted) {
      if (!seen.has(p.bedNumber)) {
        ordered.push(p)
        seen.add(p.bedNumber)
      }
    }
    return ordered
  }, [orderText, patients])

  const handleThemeChange = async (t: 'light' | 'dark' | 'system') => {
    setTheme(t)
    await saveSettings({ theme: t })
    toast('主题已更新')
  }

  const handleSaveOrder = async () => {
    const order = orderText.split('\n').map((l) => l.trim()).filter(Boolean)
    await saveSettings({ roundingOrder: order })
    toast('查房顺序已保存')
  }

  const handleResetOrder = async () => {
    const order = defaultOrder
    setOrderText(order.join('\n'))
    await saveSettings({ roundingOrder: order })
    toast('已重置为默认顺序')
  }

  const handleAddQuickTodo = async () => {
    if (!newQuickLabel.trim()) return
    const s = await getSettings()
    const next: QuickTodo = { label: newQuickLabel.trim(), type: newQuickType, content: newQuickLabel.trim() }
    await saveSettings({ quickTodos: [...s.quickTodos, next] })
    setNewQuickLabel('')
    load()
  }

  const handleDeleteQuickTodo = async (idx: number) => {
    const s = await getSettings()
    const next = [...s.quickTodos]
    next.splice(idx, 1)
    await saveSettings({ quickTodos: next })
    load()
  }

  const handleMoveQuickTodo = async (idx: number, dir: number) => {
    const s = await getSettings()
    const next = [...s.quickTodos]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    const [item] = next.splice(idx, 1)
    next.splice(target, 0, item)
    await saveSettings({ quickTodos: next })
    load()
  }

  const handleExport = async () => {
    const patients = await db.patients.toArray()
    const todos = await db.todos.toArray()
    const blob = new Blob([JSON.stringify({ patients, todos, exportedAt: Date.now() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clinical-care-${today()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('数据已导出')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      if (!confirm(`将导入 ${data.patients?.length || 0} 位病人和 ${data.todos?.length || 0} 条待办，现有数据将被覆盖，确认吗？`)) return
      await db.patients.clear()
      await db.todos.clear()
      if (data.patients?.length) await db.patients.bulkAdd(data.patients)
      if (data.todos?.length) await db.todos.bulkAdd(data.todos)
      toast('数据已导入')
      load()
    } catch (err) {
      toast('导入失败，文件格式错误', 'error')
    }
  }

  const handleClear = async () => {
    if (!confirm('确定清除所有数据？此操作不可恢复。')) return
    await db.patients.clear()
    await db.todos.clear()
    await saveSettings({ roundingOrder: [], quickTodos: [] })
    toast('数据已清除')
    load()
  }

  if (!settings) return null

  return (
    <main className="min-h-screen pb-24 px-4 pt-4 bg-surface">
      <h1 className="text-xl font-bold text-main mb-4">设置</h1>
      <div className="space-y-6">
        <section className="bg-card rounded-xl border border-custom p-4">
          <h2 className="font-semibold text-main mb-3">主题</h2>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.key}
                  onClick={() => handleThemeChange(t.key)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm transition-colors',
                    theme === t.key ? 'bg-primary text-white border-primary' : 'border-custom text-main'
                  )}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              )
            })}
          </div>
        </section>

        <section className="bg-card rounded-xl border border-custom p-4">
          <h2 className="font-semibold text-main mb-3">查房顺序</h2>
          <p className="text-xs text-muted mb-2">每行一个床号，列表将按此顺序排列。</p>
          <textarea
            value={orderText}
            onChange={(e) => setOrderText(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-custom bg-surface p-3 text-sm text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="mt-2 text-xs text-muted">
            <span className="font-medium text-main">预览：</span>
            {preview.length > 0 ? preview.map((p) => `${p.bedNumber} ${p.name}`).join(' → ') : '无病人'}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleResetOrder} className="flex-1 py-2.5 rounded-xl border border-custom text-main text-sm font-medium">重置为默认顺序</button>
            <button onClick={handleSaveOrder} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium">保存顺序</button>
          </div>
        </section>

        <section className="bg-card rounded-xl border border-custom p-4">
          <h2 className="font-semibold text-main mb-3">快捷待办</h2>
          <div className="space-y-2 mb-3">
            {settings.quickTodos.map((qt, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-main">
                <GripVertical className="w-4 h-4 text-muted" />
                <span className="flex-1">{qt.label} <span className="text-muted">({qt.type})</span></span>
                <button onClick={() => handleMoveQuickTodo(idx, -1)} className="p-1 text-muted">↑</button>
                <button onClick={() => handleMoveQuickTodo(idx, 1)} className="p-1 text-muted">↓</button>
                <button onClick={() => handleDeleteQuickTodo(idx)} className="p-1 text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newQuickLabel}
              onChange={(e) => setNewQuickLabel(e.target.value)}
              placeholder="标签"
              className="flex-1 rounded-xl border border-custom bg-surface p-2.5 text-sm text-main"
            />
            <select
              value={newQuickType}
              onChange={(e) => setNewQuickType(e.target.value)}
              className="rounded-xl border border-custom bg-surface p-2.5 text-sm text-main"
            >
              <option>换药</option>
              <option>查血</option>
              <option>其他</option>
            </select>
            <button onClick={handleAddQuickTodo} className="px-3 rounded-xl bg-primary text-white"><Plus className="w-4 h-4" /></button>
          </div>
        </section>

        <section className="bg-card rounded-xl border border-custom p-4">
          <h2 className="font-semibold text-main mb-3">数据管理</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleExport} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-custom text-main text-sm">
              <Download className="w-4 h-4" /> 导出
            </button>
            <label className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-custom text-main text-sm cursor-pointer">
              <Upload className="w-4 h-4" /> 导入
              <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
            </label>
          </div>
          <button onClick={handleClear} className="mt-3 w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> 清除所有数据
          </button>
        </section>
      </div>
      <NavBar />
    </main>
  )
}
