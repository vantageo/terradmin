'use client'

import { useState, useEffect } from 'react'
import { X, FolderPlus, Loader2, FileText, Terminal } from 'lucide-react'
import Toast from '@/components/Toast'

interface TfVars {
  resource_group_name: string
  location: string
}

interface ResourceGroupModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ResourceGroupModal({ isOpen, onClose }: ResourceGroupModalProps) {
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [planResult, setPlanResult] = useState<{ planId: string; output: string; tfplan: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'logs' | 'plan'>('logs')
  const [formData, setFormData] = useState<TfVars>({
    resource_group_name: '',
    location: 'eastus',
  })

  const handleInputChange = (field: keyof TfVars, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClose = () => {
    setPlanResult(null)
    setFormData({
      resource_group_name: '',
      location: 'eastus',
    })
    setActiveTab('logs')
    setApplying(false)
    setApplied(false)
    onClose()
  }

  const handleApply = async () => {
    if (!planResult) return
    
    setApplying(true)
    setActiveTab('logs') // Switch to logs tab to show apply output
    
    try {
      const response = await fetch(`/api/terraform/apply/${planResult.planId}`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        // Fetch the updated logs from database to ensure UI matches what's stored
        const logsResponse = await fetch(`/api/terraform/plan/${planResult.planId}/logs`)
        const logsData = await logsResponse.json()
        
        if (logsData.success) {
          setPlanResult(prev => prev ? {
            ...prev,
            output: logsData.output
          } : null)
        }
        
        setApplied(true)
        setToast({ message: 'Terraform apply completed successfully!', type: 'success' })
      } else {
        // Fetch logs even on failure to show error output from DB
        const logsResponse = await fetch(`/api/terraform/plan/${planResult.planId}/logs`)
        const logsData = await logsResponse.json()
        
        if (logsData.success) {
          setPlanResult(prev => prev ? {
            ...prev,
            output: logsData.output
          } : null)
        }
        
        setToast({ message: 'Terraform apply failed: ' + data.error, type: 'error' })
      }
    } catch (error: any) {
      console.error('Error applying plan:', error)
      setToast({ message: 'Failed to execute terraform apply: ' + error.message, type: 'error' })
    } finally {
      setApplying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/terraform/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'resource-group',
          variables: formData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        console.log('Terraform plan created:', data)
        console.log('Plan ID:', data.planId)
        console.log('Folder:', data.folder)
        
        // Fetch the tfplan file content
        const tfplanResponse = await fetch(`/api/terraform/plan/${data.planId}/tfplan`)
        const tfplanData = await tfplanResponse.json()
        
        // Show success toast
        setToast({ message: `Terraform plan ${data.planId} created successfully!`, type: 'success' })
        
        // Set plan result to display logs and plan
        setPlanResult({
          planId: data.planId,
          output: data.output || 'No output available',
          tfplan: tfplanData.success ? tfplanData.content : 'Plan file not available',
        })
      } else {
        throw new Error(data.error || 'Failed to create plan')
      }
    } catch (error: any) {
      console.error('Error creating plan:', error)
      setToast({ message: 'Failed to create Terraform plan: ' + error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`bg-navy-800 rounded-lg border border-navy-700 w-full mx-4 shadow-2xl transition-all ${planResult ? 'max-w-6xl' : 'max-w-2xl'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center">
              <FolderPlus className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {planResult ? `Plan ${planResult.planId}` : 'Create Resource Group'}
              </h2>
              <p className="text-sm text-slate-400">
                {planResult ? 'Terraform execution results' : 'Configure Terraform variables for Azure Resource Group'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        {!planResult ? (
          <>
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Resource Group Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Resource Group Name
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.resource_group_name}
                  onChange={(e) => handleInputChange('resource_group_name', e.target.value)}
                  placeholder="e.g., rg-myproject-prod"
                  className="w-full px-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-accent-500"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Terraform variable: var.resource_group_name</p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location (Region)
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white focus:outline-none focus:border-accent-500"
                >
                  <option value="eastus">East US</option>
                  <option value="eastus2">East US 2</option>
                  <option value="westus">West US</option>
                  <option value="westus2">West US 2</option>
                  <option value="centralus">Central US</option>
                  <option value="northeurope">North Europe</option>
                  <option value="westeurope">West Europe</option>
                  <option value="uksouth">UK South</option>
                  <option value="ukwest">UK West</option>
                  <option value="southeastasia">Southeast Asia</option>
                  <option value="eastasia">East Asia</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Terraform variable: var.location</p>
              </div>

              {/* Info Box */}
              <div className="bg-accent-500/5 border border-accent-500/20 rounded-lg p-4">
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-accent-400">Preview:</span> These values will be used as Terraform variables to deploy an Azure Resource Group.
                </p>
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-navy-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Planning...</span>
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4" />
                    <span>Plan</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Results View */}
            <div className="p-6 space-y-4">
              {/* Tabs */}
              <div className="flex border-b border-navy-700">
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'logs'
                      ? 'text-accent-400 border-b-2 border-accent-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>Logs</span>
                </button>
                <button
                  onClick={() => setActiveTab('plan')}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'plan'
                      ? 'text-accent-400 border-b-2 border-accent-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Plan File</span>
                </button>
              </div>

              {/* Content Panel */}
              <div className="bg-navy-900 rounded-lg border border-navy-700 p-4 max-h-[600px] overflow-auto">
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                  {activeTab === 'logs' ? planResult.output : planResult.tfplan}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-navy-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
                disabled={applying}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={applying || applied}
                className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {applying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Applying...</span>
                  </>
                ) : applied ? (
                  <>
                    <FolderPlus className="w-4 h-4" />
                    <span>Applied</span>
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4" />
                    <span>Apply</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
