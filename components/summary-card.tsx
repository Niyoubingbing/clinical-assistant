 'use client'
 
 import { Patient, Todo } from '@/lib/db'
 import { formatDate, today, copyToClipboard } from '@/lib/utils'
 import { Copy } from 'lucide-react'
 import { toast } from '@/components/toast'
 
 interface SummaryCardProps {
   patients: Patient[]
   todos: Todo[]
 }
 
 export function SummaryCard({ patients, todos }: SummaryCardProps) {
   const completedToday = todos.filter((t) => t.status === 'completed' && t.completedAt && formatDate(new Date(t.completedAt)) === today())
   const dressingToday = completedToday.filter((t) => t.type === '??')
   const bloodToday = completedToday.filter((t) => t.type === '??')
 
   const lines = [`${today()} ????`]
   if (dressingToday.length) lines.push(`???${dressingToday.length} ?`)
   if (bloodToday.length) lines.push(`???${bloodToday.length} ?`)
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
       lines.push(`${p.bedNumber} ${p.name}?${arr.map((t) => t.content).join('?')}`)
     })
   }
   const text = lines.join('\n')
 
   return (
     <div className="bg-card rounded-xl border border-custom p-4">
       <div className="flex items-center justify-between mb-2">
         <h3 className="font-semibold text-main">????</h3>
         <button
           onClick={() => { copyToClipboard(text); toast('?????') }}
           className="flex items-center gap-1 text-sm text-primary"
         >
           <Copy className="w-4 h-4" /> ??
         </button>
       </div>
       <div className="text-sm text-main whitespace-pre-line">{text}</div>
     </div>
   )
 }
