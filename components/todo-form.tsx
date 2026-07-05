 'use client'
 
 import { useState, useEffect } from 'react'
 import { db, generateId, Todo } from '@/lib/db'
 import { parseTime } from '@/lib/time-parser'
 import { toast } from '@/components/toast'
 
 const TODO_TYPES = ['换药', '查血', '开术前', '明天出院', '康复会诊', '会诊', '复查', '开查血', '其他']
 
 interface TodoFormProps {
   patientId: string
   onSaved: () => void
   initialContent?: string
 }
 
 export function TodoForm({ patientId, onSaved, initialContent = '' }: TodoFormProps) {
   const [content, setContent] = useState(initialContent)
   const [type, setType] = useState('其他')
   const [parsed, setParsed] = useState<{ date: string; label: string } | null>(null)
 
   useEffect(() => {
     setParsed(parseTime(content))
   }, [content])
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     if (!content.trim()) {
       toast('请输入待办内容', 'error')
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
     toast('待办已添加')
     setContent('')
     onSaved()
   }
 
   return (
     <form onSubmit={handleSubmit} className="space-y-3">
       <textarea
         value={content}
         onChange={(e) => setContent(e.target.value)}
         placeholder="例如：星期二出院、后天换药..."
         rows={3}
         className="w-full rounded-xl border border-custom bg-card p-3 text-sm text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
       />
       {parsed ? (
         <div className="text-sm text-primary">识别到时间：{parsed.date}（{parsed.label}）</div>
       ) : (
         <div className="text-sm text-muted">未识别到时间</div>
       )}
       <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-custom bg-card p-2.5 text-sm text-main">
         {TODO_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
       </select>
       <button type="submit" className="w-full py-2.5 rounded-xl bg-primary text-white font-medium">添加待办</button>
     </form>
   )
 }
