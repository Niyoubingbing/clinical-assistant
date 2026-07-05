 'use client'
 
 import { useState } from 'react'
 import { Patient, db, generateId } from '@/lib/db'
 import { toast } from '@/components/toast'
 
 const PRESET_GROUPS = ['??', '??', '??', '??']
 const PRESET_COLORS = ['#fecaca', '#bfdbfe', '#bbf7d0', '#fde68a', '#e9d5ff', '#cbd5e1']
 
 interface PatientFormProps {
   patient?: Patient
   onSaved: () => void
   onCancel?: () => void
 }
 
 export function PatientForm({ patient, onSaved, onCancel }: PatientFormProps) {
   const [form, setForm] = useState<Partial<Patient>>({
     bedNumber: patient?.bedNumber || '',
     name: patient?.name || '',
     diagnosis: patient?.diagnosis || '',
     group: patient?.group || '',
     groupColor: patient?.groupColor || PRESET_COLORS[0],
     surgeryDate: patient?.surgeryDate || '',
     dressingFrequency: patient?.dressingFrequency || undefined,
     lastDressingChange: patient?.lastDressingChange || '',
     bloodTestDay: patient?.bloodTestDay || ''
   })
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     if (!form.bedNumber || !form.name || !form.diagnosis) {
       toast('???????????', 'error')
       return
     }
     const now = Date.now()
     const payload: Patient = {
       ...form,
       id: patient?.id || generateId(),
       bedNumber: form.bedNumber || '',
       name: form.name || '',
       diagnosis: form.diagnosis || '',
       group: form.group || '',
       groupColor: form.groupColor || PRESET_COLORS[0],
       createdAt: patient?.createdAt || now,
       updatedAt: now
     } as Patient
     await db.patients.put(payload)
     toast(patient ? '???????' : '?????')
     onSaved()
   }
 
   const handleDelete = async () => {
     if (!patient) return
     if (!confirm('??????????????????')) return
     await db.patients.delete(patient.id)
     await db.todos.where('patientId').equals(patient.id).delete()
     toast('?????')
     onSaved()
   }
 
   return (
     <form onSubmit={handleSubmit} className="space-y-3">
       <div className="grid grid-cols-2 gap-3">
         <input type="text" placeholder="??" value={form.bedNumber} onChange={(e) => setForm({ ...form, bedNumber: e.target.value })} className="input" />
         <input type="text" placeholder="??" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
       </div>
       <input type="text" placeholder="??" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="input" />
       <div className="grid grid-cols-2 gap-3">
         <input type="text" placeholder="????" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} list="preset-groups" className="input" />
         <datalist id="preset-groups">{PRESET_GROUPS.map((g) => <option key={g} value={g} />)}</datalist>
         <input type="color" value={form.groupColor} onChange={(e) => setForm({ ...form, groupColor: e.target.value })} className="input h-10 p-1" />
       </div>
       <div className="grid grid-cols-2 gap-3">
         <input type="date" placeholder="????" value={form.surgeryDate || ''} onChange={(e) => setForm({ ...form, surgeryDate: e.target.value || undefined })} className="input" />
         <input type="number" placeholder="???????" value={form.dressingFrequency || ''} onChange={(e) => setForm({ ...form, dressingFrequency: e.target.value ? parseInt(e.target.value) : undefined })} className="input" />
       </div>
       <div className="grid grid-cols-2 gap-3">
         <input type="date" placeholder="??????" value={form.lastDressingChange || ''} onChange={(e) => setForm({ ...form, lastDressingChange: e.target.value || undefined })} className="input" />
         <input type="text" placeholder="????????" value={form.bloodTestDay || ''} onChange={(e) => setForm({ ...form, bloodTestDay: e.target.value })} className="input" />
       </div>
       <div className="flex gap-3 pt-2">
         {onCancel && (
           <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-custom text-muted">??</button>
         )}
         <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium">{patient ? '??' : '??'}</button>
       </div>
       {patient && (
         <button type="button" onClick={handleDelete} className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm">????</button>
       )}
     </form>
   )
 }
