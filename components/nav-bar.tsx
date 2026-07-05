 'use client'
 
 import Link from 'next/link'
 import { usePathname } from 'next/navigation'
 import { Users, ClipboardList, Settings } from 'lucide-react'
 import { cn } from '@/lib/utils'
 
 const tabs = [
   { href: '/', label: '查房', icon: Users },
   { href: '/todos', label: '待办', icon: ClipboardList },
   { href: '/settings', label: '设置', icon: Settings }
 ]
 
 export function NavBar() {
   const pathname = usePathname()
   return (
     <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-custom safe-area-pb">
       <div className="flex items-center justify-around h-14">
         {tabs.map((t) => {
           const active = pathname === t.href
           const Icon = t.icon
           return (
             <Link
               key={t.href}
               href={t.href}
               className={cn(
                 'flex flex-col items-center justify-center gap-0.5 w-full h-full text-xs transition-colors',
                 active ? 'text-primary' : 'text-muted'
               )}
             >
               <Icon className="w-5 h-5" />
               <span>{t.label}</span>
             </Link>
           )
         })}
       </div>
     </nav>
   )
 }
