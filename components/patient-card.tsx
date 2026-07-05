 'use client'
 
 import Link from 'next/link'
 import { Patient, Todo } from '@/lib/db'
 import { relativeDaysLabel, isOverdue, isDueToday } from '@/lib/utils'
 import { cn } from '@/lib/utils'
 import { FileText } from 'lucide-react'
 
 interface PatientCardProps {
   patient: Patient
   todos: Todo[]
 }
 
 export function PatientCard({ patient, todos }: PatientCardProps) {
   const pending = todos.filter((t) => t.status === 'pending')
   const dueToday = pending.filter((t) => isDueToday(t.dueDate))
   const overdue = pending.filter((t) => isOverdue(t.dueDate))
   const dressingDue = patient.lastDressingChange && patient.dressingFrequency
     ? isOverdue(patient.lastDressingChange) || isDueToday(patient.lastDressingChange)
     : false
   const bloodDue = patient.bloodTestDay && patient.bloodTestDay.includes('今天')
 
   return (
     <Link href={`/patient/${patient.id}`}>
       <div className="bg-card rounded-xl border border-custom p-3 flex items-center gap-3 active:scale-[0.98] transition-transform">
         <div
           className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
           style={{ backgroundColor: patient.groupColor || '#e2e8f0', color: '#1e293b' }}
         >
           {patient.bedNumber}
         </div>
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2">
             <span className="font-semibold text-main truncate">{patient.name}</span>
             <span className="text-xs text-muted truncate">{patient.diagnosis}</span>
           </div>
           <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
             {patient.group && (
               <span className="px-1.5 py-0.5 rounded bg-muted/10 text-muted">{patient.group}</span>
             )}
             {pending.length > 0 && (
               <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-1">
                 <FileText className="w-3 h-3" />
                 {pending.length}
               </span>
             )}
             {(dueToday.length > 0 || overdue.length > 0) && (
               <span className={cn('px-1.5 py-0.5 rounded', overdue.length > 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600')}>
                 {overdue.length > 0 ? `逾期 ${overdue.length}` : `今天 ${dueToday.length}`}
               </span>
             )}
           </div>
         </div>
       </div>
     </Link>
   )
 }
