 import { pinyin } from 'pinyin-pro'
 
 export function getInitials(text: string): string {
   try {
     return pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toLowerCase()
   } catch {
     return text.toLowerCase()
   }
 }
 
 export function matchesSearch(query: string, target: string): boolean {
   const q = query.trim().toLowerCase()
   const t = target.toLowerCase()
   if (t.includes(q)) return true
   const initials = getInitials(target)
   return initials.includes(q)
 }
