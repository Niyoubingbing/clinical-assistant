 'use client'
 
 import { useState, useEffect } from 'react'
 import { db, generateId, Todo } from '@/lib/db'
 import { parseTime } from '@/lib/time-parser'
 import { toast } from '@/components/toast'
 
 const TODO_TYPES = ['??', '??', '???', '????', '????', '??', '??', '???', '??']
 
 interface TodoFormProps {
   patientId: string
   onSaved: () => void
   initialContent?: string
 }
 
 export function TodoForm({ patientId, onSaved, initialContent = '' }: TodoFormProps) {
   const [content, setContent] = useState(initialContent)
   const [type, setType] = useState('??')
   const [parsed, setParsed] = useState<{ date: string; label: string } | null>(null)
 
   useEffect(() => {
     setParsed(parseTime(content))
   }, [content])
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     if (!content.trim()) {
       toast('???????', 'error')
       return
     }
     const todo: Todo = {
       id: generateId(),
       patientId,
       content: content.trim(),
       type,
       dueDate: parsed?.date,
       status: 'pending',
       createdAt: Date.now()
     }
     await db.todos.add(todo)
     toast('?????')
     setContent('')
     onSaved()
   }
 
   return (
     <form onSubmit={handleSubmit} className="space-y-3">
       <textarea
         value={content}
         onChange={(e) => setContent(e.target.value)}
         placeholder="?????????????..."
         rows={3}
         className="w-full rounded-xl border border-custom bg-card p-3 text-sm text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
       />
       {parsed ? (
         <div className="text-sm text-primary">??????{parsed.date}?{parsed.label}?</div>
       ) : (
         <div className="text-sm text-muted">??????</div>
       )}
       <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-custom bg-card p-2.5 text-sm text-main">
         {TODO_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
       </select>
       <button type="submit" className="w-full py-2.5 rounded-xl bg-primary text-white font-medium">????</button>
     </form>
   )
 }
