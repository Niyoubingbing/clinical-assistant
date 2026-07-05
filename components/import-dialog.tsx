 'use client'
 
 import { useState } from 'react'
 import { Patient, db, generateId } from '@/lib/db'
 import { toast } from '@/components/toast'
 
 interface ImportDialogProps {
   onClose: () => void
   onImported: () => void
 }
 
 export function ImportDialog({ onClose, onImported }: ImportDialogProps) {
   const [text, setText] = useState('')
   const [preview, setPreview] = useState<{ toAdd: Patient[]; toUpdate: Patient[]; toDelete: Patient[] } | null>(null)
 
   const parseRows = () => {
     const rows = text.split('\n').map((l) => l.trim()).filter(Boolean)
     return rows.map((row) => {
       const parts = row.split(/\s+/)
       const bedNumber = parts[0] || ''
       const name = parts[1] || ''
       const diagnosis = parts.slice(2).join(' ') || ''
       return { bedNumber, name, diagnosis }
     }).filter((r) => r.name && r.bedNumber)
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
       if (!confirm(`??? ${preview.toDelete.length} ????????`)) return
     }
     await db.patients.bulkPut([...preview.toAdd, ...preview.toUpdate])
     await db.patients.bulkDelete(preview.toDelete.map((p) => p.id))
     await db.todos.where('patientId').anyOf(preview.toDelete.map((p) => p.id)).delete()
     toast(`??????? ${preview.toAdd.length} ???? ${preview.toUpdate.length} ???? ${preview.toDelete.length} ?`)
     onImported()
     onClose()
   }
 
   return (
     <div className="space-y-3">
       <textarea
         value={text}
         onChange={(e) => setText(e.target.value)}
         placeholder={`??????? ?? ??\n???\n309W23 ??? ?????????\n309W24 ?? ????`}
         rows={6}
         className="w-full rounded-xl border border-custom bg-card p-3 text-sm text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
       />
       <button onClick={handlePreview} className="w-full py-2.5 rounded-xl border border-custom text-main font-medium">??</button>
       {preview && (
         <div className="space-y-2 text-sm">
           <div className="text-green-600">???{preview.toAdd.length} ?</div>
           <div className="text-blue-600">???{preview.toUpdate.length} ?</div>
           <div className="text-red-600">???{preview.toDelete.length} ?</div>
           {preview.toDelete.length > 0 && (
             <div className="text-xs text-muted">{preview.toDelete.map((p) => p.name).join('?')}</div>
           )}
           <button onClick={handleConfirm} className="w-full py-2.5 rounded-xl bg-primary text-white font-medium">????</button>
         </div>
       )}
     </div>
   )
 }
