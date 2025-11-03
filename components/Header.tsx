'use client'

import { usePathname } from 'next/navigation'
import { User, Bell } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard Overview',
  '/azure': 'Azure Virtual Machines',
  '/aws': 'AWS Virtual Machines',
  '/vcenter': 'vCenter Virtual Machines',
  '/settings': 'Settings',
}

export default function Header() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || 'Vantage Point'

  return (
    <header className="h-16 bg-navy-800 border-b border-navy-700 flex items-center justify-between px-6">
      {/* Page Title and Breadcrumb */}
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        <div className="flex items-center space-x-2 mt-0.5">
          <span className="text-xs text-slate-400">
            Home
          </span>
          {pathname !== '/' && (
            <>
              <span className="text-xs text-slate-600">/</span>
              <span className="text-xs text-accent-400">
                {title}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-navy-700 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-slate-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-4 border-l border-navy-700">
          <div className="text-right">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
          <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-navy-900" />
          </div>
        </div>
      </div>
    </header>
  )
}

