'use client'

import { useState } from 'react'
import { Settings as SettingsIcon, Cloud, Bell, Users, FileCode, FileJson } from 'lucide-react'
import CloudProviders from '@/components/settings/CloudProviders'
import NotificationSettings from '@/components/settings/NotificationSettings'
import TerraformSettings from '@/components/settings/TerraformSettings'
import BicepSettings from '@/components/settings/BicepSettings'
import UserManagement from '@/components/settings/UserManagement'

type Tab = 'providers' | 'notifications' | 'terraform' | 'bicep' | 'users'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('providers')

  const tabs = [
    { id: 'providers' as Tab, label: 'Cloud Providers', icon: Cloud },
    { id: 'notifications' as Tab, label: 'Notification Settings', icon: Bell },
    { id: 'terraform' as Tab, label: 'Terraform', icon: FileCode },
    { id: 'bicep' as Tab, label: 'Bicep', icon: FileJson },
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
          <nav className="flex space-x-6 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-2 py-3 font-medium transition-all relative
                    ${activeTab === tab.id
                      ? 'text-accent-400'
                      : 'text-slate-400 hover:text-slate-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"></span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'providers' && <CloudProviders />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'terraform' && <TerraformSettings />}
          {activeTab === 'bicep' && <BicepSettings />}
          {activeTab === 'users' && <UserManagement />}
        </div>
      </div>
    </div>
  )
}
