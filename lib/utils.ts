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

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

export function getWeekdayName(d: Date = new Date()) {
  return WEEKDAY_LABELS[d.getDay()]
}

export function isDressingDue(patient: { lastDressingChange?: string; dressingFrequency?: number }) {
  if (!patient.lastDressingChange || !patient.dressingFrequency) return false
  const daysSince = daysBetween(patient.lastDressingChange, today())
  return daysSince >= patient.dressingFrequency
}

export function isBloodTestDue(patient: { bloodTestDay?: string }, d: Date = new Date()) {
  if (!patient.bloodTestDay) return false
  const todayName = WEEKDAY_LABELS[d.getDay()]
  return patient.bloodTestDay.includes(todayName)
}

export function relativeDaysLabel(dueDate: string | undefined) {
   if (!dueDate) return null
   const diff = daysBetween(today(), dueDate)
   if (diff < 0) return `已逾期 ${-diff} 天`
   if (diff === 0) return '今天到期'
   return `还剩 ${diff} 天`
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
export function contrastTextColor(hex?: string) {
  if (!hex) return '#1e293b'
  const clean = hex.replace('#', '')
  const expanded =
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean
  const r = parseInt(expanded.slice(0, 2), 16)
  const g = parseInt(expanded.slice(2, 4), 16)
  const b = parseInt(expanded.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#1e293b' : '#ffffff'
}
