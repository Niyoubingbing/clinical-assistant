 import { formatDate, today } from './utils'
 
 const WEEKDAYS = ['?', '?', '?', '?', '?', '?', '?']
 const WEEKDAY_NAMES = ['??', '??', '??', '??', '??', '??', '??']
 const WEEKDAY_NAMES_LONG = ['???', '???', '???', '???', '???', '???', '???']
 
 function nextWeekday(target: number): string {
   const d = new Date()
   const diff = (target - d.getDay() + 7) % 7
   d.setDate(d.getDate() + (diff === 0 ? 7 : diff))
   return formatDate(d)
 }
 
 function parseRelDay(text: string): string | null {
   if (text.includes('??')) return today()
   if (text.includes('??')) return addDays(today(), 1)
   if (text.includes('??')) return addDays(today(), 2)
   return null
 }
 
 function addDays(dateStr: string, days: number) {
   const d = new Date(dateStr)
   d.setDate(d.getDate() + days)
   return formatDate(d)
 }
 
 function parseWeekday(text: string): string | null {
   for (let i = 0; i < 7; i++) {
     if (text.includes(WEEKDAY_NAMES[i]) || text.includes(WEEKDAY_NAMES_LONG[i])) {
       return nextWeekday(i)
     }
     if (text.includes('??' + WEEKDAYS[i]) && !text.includes('??' + WEEKDAYS[i] + '?')) {
       return nextWeekday(i)
     }
     if (text.includes('?' + WEEKDAYS[i]) && !text.includes('?' + WEEKDAYS[i] + '?')) {
       return nextWeekday(i)
     }
   }
   return null
 }
 
 function parseSpecificDate(text: string): string | null {
   const currentYear = new Date().getFullYear()
   // 2026-12-05 or 2026/12/05
   let m = text.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/)
   if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`
   // 12/5 or 12-5
   m = text.match(/(\d{1,2})[-\/](\d{1,2})/)
   if (m) return `${currentYear}-${pad(m[1])}-${pad(m[2])}`
   // 12?5?
   m = text.match(/(\d{1,2})\s*?\s*(\d{1,2})\s*?/)
   if (m) return `${currentYear}-${pad(m[1])}-${pad(m[2])}`
   return null
 }
 
 function pad(n: string) {
   return n.padStart(2, '0')
 }
 
 export function parseTime(text: string): { date: string; label: string } | null {
   const clean = text.trim()
   if (!clean) return null
   const rel = parseRelDay(clean)
   if (rel) return { date: rel, label: '????' }
   const week = parseWeekday(clean)
   if (week) return { date: week, label: '???' }
   const specific = parseSpecificDate(clean)
   if (specific) return { date: specific, label: '????' }
   return null
 }
 
 export function extractTimeText(text: string): string | null {
   const patterns = [
     /??|??|??/,
     /(?:??|?)[???????]/,
     /(?:???|???????|???|???|???|???|???|???)/,
     /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/,
     /\d{1,2}[-\/]\d{1,2}/,
     /\d{1,2}\s*?\s*\d{1,2}\s*?/
   ]
   for (const p of patterns) {
     const m = text.match(p)
     if (m) return m[0]
   }
   return null
 }
