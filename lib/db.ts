 import Dexie, { Table } from 'dexie'
 
 export interface Patient {
   id: string
   bedNumber: string
   name: string
   diagnosis: string
   group?: string
   groupColor?: string
   surgeryDate?: string
   dressingFrequency?: number
   lastDressingChange?: string
   bloodTestDay?: string
   createdAt: number
   updatedAt: number
 }
 
 export interface Todo {
   id: string
   patientId: string
   content: string
   type?: string
   dueDate?: string
   status: 'pending' | 'completed'
   completedAt?: number
   createdAt: number
 }
 
 export interface QuickTodo {
   label: string
   type: string
   content?: string
 }
 
 export interface Settings {
   id: number
   roundingOrder: string[]
   quickTodos: QuickTodo[]
   theme: 'light' | 'dark' | 'system'
 }
 
 class ClinicalDB extends Dexie {
   patients!: Table<Patient>
   todos!: Table<Todo>
   settings!: Table<Settings>
 
   constructor() {
     super('ClinicalDB')
     this.version(1).stores({
       patients: 'id, bedNumber, name',
       todos: 'id, patientId, status, dueDate',
       settings: 'id'
     })
   }
 }
 
 export const db = new ClinicalDB()
 
 export const DEFAULT_SETTINGS: Settings = {
   id: 1,
   roundingOrder: [],
   quickTodos: [
     { label: '换药', type: '换药', content: '换药' },
     { label: '查血', type: '查血', content: '查血' },
     { label: '术前准备', type: '开术前', content: '术前准备' }
   ],
   theme: 'system'
 }
 
 export async function getSettings(): Promise<Settings> {
   const s = await db.settings.get(1)
   return s || DEFAULT_SETTINGS
 }
 
 export async function saveSettings(partial: Partial<Settings>) {
   const s = await getSettings()
   await db.settings.put({ ...s, ...partial, id: 1 })
 }
 
 export function generateId() {
   return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
 }
