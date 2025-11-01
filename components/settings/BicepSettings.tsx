'use client'

import { useState } from 'react'
import { FileJson, Plus, Edit, Trash2, Copy } from 'lucide-react'

interface Template {
  id: string
  name: string
  type: 'resource-group' | 'vm'
  description: string
  lastModified: string
}

export default function BicepSettings() {
  const [selectedType, setSelectedType] = useState<'resource-group' | 'vm'>('resource-group')

  // Mock templates - replace with API calls
  const templates: Template[] = [
    {
      id: '1',
      name: 'Production Resource Group',
      type: 'resource-group',
      description: 'Resource group with production-level security and tags',
      lastModified: '1 day ago'
    },
    {
      id: '2',
      name: 'Linux VM - Standard',
      type: 'vm',
      description: 'Standard Linux VM with managed disk',
      lastModified: '5 days ago'
    },
    {
      id: '3',
      name: 'Windows VM - IIS',
      type: 'vm',
      description: 'Windows Server with IIS pre-configured',
      lastModified: '1 week ago'
    },
  ]

  const filteredTemplates = templates.filter(t => t.type === selectedType)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <FileJson className="w-5 h-5 text-accent-400" />
          <span>Bicep Templates</span>
        </h3>
        <p className="text-sm text-slate-400 mt-1">Manage Azure Bicep templates for resource deployment</p>
      </div>

      {/* Template Type Selector */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSelectedType('resource-group')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedType === 'resource-group'
              ? 'bg-accent-500 text-navy-900'
              : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
          }`}
        >
          Resource Group Template
        </button>
        <button
          onClick={() => setSelectedType('vm')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedType === 'vm'
              ? 'bg-accent-500 text-navy-900'
              : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
          }`}
        >
          VM Template
        </button>
      </div>

      {/* Templates List */}
      <div className="bg-navy-900 rounded-lg border border-navy-700">
        <div className="p-4 border-b border-navy-700 flex items-center justify-between">
          <h4 className="text-white font-medium">
            {selectedType === 'resource-group' ? 'Resource Group Template' : 'Virtual Machine Template'}
          </h4>
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-navy-900 text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        </div>

        <div className="divide-y divide-navy-700">
          {filteredTemplates.length === 0 ? (
            <div className="p-8 text-center">
              <FileJson className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">No templates found</p>
              <p className="text-sm text-slate-500 mt-1">Create your first template to get started</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div key={template.id} className="p-4 hover:bg-navy-800/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <FileJson className="w-5 h-5 text-accent-400 flex-shrink-0" />
                      <div>
                        <h5 className="text-white font-medium">{template.name}</h5>
                        <p className="text-sm text-slate-400 mt-0.5">{template.description}</p>
                        <p className="text-xs text-slate-500 mt-1">Modified {template.lastModified}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                      title="Copy Template"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                    <button 
                      className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                      title="Edit Template"
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </button>
                    <button 
                      className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Template Preview */}
      {filteredTemplates.length > 0 && (
        <div className="bg-navy-900 rounded-lg border border-navy-700 p-4">
          <h4 className="text-white font-medium mb-3">Template Example</h4>
          <div className="bg-navy-950 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-slate-300 font-mono">
{selectedType === 'resource-group' ? `@description('Resource Group Name')
param resourceGroupName string

@description('Location for all resources')
param location string = resourceGroup().location

@description('Environment tag')
param environment string = 'production'

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
  tags: {
    Environment: environment
    ManagedBy: 'TerraAdmin'
    CreatedDate: utcNow()
  }
}

output resourceGroupId string = rg.id` : `@description('Virtual Machine Name')
param vmName string

@description('Admin Username')
@secure()
param adminUsername string

@description('VM Size')
param vmSize string = 'Standard_B2s'

@description('Location')
param location string = resourceGroup().location

resource vm 'Microsoft.Compute/virtualMachines@2023-03-01' = {
  name: vmName
  location: location
  properties: {
    hardwareProfile: {
      vmSize: vmSize
    }
    osProfile: {
      computerName: vmName
      adminUsername: adminUsername
    }
    storageProfile: {
      imageReference: {
        publisher: 'Canonical'
        offer: '0001-com-ubuntu-server-jammy'
        sku: '22_04-lts'
        version: 'latest'
      }
      osDisk: {
        createOption: 'FromImage'
        managedDisk: {
          storageAccountType: 'Standard_LRS'
        }
      }
    }
  }
  tags: {
    ManagedBy: 'TerraAdmin'
  }
}

output vmId string = vm.id`}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

