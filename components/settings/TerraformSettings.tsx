'use client'

import { useState, useEffect } from 'react'
import { FileCode, Save } from 'lucide-react'
import Editor from '@monaco-editor/react'
import Toast from '@/components/Toast'
import CustomSelect from '@/components/ui/CustomSelect'

export default function TerraformSettings() {
  const [selectedTab, setSelectedTab] = useState<'resource-group' | 'vm'>('resource-group')
  const [vmType, setVmType] = useState<'linux' | 'windows'>('linux')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Template and variables content states
  const [rgTemplate, setRgTemplate] = useState('')
  const [rgVariables, setRgVariables] = useState('')
  const [vmTemplate, setVmTemplate] = useState('')
  const [vmVariables, setVmVariables] = useState('')

  // Load templates on mount and when switching
  useEffect(() => {
    if (selectedTab === 'resource-group') {
      loadTemplate('rg', null)
    }
  }, [selectedTab])

  useEffect(() => {
    if (selectedTab === 'vm') {
      loadTemplate('vm', vmType)
    }
  }, [selectedTab, vmType])

  const loadTemplate = async (resource: string, type: string | null) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('resource', resource)
      if (type) params.set('type', type)
      
      const response = await fetch(`/api/terraform/template?${params}`)
      const data = await response.json()
      
      if (data.success && data.template) {
        if (resource === 'rg') {
          setRgTemplate(data.template.templateContent || '')
          setRgVariables(data.template.variablesContent || '')
        } else {
          setVmTemplate(data.template.templateContent || '')
          setVmVariables(data.template.variablesContent || '')
        }
      } else {
        // Set default content if no template exists
        if (resource === 'rg') {
          setRgTemplate(getDefaultRgTemplate())
          setRgVariables(getDefaultRgVariables())
        } else {
          setVmTemplate(getDefaultVmTemplate(type as 'linux' | 'windows'))
          setVmVariables(getDefaultVmVariables(type as 'linux' | 'windows'))
        }
      }
    } catch (error) {
      console.error('Error loading template:', error)
      setToast({ message: 'Failed to load template', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTemplate = async () => {
    setIsSaving(true)
    try {
      const resource = selectedTab === 'resource-group' ? 'rg' : 'vm'
      const type = selectedTab === 'vm' ? vmType : null
      const templateContent = selectedTab === 'resource-group' ? rgTemplate : vmTemplate
      const variablesContent = selectedTab === 'resource-group' ? rgVariables : vmVariables
      const name = selectedTab === 'resource-group' 
        ? 'Resource Group Template' 
        : `${vmType.charAt(0).toUpperCase() + vmType.slice(1)} VM Template`
      
      const response = await fetch('/api/terraform/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource,
          type,
          name,
          templateContent,
          variablesContent,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setToast({ message: 'Template saved successfully!', type: 'success' })
      } else {
        throw new Error(data.error || 'Failed to save template')
      }
    } catch (error: any) {
      console.error('Error saving template:', error)
      setToast({ message: error.message || 'Failed to save template', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const getDefaultRgTemplate = () => `# Configure the Azure provider
provider "azurerm" {
  features {}
}

# Create a Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}`

  const getDefaultRgVariables = () => `variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
}

variable "location" {
  description = "Azure region where the resources will be created"
  type        = string
}`

  const getDefaultVmTemplate = (type: 'linux' | 'windows') => {
    if (type === 'linux') {
      return `# Configure the Azure provider
provider "azurerm" {
  features {}
}

# Create a Linux Virtual Machine
resource "azurerm_linux_virtual_machine" "main" {
  name                = var.vm_name
  resource_group_name = var.resource_group_name
  location            = var.location
  size                = var.vm_size
  admin_username      = var.admin_username
  
  network_interface_ids = [
    azurerm_network_interface.main.id,
  ]
  
  admin_ssh_key {
    username   = var.admin_username
    public_key = var.ssh_public_key
  }
  
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = var.disk_type
  }
  
  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }
}

resource "azurerm_network_interface" "main" {
  name                = "\${var.vm_name}-nic"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
  }
}`
    } else {
      return `# Configure the Azure provider
provider "azurerm" {
  features {}
}

# Create a Windows Virtual Machine
resource "azurerm_windows_virtual_machine" "main" {
  name                = var.vm_name
  resource_group_name = var.resource_group_name
  location            = var.location
  size                = var.vm_size
  admin_username      = var.admin_username
  admin_password      = var.admin_password
  
  network_interface_ids = [
    azurerm_network_interface.main.id,
  ]
  
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = var.disk_type
  }
  
  source_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2019-Datacenter"
    version   = "latest"
  }
}

resource "azurerm_network_interface" "main" {
  name                = "\${var.vm_name}-nic"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
  }
}`
    }
  }

  const getDefaultVmVariables = (type: 'linux' | 'windows') => {
    if (type === 'linux') {
      return `variable "vm_name" {
  description = "Name of the virtual machine"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "vm_size" {
  description = "Size of the VM"
  type        = string
  default     = "Standard_B2s"
}

variable "admin_username" {
  description = "Admin username"
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key" {
  description = "SSH public key"
  type        = string
}

variable "disk_type" {
  description = "Disk type"
  type        = string
  default     = "Standard_LRS"
}

variable "subnet_id" {
  description = "Subnet ID"
  type        = string
}`
    } else {
      return `variable "vm_name" {
  description = "Name of the virtual machine"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "vm_size" {
  description = "Size of the VM"
  type        = string
  default     = "Standard_B2s"
}

variable "admin_username" {
  description = "Admin username"
  type        = string
  default     = "adminuser"
}

variable "admin_password" {
  description = "Admin password"
  type        = string
  sensitive   = true
}

variable "disk_type" {
  description = "Disk type"
  type        = string
  default     = "Standard_LRS"
}

variable "subnet_id" {
  description = "Subnet ID"
  type        = string
}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <FileCode className="w-5 h-5 text-accent-400" />
          <span>Terraform Templates</span>
        </h3>
        <p className="text-sm text-slate-400 mt-1">Manage Infrastructure as Code templates for Azure resources</p>
      </div>

      {/* Template Type Selector */}
      <div className="flex items-center space-x-6 border-b border-navy-700">
        <button
          onClick={() => setSelectedTab('resource-group')}
          className={`px-4 py-3 font-medium transition-all relative ${
            selectedTab === 'resource-group'
              ? 'text-accent-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Resource Group Template
          {selectedTab === 'resource-group' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"></span>
          )}
        </button>
        <button
          onClick={() => setSelectedTab('vm')}
          className={`px-4 py-3 font-medium transition-all relative ${
            selectedTab === 'vm'
              ? 'text-accent-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          VM Template
          {selectedTab === 'vm' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"></span>
          )}
        </button>
      </div>

      {/* VM Type Dropdown (only shown for VM tab) */}
      {selectedTab === 'vm' && (
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-300">VM Type:</label>
          <CustomSelect
            value={vmType}
            onChange={(value) => setVmType(value as 'linux' | 'windows')}
            options={[
              { value: 'linux', label: 'Linux' },
              { value: 'windows', label: 'Windows' },
            ]}
            className="w-48"
          />
        </div>
      )}

      {/* Template Editor */}
      <div className="space-y-4">
        {/* Template Resources Editor */}
        <div className="bg-navy-900 rounded-lg border border-navy-700">
          <div className="p-4 border-b border-navy-700 flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">
                {selectedTab === 'resource-group' 
                  ? 'Azure Resource Group Template' 
                  : `Azure ${vmType.charAt(0).toUpperCase() + vmType.slice(1)} VM Template`}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Edit your Terraform template resources
              </p>
            </div>
            <button 
              onClick={handleSaveTemplate}
              disabled={isSaving || isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
            </button>
          </div>

          <div className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400">Loading template...</p>
              </div>
            ) : (
              <Editor
                height="100%"
                defaultLanguage="hcl"
                theme="vs-dark"
                value={selectedTab === 'resource-group' ? rgTemplate : vmTemplate}
                onChange={(value) => {
                  if (selectedTab === 'resource-group') {
                    setRgTemplate(value || '')
                  } else {
                    setVmTemplate(value || '')
                  }
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            )}
          </div>
        </div>

        {/* Variables Editor */}
        <div className="bg-navy-900 rounded-lg border border-navy-700">
          <div className="p-4 border-b border-navy-700">
            <div>
              <h4 className="text-white font-medium">
                {selectedTab === 'resource-group' 
                  ? 'Resource Group Variables' 
                  : `${vmType.charAt(0).toUpperCase() + vmType.slice(1)} VM Variables`}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Edit variable declarations for your template
              </p>
            </div>
          </div>

          <div className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400">Loading variables...</p>
              </div>
            ) : (
              <Editor
                height="100%"
                defaultLanguage="hcl"
                theme="vs-dark"
                value={selectedTab === 'resource-group' ? rgVariables : vmVariables}
                onChange={(value) => {
                  if (selectedTab === 'resource-group') {
                    setRgVariables(value || '')
                  } else {
                    setVmVariables(value || '')
                  }
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            )}
          </div>
        </div>
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
