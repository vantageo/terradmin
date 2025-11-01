'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Cloud, 
  Server, 
  Database, 
  Settings,
  ChevronLeft
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Azure VMs', href: '/azure', icon: Cloud },
  { name: 'AWS VMs', href: '/aws', icon: Server },
  { name: 'vCenter VMs', href: '/vcenter', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div 
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-navy-800 min-h-screen flex flex-col transition-all duration-300 border-r border-navy-700`}
    >
      {/* Logo / Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-navy-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-navy-900" />
            </div>
            <span className="text-xl font-bold text-accent-400">TerraAdmin</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-navy-700 rounded-lg transition-colors"
        >
          <ChevronLeft 
            className={`w-5 h-5 text-slate-400 transition-transform ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group
                ${isActive 
                  ? 'bg-accent-500 text-navy-900 font-medium shadow-lg shadow-accent-500/20' 
                  : 'text-slate-300 hover:bg-navy-700 hover:text-white'
                }
              `}
            >
              <Icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-navy-700">
          <div className="text-xs text-slate-400">
            <p>TerraAdmin v1.0</p>
            <p className="mt-1">Multi-Cloud VM Manager</p>
          </div>
        </div>
      )}
    </div>
  )
}

