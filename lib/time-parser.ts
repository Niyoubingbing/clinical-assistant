import { formatDate, today } from './utils'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const WEEKDAY_NAMES_LONG = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function parseRelDay(text: string): string | null {
  if (text.includes('今天')) return today()
  if (text.includes('明天')) return addDays(today(), 1)
   if (text.includes('后天')) return addDays(today(), 2)
   return null
 }
 
function addDays(dateStr: string, days: number) {
  const [y, m, day] = dateStr.split('-').map((x) => parseInt(x, 10))
  const d = new Date(y, m - 1, day)
  d.setDate(d.getDate() + days)
  return formatDate(d)
}
 
function parseWeekday(text: string): string | null {
  const currentWeekday = new Date().getDay()
  const currentDate = today()
  const isNextWeek = text.includes('下星期') || text.includes('下礼拜') || text.includes('下下')
  for (let i = 0; i < 7; i++) {
    const matched =
      text.includes(WEEKDAY_NAMES[i]) ||
      text.includes(WEEKDAY_NAMES_LONG[i]) ||
      (text.includes('星期' + WEEKDAYS[i]) && !text.includes('星期' + WEEKDAYS[i] + '后')) ||
      (text.includes('周' + WEEKDAYS[i]) && !text.includes('周' + WEEKDAYS[i] + '后'))
    if (!matched) continue
    let diff = (i - currentWeekday + 7) % 7
    if (isNextWeek && diff === 0) diff = 7
    return addDays(currentDate, diff)
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
   // 12月5日
   m = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/)
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
   if (rel) return { date: rel, label: '今明后天' }
   const week = parseWeekday(clean)
   if (week) return { date: week, label: '星期几' }
   const specific = parseSpecificDate(clean)
   if (specific) return { date: specific, label: '具体日期' }
   return null
 }
 
 export function extractTimeText(text: string): string | null {
   const patterns = [
     /今天|明天|后天/,
     /(?:星期|周)[一二三四五六日]/,
     /(?:星期日|星期一到星期六|星期一|星期二|星期三|星期四|星期五|星期六)/,
     /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/,
     /\d{1,2}[-\/]\d{1,2}/,
     /\d{1,2}\s*月\s*\d{1,2}\s*日/
   ]
   for (const p of patterns) {
     const m = text.match(p)
     if (m) return m[0]
   }
   return null
 }
