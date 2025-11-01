'use client'

import { useState, useEffect } from 'react'
import { Activity, FileJson, Terminal, Loader2 } from 'lucide-react'
import VariablesModal from '@/components/activity/VariablesModal'
import LogsModal from '@/components/activity/LogsModal'

interface TerraformPlan {
  id: number
  type: string
  variables: any
  status: string
  output: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export default function ActivityPage() {
  const [plans, setPlans] = useState<TerraformPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<TerraformPlan | null>(null)
  const [showVariablesModal, setShowVariablesModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/terraform/plans')
      const data = await response.json()

      if (data.success) {
        setPlans(data.plans)
      } else {
        setError(data.error || 'Failed to fetch plans')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch plans')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatResourceType = (type: string) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getResourceName = (plan: TerraformPlan) => {
    if (plan.type === 'resource-group' && plan.variables?.resource_group_name) {
      return plan.variables.resource_group_name
    }
    // Future: Add VM logic here
    // if (plan.type === 'vm' && plan.variables?.vm_name) {
    //   return plan.variables.vm_name
    // }
    return '-'
  }

  const getLocation = (plan: TerraformPlan) => {
    if (plan.variables?.location) {
      return plan.variables.location
    }
    return '-'
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon?: any }> = {
      pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
      init: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
      planning: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
      success: { bg: 'bg-green-500/10', text: 'text-green-400' },
      failed: { bg: 'bg-red-500/10', text: 'text-red-400' },
      applying: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: Loader2 },
      applied: { bg: 'bg-green-500/10', text: 'text-green-400' },
      apply_failed: { bg: 'bg-red-500/10', text: 'text-red-400' },
    }

    const config = statusConfig[status] || { bg: 'bg-gray-500/10', text: 'text-gray-400' }
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {Icon && <Icon className="w-3 h-3 animate-spin" />}
        <span>{status.replace('_', ' ').toUpperCase()}</span>
      </span>
    )
  }

  const handleViewVariables = (plan: TerraformPlan) => {
    setSelectedPlan(plan)
    setShowVariablesModal(true)
  }

  const handleViewLogs = (plan: TerraformPlan) => {
    setSelectedPlan(plan)
    setShowLogsModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading activity...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Activity</h2>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Activity</h1>
            <p className="text-slate-400 mt-1">Terraform plan execution history</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {plans.length === 0 ? (
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-12 text-center">
          <div className="w-16 h-16 bg-accent-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-accent-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Activity Yet</h2>
          <p className="text-slate-400">
            Terraform plan executions will appear here once you create your first resource group or VM.
          </p>
        </div>
      ) : (
        /* Activity Table */
        <div className="bg-navy-800 rounded-lg border border-navy-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-900 border-b border-navy-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Plan ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Resource Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-navy-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-accent-400">#{plan.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{formatDate(plan.updatedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">admin</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{formatResourceType(plan.type)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{getResourceName(plan)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{getLocation(plan)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(plan.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewVariables(plan)}
                          className="p-2 hover:bg-navy-600 rounded-lg transition-colors group"
                          title="View Variables"
                        >
                          <FileJson className="w-4 h-4 text-slate-400 group-hover:text-accent-400" />
                        </button>
                        <button
                          onClick={() => handleViewLogs(plan)}
                          className="p-2 hover:bg-navy-600 rounded-lg transition-colors group"
                          title="View Logs"
                        >
                          <Terminal className="w-4 h-4 text-slate-400 group-hover:text-accent-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedPlan && (
        <>
          <VariablesModal
            isOpen={showVariablesModal}
            onClose={() => {
              setShowVariablesModal(false)
              setSelectedPlan(null)
            }}
            planId={selectedPlan.id}
            variables={selectedPlan.variables}
          />
          <LogsModal
            isOpen={showLogsModal}
            onClose={() => {
              setShowLogsModal(false)
              setSelectedPlan(null)
            }}
            planId={selectedPlan.id}
            output={selectedPlan.output || 'No logs available'}
          />
        </>
      )}
    </div>
  )
}

