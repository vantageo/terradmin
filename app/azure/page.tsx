'use client'

import { useState, useEffect } from 'react'
import { Cloud, Plus, Search, Filter, RefreshCw, Monitor, FolderPlus } from 'lucide-react'
import ResourceGroupModal from '@/components/azure/ResourceGroupModal'

interface VM {
  id: string
  name: string
  status: string
  powerState?: string
  region: string
  size: string
  resourceGroup?: string
  publicIpAddress?: string
  privateIpAddress?: string
  osType?: string
}

interface Stats {
  totalVMs: number
  running: number
  stopped: number
  resourceGroups: number
}

export default function AzurePage() {
  const [vms, setVms] = useState<VM[]>([])
  const [stats, setStats] = useState<Stats>({ totalVMs: 0, running: 0, stopped: 0, resourceGroups: 0 })
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [isRGModalOpen, setIsRGModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch VMs from database
      const response = await fetch('/api/azure/vms')
      const data = await response.json()
      
      if (data.success) {
        setVms(data.vms || [])
        setStats(data.stats || { totalVMs: 0, running: 0, stopped: 0, resourceGroups: 0 })
      }
    } catch (error) {
      console.error('Error loading VMs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/azure/sync', { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        // Reload data after sync
        await loadData()
      } else {
        alert(data.error || 'Failed to sync Azure resources')
      }
    } catch (error: any) {
      console.error('Error syncing:', error)
      alert(error.message || 'Failed to sync Azure resources')
    } finally {
      setSyncing(false)
    }
  }

  // Get unique regions from VMs
  const regions = Array.from(new Set(vms.map(vm => vm.region))).sort()

  // Filter VMs by search term and selected region
  const filteredVMs = vms.filter(vm => {
    const matchesSearch = vm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vm.resourceGroup?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRegion = selectedRegion === 'all' || vm.region === selectedRegion
    
    return matchesSearch && matchesRegion
  })
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Cloud className="w-7 h-7 text-accent-400" />
            <span>Azure Virtual Machines</span>
          </h2>
          <p className="text-slate-400 mt-1">Manage your Microsoft Azure VM instances</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={syncing}
            className="flex items-center space-x-2 px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white font-medium rounded-lg transition-colors border border-navy-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Refresh'}</span>
          </button>
          <button 
            onClick={() => setIsRGModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white font-medium rounded-lg transition-colors border border-navy-600"
          >
            <FolderPlus className="w-5 h-5" />
            <span>Resource Group</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors shadow-lg shadow-accent-500/20">
            <Plus className="w-5 h-5" />
            <span>Deploy New VM</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
          <p className="text-sm text-slate-400">Total VMs</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalVMs}</p>
        </div>
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
          <p className="text-sm text-slate-400">Running</p>
          <p className="text-2xl font-bold text-accent-400 mt-1">{stats.running}</p>
        </div>
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
          <p className="text-sm text-slate-400">Stopped</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">{stats.stopped}</p>
        </div>
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
          <p className="text-sm text-slate-400">Resource Groups</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.resourceGroups}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search VMs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-accent-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 bg-navy-700 border border-navy-600 rounded-lg text-white focus:outline-none focus:border-accent-500"
            >
              <option value="all">All Regions ({vms.length})</option>
              {regions.map((region) => {
                const count = vms.filter(vm => vm.region === region).length
                return (
                  <option key={region} value={region}>
                    {region} ({count})
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </div>

      {/* VM List */}
      <div className="bg-navy-800 rounded-lg border border-navy-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-900 border-b border-navy-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <RefreshCw className="w-8 h-8 mx-auto mb-3 text-accent-400 animate-spin" />
                    <p className="text-slate-400">Loading VMs...</p>
                  </td>
                </tr>
              ) : filteredVMs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Cloud className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-400">
                      {vms.length === 0 ? 'No Azure VMs found' : 'No VMs match your search'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {vms.length === 0 ? 'Click "Refresh" to sync from Azure or "Deploy New VM" to create one' : 'Try a different search term'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredVMs.map((vm) => (
                  <tr key={vm.id} className="hover:bg-navy-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {vm.osType === 'Linux' ? (
                          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.84-.41 1.495-.348 2.154.042.462.218.895.488 1.268.975 1.34 2.904 1.034 4.26.838 2.301-.332 4.78-1.103 6.06-3.055.462-.705.68-1.641.484-2.566-.69-3.245-1.65-4.776-2.353-6.334-.353-.78-.61-1.344-.73-2.121-.184-1.178.372-2.48 1.445-3.584C13.402.165 12.953 0 12.504 0zm.717 1.608c.062-.001.125.005.188.016.375.07.563.395.5.773-.094.568-.937 1.736-1.66 2.207-.316-.657-.047-1.848.523-2.554.288-.356.726-.54 1.167-.542h.282zm-3.24 1.23c.31-.003.625.053.932.17 1.353.516 1.68 2.324 1.188 3.524-.344.841-1.05 1.513-1.806 1.945-.757.43-1.49.646-1.883.22-.393-.426-.116-1.31.32-2.028.435-.72 1.05-1.352 1.66-1.752.305-.2.614-.315.924-.318.103-.001.207.003.31.01.206.014.412.037.617.068zm8.33 8.408c-.31-.022-.625.04-.932.168-1.353.517-1.68 2.325-1.188 3.525.344.841 1.05 1.513 1.806 1.945.757.43 1.49.646 1.883.22.393-.426.116-1.31-.32-2.028-.435-.72-1.05-1.352-1.66-1.752-.305-.2-.614-.315-.924-.318-.103-.001-.207.003-.31.01-.206.014-.412.037-.617.068z"/>
                          </svg>
                        ) : vm.osType === 'Windows' ? (
                          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                          </svg>
                        ) : (
                          <Monitor className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-white font-medium">{vm.name}</p>
                          {vm.osType && (
                            <p className="text-xs text-slate-400 mt-0.5">{vm.osType}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vm.status === 'RUNNING' 
                          ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20' 
                          : vm.status === 'STOPPED' || vm.status === 'DEALLOCATED'
                          ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {vm.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{vm.region}</td>
                    <td className="px-6 py-4 text-slate-300">{vm.size}</td>
                    <td className="px-6 py-4">
                      <div>
                        {vm.publicIpAddress && (
                          <p className="text-slate-300 text-sm">{vm.publicIpAddress}</p>
                        )}
                        {vm.privateIpAddress && (
                          <p className="text-slate-400 text-xs mt-0.5">{vm.privateIpAddress}</p>
                        )}
                        {!vm.publicIpAddress && !vm.privateIpAddress && (
                          <p className="text-slate-500 text-sm">-</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 hover:bg-navy-600 rounded transition-colors" title="Start VM">
                          <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button className="p-1.5 hover:bg-navy-600 rounded transition-colors" title="Stop VM">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                          </svg>
                        </button>
                        <button className="p-1.5 hover:bg-navy-600 rounded transition-colors" title="More options">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Group Modal */}
      <ResourceGroupModal 
        isOpen={isRGModalOpen} 
        onClose={() => setIsRGModalOpen(false)} 
      />
    </div>
  )
}

