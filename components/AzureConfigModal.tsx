'use client'

import { useState, useEffect } from 'react'
import { X, Cloud, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface Subscription {
  id: string
  name: string
  state: string
  tenantId: string
}

interface AzureConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AzureConfigModal({ isOpen, onClose }: AzureConfigModalProps) {
  const [loading, setLoading] = useState(false)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [selectedSubscription, setSelectedSubscription] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptions()
    }
  }, [isOpen])

  const fetchSubscriptions = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/azure/subscriptions')
      const data = await response.json()
      
      if (data.success) {
        setSubscriptions(data.subscriptions)
        if (data.subscriptions.length > 0) {
          setSelectedSubscription(data.subscriptions[0].id)
        }
      } else {
        setError(data.error || 'Failed to fetch subscriptions')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Azure')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedSubscription) {
      setError('Please select a subscription')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Find the selected subscription details
      const subscription = subscriptions.find(sub => sub.id === selectedSubscription)
      
      if (!subscription) {
        throw new Error('Selected subscription not found')
      }

      // Save to database
      const response = await fetch('/api/azure/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          subscriptionName: subscription.name,
          tenantId: subscription.tenantId,
          state: subscription.state,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to save configuration')
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        // Refresh the page to update connection status
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-navy-800 rounded-lg border border-navy-700 w-full max-w-2xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center">
              <Cloud className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Configure Microsoft Azure</h2>
              <p className="text-sm text-slate-400">Connect to your Azure subscriptions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-accent-400 animate-spin mb-4" />
              <p className="text-slate-300">Fetching your Azure subscriptions...</p>
              <p className="text-sm text-slate-500 mt-1">This may take a few moments</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Error connecting to Azure</p>
                  <p className="text-sm text-red-300 mt-1">{error}</p>
                  <button
                    onClick={fetchSubscriptions}
                    className="mt-3 text-sm text-accent-400 hover:text-accent-300 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : success ? (
            <div className="bg-accent-500/10 border border-accent-500/50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-accent-400" />
                <p className="text-accent-400 font-medium">Azure connection configured successfully!</p>
              </div>
            </div>
          ) : (
            <>
              {/* Connection Status */}
              <div className="bg-navy-900 rounded-lg border border-navy-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Connection Status</p>
                    <p className="text-white font-medium mt-1">
                      {subscriptions.length > 0 ? 'Connected' : 'Not Connected'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${subscriptions.length > 0 ? 'bg-accent-500' : 'bg-slate-500'}`}></div>
                </div>
              </div>

              {/* Subscription Count */}
              {subscriptions.length > 0 && (
                <div className="bg-navy-900 rounded-lg border border-navy-700 p-4">
                  <p className="text-sm text-slate-400">Subscriptions Found</p>
                  <p className="text-2xl font-bold text-white mt-1">{subscriptions.length}</p>
                </div>
              )}

              {/* Subscription Selection */}
              {subscriptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Subscription
                  </label>
                  <select
                    value={selectedSubscription}
                    onChange={(e) => setSelectedSubscription(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-900 border border-navy-600 rounded-lg text-white focus:outline-none focus:border-accent-500"
                  >
                    {subscriptions.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.state})
                      </option>
                    ))}
                  </select>
                  {selectedSubscription && (
                    <div className="mt-3 p-3 bg-navy-900 rounded-lg border border-navy-700">
                      <p className="text-xs text-slate-400">Subscription ID</p>
                      <p className="text-sm text-slate-300 font-mono mt-1">{selectedSubscription}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Info Box */}
              <div className="bg-accent-500/5 border border-accent-500/20 rounded-lg p-4">
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-accent-400">Note:</span> This connection uses your Azure CLI credentials. 
                  Make sure you're logged in with <code className="bg-navy-900 px-1.5 py-0.5 rounded text-xs">az login</code>.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && !success && subscriptions.length > 0 && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-navy-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors"
            >
              Save Configuration
            </button>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-navy-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

