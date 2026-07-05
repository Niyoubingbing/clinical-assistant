 'use client'
 
 import { Patient, Todo } from '@/lib/db'
import { formatDate, today, copyToClipboard } from '@/lib/utils'
import { Copy, FileJson } from 'lucide-react'
import { toast } from '@/components/toast'
 
 interface SummaryCardProps {
   patients: Patient[]
   todos: Todo[]
 }
 
 export function SummaryCard({ patients, todos }: SummaryCardProps) {
   const completedToday = todos.filter((t) => t.status === 'completed' && t.completedAt && formatDate(new Date(t.completedAt)) === today())
   const dressingToday = completedToday.filter((t) => t.type === '换药')
   const bloodToday = completedToday.filter((t) => t.type === '查血')
 
   const lines = [`${today()} 工作小结`]
   if (dressingToday.length) lines.push(`换药：${dressingToday.length} 项`)
   if (bloodToday.length) lines.push(`查血：${bloodToday.length} 项`)
   if (completedToday.length) {
     lines.push('')
     const byPatient = new Map<string, Todo[]>()
     completedToday.forEach((t) => {
       const arr = byPatient.get(t.patientId) || []
       arr.push(t)
       byPatient.set(t.patientId, arr)
     })
     byPatient.forEach((arr, pid) => {
       const p = patients.find((x) => x.id === pid)
       if (!p) return
       lines.push(`${p.bedNumber} ${p.name}：${arr.map((t) => t.content).join('，')}`)
     })
   }
  const text = lines.join('\n')

  const handleExportJSON = () => {
    const byPatient = new Map<string, Todo[]>()
    completedToday.forEach((t) => {
      const arr = byPatient.get(t.patientId) || []
      arr.push(t)
      byPatient.set(t.patientId, arr)
    })
    const payload = {
      date: today(),
      dressing: dressingToday.length,
      bloodTest: bloodToday.length,
      patients: Array.from(byPatient.entries()).map(([pid, arr]) => {
        const p = patients.find((x) => x.id === pid)
        return {
          bedNumber: p?.bedNumber || '',
          name: p?.name || '未知',
          todos: arr.map((t) => t.content)
        }
      })
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${today()}-summary.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
     <div className="bg-card rounded-xl border border-custom p-4">
       <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-main">每日小结</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { copyToClipboard(text); toast('小结已复制') }}
            className="flex items-center gap-1 text-sm text-primary"
          >
            <Copy className="w-4 h-4" /> 复制
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 text-sm text-primary"
          >
            <FileJson className="w-4 h-4" /> JSON
          </button>
        </div>
       </div>
       <div className="text-sm text-main whitespace-pre-line">{text}</div>
     </div>
   )
 }
