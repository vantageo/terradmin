'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Cloud, Server, Database, Key, Bell, User } from 'lucide-react'
import AzureConfigModal from '@/components/AzureConfigModal'

interface AzureConfig {
  subscriptionId: string
  subscriptionName: string
  tenantId?: string
  state?: string
  isActive: boolean
}

export default function SettingsPage() {
  const [isAzureModalOpen, setIsAzureModalOpen] = useState(false)
  const [azureConfig, setAzureConfig] = useState<AzureConfig | null>(null)
  const [azureConnected, setAzureConnected] = useState(false)

  useEffect(() => {
    fetchAzureConfig()
  }, [])

  const fetchAzureConfig = async () => {
    try {
      const response = await fetch('/api/azure/config')
      const data = await response.json()
      
      if (data.success && data.connected) {
        setAzureConfig(data.config)
        setAzureConnected(true)
      }
    } catch (error) {
      console.error('Error fetching Azure config:', error)
    }
  }
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <SettingsIcon className="w-7 h-7 text-accent-400" />
          <span>Settings</span>
        </h2>
        <p className="text-slate-400 mt-1">Configure your TerraAdmin environment and cloud provider connections</p>
      </div>

      {/* Cloud Provider Connections */}
      <div className="bg-navy-800 rounded-lg border border-navy-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cloud Provider Connections</h3>
        <div className="space-y-4">
          {/* Azure Connection */}
          <div className="flex items-center justify-between p-4 bg-navy-900 rounded-lg border border-navy-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center">
                <Cloud className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">Microsoft Azure</h4>
                {azureConnected ? (
                  <>
                    <p className="text-sm text-accent-400 flex items-center space-x-1">
                      <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
                      <span>Connected</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{azureConfig?.subscriptionName}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">Not connected</p>
                )}
              </div>
            </div>
            <button 
              onClick={() => setIsAzureModalOpen(true)}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors"
            >
              {azureConnected ? 'Reconfigure' : 'Configure'}
            </button>
          </div>

          {/* AWS Connection */}
          <div className="flex items-center justify-between p-4 bg-navy-900 rounded-lg border border-navy-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">Amazon Web Services</h4>
                <p className="text-sm text-slate-400">Not connected</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors">
              Configure
            </button>
          </div>

          {/* vCenter Connection */}
          <div className="flex items-center justify-between p-4 bg-navy-900 rounded-lg border border-navy-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">VMware vCenter</h4>
                <p className="text-sm text-slate-400">Not connected</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors">
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-navy-800 rounded-lg border border-navy-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">API Keys</h3>
          <button className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors border border-navy-600">
            Generate New Key
          </button>
        </div>
        <div className="text-center py-8 text-slate-400">
          <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No API keys generated</p>
          <p className="text-sm mt-1">Generate an API key to access TerraAdmin programmatically</p>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-navy-800 rounded-lg border border-navy-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-accent-400" />
          <span>Notification Settings</span>
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-navy-900 rounded-lg border border-navy-700">
            <div>
              <h4 className="text-white font-medium">Email Notifications</h4>
              <p className="text-sm text-slate-400">Receive email alerts for VM status changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-navy-900 rounded-lg border border-navy-700">
            <div>
              <h4 className="text-white font-medium">Deployment Notifications</h4>
              <p className="text-sm text-slate-400">Get notified when VM deployments complete</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-navy-900 rounded-lg border border-navy-700">
            <div>
              <h4 className="text-white font-medium">Error Alerts</h4>
              <p className="text-sm text-slate-400">Receive alerts when errors occur</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="bg-navy-800 rounded-lg border border-navy-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <User className="w-5 h-5 text-accent-400" />
          <span>User Profile</span>
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="Admin User"
              className="w-full px-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white focus:outline-none focus:border-accent-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              defaultValue="admin@terradmin.local"
              className="w-full px-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white focus:outline-none focus:border-accent-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
            <input
              type="text"
              defaultValue="Administrator"
              disabled
              className="w-full px-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-slate-400 cursor-not-allowed"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button className="px-6 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Azure Configuration Modal */}
      <AzureConfigModal 
        isOpen={isAzureModalOpen} 
        onClose={() => setIsAzureModalOpen(false)} 
      />
    </div>
  )
}

