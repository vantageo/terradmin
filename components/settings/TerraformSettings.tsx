'use client'

import { useState, useEffect } from 'react'
import { FileCode, Plus, Edit, Trash2, Copy, Save } from 'lucide-react'
import Editor from '@monaco-editor/react'
import Toast from '@/components/Toast'

interface Template {
  id: string
  name: string
  type: 'resource-group' | 'vm'
  description: string
  lastModified: string
}

export default function TerraformSettings() {
  const [selectedType, setSelectedType] = useState<'resource-group' | 'vm'>('resource-group')
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Default Resource Group Terraform template
  const [rgTemplate, setRgTemplate] = useState(`resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  
  tags = {
    Environment = var.environment
    ManagedBy   = "TerraAdmin"
    CreatedDate = timestamp()
    Project     = var.project_name
  }
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
}

output "resource_group_id" {
  description = "The ID of the resource group"
  value       = azurerm_resource_group.main.id
}

output "resource_group_name" {
  description = "The name of the resource group"
  value       = azurerm_resource_group.main.name
}`)

  // Default VM Terraform template
  const [vmTemplate, setVmTemplate] = useState(`resource "azurerm_linux_virtual_machine" "main" {
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
    publisher = var.image_publisher
    offer     = var.image_offer
    sku       = var.image_sku
    version   = "latest"
  }
  
  tags = {
    Environment = var.environment
    ManagedBy   = "TerraAdmin"
    Project     = var.project_name
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
    public_ip_address_id          = var.enable_public_ip ? azurerm_public_ip.main[0].id : null
  }
}

resource "azurerm_public_ip" "main" {
  count               = var.enable_public_ip ? 1 : 0
  name                = "\${var.vm_name}-pip"
  location            = var.location
  resource_group_name = var.resource_group_name
  allocation_method   = "Static"
  sku                 = "Standard"
}

variable "vm_name" {
  description = "Name of the virtual machine"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "vm_size" {
  description = "Size of the virtual machine"
  type        = string
  default     = "Standard_B2s"
}

variable "admin_username" {
  description = "Admin username for the VM"
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key" {
  description = "SSH public key for authentication"
  type        = string
}

variable "disk_type" {
  description = "Type of managed disk"
  type        = string
  default     = "Standard_LRS"
}

variable "image_publisher" {
  description = "OS image publisher"
  type        = string
  default     = "Canonical"
}

variable "image_offer" {
  description = "OS image offer"
  type        = string
  default     = "0001-com-ubuntu-server-jammy"
}

variable "image_sku" {
  description = "OS image SKU"
  type        = string
  default     = "22_04-lts"
}

variable "subnet_id" {
  description = "ID of the subnet"
  type        = string
}

variable "enable_public_ip" {
  description = "Enable public IP address"
  type        = bool
  default     = false
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
}

output "vm_id" {
  description = "The ID of the virtual machine"
  value       = azurerm_linux_virtual_machine.main.id
}

output "vm_private_ip" {
  description = "Private IP address of the VM"
  value       = azurerm_network_interface.main.private_ip_address
}

output "vm_public_ip" {
  description = "Public IP address of the VM"
  value       = var.enable_public_ip ? azurerm_public_ip.main[0].ip_address : null
}`)

  // Mock templates - replace with API calls
  const templates: Template[] = [
    {
      id: '1',
      name: 'Standard Resource Group',
      type: 'resource-group',
      description: 'Basic resource group template with standard tags',
      lastModified: '2 days ago'
    },
    {
      id: '2',
      name: 'Linux VM - Ubuntu 22.04',
      type: 'vm',
      description: 'Standard Ubuntu 22.04 LTS virtual machine',
      lastModified: '1 week ago'
    },
    {
      id: '3',
      name: 'Windows VM - Server 2022',
      type: 'vm',
      description: 'Windows Server 2022 Datacenter edition',
      lastModified: '3 days ago'
    },
  ]

  const filteredTemplates = templates.filter(t => t.type === selectedType)
  
  // Load templates from database on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/terraform/template')
      const data = await response.json()
      
      if (data.success && data.template) {
        if (data.template.rgContent) {
          setRgTemplate(data.template.rgContent)
        }
        if (data.template.vmContent) {
          setVmTemplate(data.template.vmContent)
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }
  
  const handleSaveTemplate = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/terraform/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rgContent: rgTemplate,
          vmContent: vmTemplate,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setToast({ message: 'Template saved successfully!', type: 'success' })
      } else {
        throw new Error(data.error || 'Failed to save')
      }
    } catch (error: any) {
      console.error('Save error:', error)
      setToast({ message: 'Failed to save template', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <FileCode className="w-5 h-5 text-accent-400" />
          <span>Terraform Templates</span>
        </h3>
        <p className="text-sm text-slate-400 mt-1">Manage Infrastructure as Code templates for Azure resources</p>
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

      {/* Resource Group Template Editor */}
      {selectedType === 'resource-group' ? (
        <div className="bg-navy-900 rounded-lg border border-navy-700">
          <div className="p-4 border-b border-navy-700 flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Azure Resource Group Template</h4>
              <p className="text-xs text-slate-400 mt-0.5">Edit your Terraform template for Azure resource groups</p>
            </div>
            <button 
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
            </button>
          </div>

          <div className="h-[600px]">
            <Editor
              height="100%"
              defaultLanguage="hcl"
              theme="vs-dark"
              value={rgTemplate}
              onChange={(value) => setRgTemplate(value || '')}
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
          </div>
        </div>
      ) : (
        /* VM Template Editor */
        <div className="bg-navy-900 rounded-lg border border-navy-700">
          <div className="p-4 border-b border-navy-700 flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Azure Virtual Machine Template</h4>
              <p className="text-xs text-slate-400 mt-0.5">Edit your Terraform template for Azure virtual machines</p>
            </div>
            <button 
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-navy-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
            </button>
          </div>

          <div className="h-[600px]">
            <Editor
              height="100%"
              defaultLanguage="hcl"
              theme="vs-dark"
              value={vmTemplate}
              onChange={(value) => setVmTemplate(value || '')}
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
          </div>
        </div>
      )}

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

