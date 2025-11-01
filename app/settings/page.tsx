'use client'

import { useState } from 'react'
import { Settings as SettingsIcon, Cloud, Bell, Users } from 'lucide-react'
import CloudProviders from '@/components/settings/CloudProviders'
import NotificationSettings from '@/components/settings/NotificationSettings'
import UserManagement from '@/components/settings/UserManagement'

type Tab = 'providers' | 'notifications' | 'users'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('providers')

  const tabs = [
    { id: 'providers' as Tab, label: 'Cloud Providers', icon: Cloud },
    { id: 'notifications' as Tab, label: 'Notification Settings', icon: Bell },
    { id: 'users' as Tab, label: 'User Management', icon: Users },
  ]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <SettingsIcon className="w-7 h-7 text-accent-400" />
          <span>Settings</span>
        </h2>
        <p className="text-slate-400 mt-1">Configure your TerraAdmin environment and preferences</p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-navy-800 rounded-lg border border-navy-700">
        <div className="border-b border-navy-700">
          <nav className="flex space-x-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-accent-500 text-navy-900 shadow-lg shadow-accent-500/20'
                      : 'text-slate-300 hover:bg-navy-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'providers' && <CloudProviders />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'users' && <UserManagement />}
        </div>
      </div>
    </div>
  )
}
