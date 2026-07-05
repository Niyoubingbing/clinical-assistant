 export function cn(...classes: (string | false | null | undefined)[]) {
   return classes.filter(Boolean).join(' ')
 }
 
export function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
 
 export function today() {
   return formatDate(new Date())
 }
 
 export function addDays(dateStr: string, days: number) {
   const d = new Date(dateStr)
   d.setDate(d.getDate() + days)
   return formatDate(d)
 }
 
 export function daysBetween(a: string, b: string) {
   const da = new Date(a).getTime()
   const db = new Date(b).getTime()
   return Math.round((db - da) / (1000 * 60 * 60 * 24))
 }
 
 export function relativeDaysLabel(dueDate: string | undefined) {
   if (!dueDate) return null
   const diff = daysBetween(today(), dueDate)
   if (diff < 0) return `??? ${-diff} ?`
   if (diff === 0) return '????'
   return `?? ${diff} ?`
 }
 
 export function isOverdue(dueDate: string | undefined) {
   if (!dueDate) return false
   return daysBetween(today(), dueDate) < 0
 }
 
 export function isDueToday(dueDate: string | undefined) {
   if (!dueDate) return false
   return daysBetween(today(), dueDate) === 0
 }
 
 export function copyToClipboard(text: string) {
   if (navigator.clipboard) {
     navigator.clipboard.writeText(text)
   } else {
     const ta = document.createElement('textarea')
     ta.value = text
     document.body.appendChild(ta)
     ta.select()
     document.execCommand('copy')
     document.body.removeChild(ta)
   }
 }
