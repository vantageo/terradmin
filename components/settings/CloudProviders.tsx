'use client'

import { useState, useEffect } from 'react'
import { Cloud, Server, Database } from 'lucide-react'
import AzureConfigModal from '@/components/AzureConfigModal'

interface AzureConfig {
  subscriptionId: string
  subscriptionName: string
  tenantId?: string
  state?: string
  isActive: boolean
}

export default function CloudProviders() {
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
      <div>
        <h3 className="text-lg font-semibold text-white">Cloud Provider Connections</h3>
        <p className="text-sm text-slate-400 mt-1">Manage your cloud provider integrations</p>
      </div>

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

      {/* Azure Configuration Modal */}
      <AzureConfigModal 
        isOpen={isAzureModalOpen} 
        onClose={() => setIsAzureModalOpen(false)} 
      />
    </div>
  )
}

