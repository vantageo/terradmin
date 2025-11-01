'use client'

import { useState, useEffect, useRef } from 'react'
import { X, FolderPlus, Loader2, FileText, Terminal } from 'lucide-react'
import Toast from '@/components/Toast'
import { parseHclVariables, getDefaultFormValues, TerraformVariable } from '@/lib/hclParser'

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
  
  // Dynamic variables and form data
  const [variables, setVariables] = useState<TerraformVariable[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loadingVariables, setLoadingVariables] = useState(false)
  
  // Ref for logs panel auto-scroll
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Load variables when modal opens
  useEffect(() => {
    if (isOpen && !planResult) {
      loadVariables()
    }
  }, [isOpen, planResult])

  // Auto-scroll logs panel when output changes
  useEffect(() => {
    if (planResult?.output && activeTab === 'logs') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [planResult?.output, activeTab])

  const loadVariables = async () => {
    setLoadingVariables(true)
    try {
      const response = await fetch('/api/terraform/template?resource=rg')
      const data = await response.json()
      
      if (data.success && data.template?.variablesContent) {
        // Parse variables from the variables content
        const parsed = parseHclVariables(data.template.variablesContent)
        setVariables(parsed)
        
        // Set default form values
        const defaults = getDefaultFormValues(parsed)
        setFormData(defaults)
      } else {
        setToast({ message: 'No template variables found', type: 'error' })
      }
    } catch (error) {
      console.error('Error loading variables:', error)
      setToast({ message: 'Failed to load template variables', type: 'error' })
    } finally {
      setLoadingVariables(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClose = () => {
    setPlanResult(null)
    setFormData({})
    setVariables([])
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

  const renderField = (variable: TerraformVariable) => {
    const value = formData[variable.name] ?? ''

    // String type
    if (variable.type === 'string') {
      // Special handling for location/region
      if (variable.name === 'location' || variable.name.includes('region')) {
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(variable.name, e.target.value)}
            className="w-full px-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white focus:outline-none focus:border-accent-500"
            required={variable.required}
          >
            <option value="">Select region...</option>
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
        )
      }
      
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(variable.name, e.target.value)}
          placeholder={variable.description || `Enter ${variable.name}`}
          className="w-full px-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-accent-500"
          required={variable.required}
        />
      )
    }

    // Number type
    if (variable.type === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleInputChange(variable.name, parseFloat(e.target.value) || 0)}
          placeholder={variable.description || `Enter ${variable.name}`}
          className="w-full px-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-accent-500"
          required={variable.required}
        />
      )
    }

    // Boolean type
    if (variable.type === 'bool') {
      return (
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleInputChange(variable.name, e.target.checked)}
            className="w-5 h-5 bg-navy-900 border border-navy-600 rounded text-accent-500 focus:ring-accent-500"
          />
          <span className="text-slate-300">{variable.description || variable.name}</span>
        </label>
      )
    }

    // Fallback for unknown types
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(variable.name, e.target.value)}
        placeholder={`${variable.type} - ${variable.description || variable.name}`}
        className="w-full px-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-accent-500"
        required={variable.required}
      />
    )
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
            {/* Dynamic Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {loadingVariables ? (
                <div className="text-center py-8 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Loading template variables...</p>
                </div>
              ) : variables.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>No variables found in template</p>
                </div>
              ) : (
                variables.map((variable) => (
                  <div key={variable.name}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {variable.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      {variable.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {renderField(variable)}
                    <p className="text-xs text-slate-500 mt-1">
                      Terraform variable: var.{variable.name} ({variable.type})
                      {!variable.required && variable.default !== undefined && ` - default: ${JSON.stringify(variable.default)}`}
                    </p>
                  </div>
                ))
              )}
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
                disabled={loading || loadingVariables || variables.length === 0}
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
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-all relative ${
                    activeTab === 'logs'
                      ? 'text-accent-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>Logs</span>
                  {activeTab === 'logs' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('plan')}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-all relative ${
                    activeTab === 'plan'
                      ? 'text-accent-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Plan File</span>
                  {activeTab === 'plan' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"></span>
                  )}
                </button>
              </div>

              {/* Content Panel */}
              <div className="bg-navy-900 rounded-lg border border-navy-700 p-4 max-h-[600px] overflow-auto">
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                  {activeTab === 'logs' ? planResult.output : planResult.tfplan}
                  {activeTab === 'logs' && <div ref={logsEndRef} />}
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
