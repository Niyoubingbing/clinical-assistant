 'use client'
 
 import { useState } from 'react'
 import { Patient, db, generateId } from '@/lib/db'
 import { toast } from '@/components/toast'
 
 interface ImportDialogProps {
   onClose: () => void
   onImported: () => void
 }
 
 function PreviewList({
   title,
   patients,
   colorClass,
   borderClass,
   bgClass
 }: {
   title: string
   patients: Patient[]
   colorClass: string
   borderClass: string
   bgClass?: string
 }) {
   if (patients.length === 0) return null
   return (
     <div>
       <div className={`font-medium mb-1 ${colorClass}`}>{title} {patients.length} 人</div>
       <div className={`space-y-1 max-h-32 overflow-y-auto rounded-lg border p-2 ${borderClass} ${bgClass || 'bg-card'}`}>
         {patients.map((p) => (
           <div key={p.id} className="text-xs text-main truncate">
             {p.bedNumber} {p.name} {p.diagnosis}
           </div>
         ))}
       </div>
     </div>
   )
 }
 
 export function ImportDialog({ onClose, onImported }: ImportDialogProps) {
   const [text, setText] = useState('')
   const [preview, setPreview] = useState<{ toAdd: Patient[]; toUpdate: Patient[]; toDelete: Patient[] } | null>(null)
 
   const parseRows = () => {
     const rows = text.split('\n').map((l) => l.trim()).filter(Boolean)
     return rows
       .map((row) => {
         const parts = row.split(/\s+/)
         const bedNumber = parts[0] || ''
         const name = parts[1] || ''
         const diagnosis = parts.slice(2).join(' ') || ''
         return { bedNumber, name, diagnosis }
       })
       .filter((r) => r.name && r.bedNumber)
   }
 
   const handlePreview = async () => {
     const rows = parseRows()
     const existing = await db.patients.toArray()
     const existingByName = new Map(existing.map((p) => [p.name, p]))
     const toAdd: Patient[] = []
     const toUpdate: Patient[] = []
     const incomingNames = new Set<string>()
     const now = Date.now()
     rows.forEach((r) => {
       incomingNames.add(r.name)
       const cur = existingByName.get(r.name)
       if (cur) {
         toUpdate.push({ ...cur, ...r, updatedAt: now })
       } else {
         toAdd.push({
           id: generateId(),
           ...r,
           group: '',
           groupColor: '#e2e8f0',
           createdAt: now,
           updatedAt: now
         })
       }
     })
     const toDelete = existing.filter((p) => !incomingNames.has(p.name))
     setPreview({ toAdd, toUpdate, toDelete })
   }
 
   const handleConfirm = async () => {
     if (!preview) return
     if (preview.toDelete.length > 0) {
       if (!confirm(`将删除 ${preview.toDelete.length} 位病人，确认吗？`)) return
     }
     await db.patients.bulkPut([...preview.toAdd, ...preview.toUpdate])
     await db.patients.bulkDelete(preview.toDelete.map((p) => p.id))
     await db.todos.where('patientId').anyOf(preview.toDelete.map((p) => p.id)).delete()
     toast(`导入完成：新增 ${preview.toAdd.length} 人，更新 ${preview.toUpdate.length} 人，删除 ${preview.toDelete.length} 人`)
     onImported()
     onClose()
   }
 
   return (
     <div className="space-y-3">
       <textarea
         value={text}
         onChange={(e) => setText(e.target.value)}
         placeholder={`每行格式：床号 姓名 诊断\n例如：\n309W23 魏亿鑫 取除骨折内固定装置\n309W24 张三 胫骨骨折`}
         rows={6}
         className="w-full rounded-xl border border-custom bg-card p-3 text-sm text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
       />
       <button onClick={handlePreview} className="w-full py-2.5 rounded-xl border border-custom text-main font-medium">预览</button>
       {preview && (
         <div className="space-y-3 text-sm">
           <PreviewList title="新增" patients={preview.toAdd} colorClass="text-green-600" borderClass="border-custom" bgClass="bg-card" />
           <PreviewList title="更新" patients={preview.toUpdate} colorClass="text-blue-600" borderClass="border-custom" bgClass="bg-card" />
           <PreviewList title="删除" patients={preview.toDelete} colorClass="text-red-600" borderClass="border-red-100" bgClass="bg-red-50" />
           <button onClick={handleConfirm} className="w-full py-2.5 rounded-xl bg-primary text-white font-medium">确认导入</button>
         </div>
       )}
     </div>
   )
 }
