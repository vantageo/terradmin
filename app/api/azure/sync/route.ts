import { NextResponse } from 'next/server'
import { AzureCliCredential } from '@azure/identity'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Get Azure configuration
    const azureConfig = await prisma.azureConfig.findUnique({
      where: { id: 'azure_config' },
    })

    if (!azureConfig) {
      return NextResponse.json(
        {
          success: false,
          error: 'Azure not configured. Please configure Azure in Settings.',
        },
        { status: 400 }
      )
    }

    const credential = new AzureCliCredential()
    const tokenResponse = await credential.getToken('https://management.azure.com/.default')

    if (!tokenResponse) {
      throw new Error('Failed to get access token')
    }

    const subscriptionId = azureConfig.subscriptionId

    // Fetch Resource Groups
    console.log('Fetching resource groups...')
    const rgResponse = await fetch(
      `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups?api-version=2021-04-01`,
      {
        headers: {
          'Authorization': `Bearer ${tokenResponse.token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!rgResponse.ok) {
      throw new Error(`Failed to fetch resource groups: ${rgResponse.statusText}`)
    }

    const rgData = await rgResponse.json()
    
    // Store resource groups
    const resourceGroups = []
    for (const rg of rgData.value) {
      const stored = await prisma.resourceGroup.upsert({
        where: { name: rg.name },
        update: {
          location: rg.location,
          subscriptionId: subscriptionId,
          provisioningState: rg.properties?.provisioningState,
          tags: rg.tags || {},
          lastSyncedAt: new Date(),
        },
        create: {
          name: rg.name,
          location: rg.location,
          subscriptionId: subscriptionId,
          provider: 'AZURE',
          provisioningState: rg.properties?.provisioningState,
          tags: rg.tags || {},
        },
      })
      resourceGroups.push(stored)
    }

    console.log(`Synced ${resourceGroups.length} resource groups`)

    // Fetch VMs
    console.log('Fetching VMs...')
    const vmResponse = await fetch(
      `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Compute/virtualMachines?api-version=2023-03-01`,
      {
        headers: {
          'Authorization': `Bearer ${tokenResponse.token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!vmResponse.ok) {
      throw new Error(`Failed to fetch VMs: ${vmResponse.statusText}`)
    }

    const vmData = await vmResponse.json()
    
    // Store VMs
    const vms = []
    for (const vm of vmData.value) {
      // Get instance view for power state
      const instanceViewResponse = await fetch(
        `https://management.azure.com${vm.id}/instanceView?api-version=2023-03-01`,
        {
          headers: {
            'Authorization': `Bearer ${tokenResponse.token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      let powerState = 'Unknown'
      let provisioningState = vm.properties?.provisioningState || 'Unknown'
      
      if (instanceViewResponse.ok) {
        const instanceView = await instanceViewResponse.json()
        const powerStatus = instanceView.statuses?.find((s: any) => s.code.startsWith('PowerState/'))
        if (powerStatus) {
          powerState = powerStatus.code.replace('PowerState/', '')
        }
      }

      // Map power state to VMStatus enum
      let status: 'RUNNING' | 'STOPPED' | 'DEALLOCATED' | 'CREATING' | 'DELETING' | 'ERROR' = 'STOPPED'
      if (powerState.includes('running')) status = 'RUNNING'
      else if (powerState.includes('deallocated')) status = 'DEALLOCATED'
      else if (powerState.includes('stopped')) status = 'STOPPED'
      else if (provisioningState === 'Creating') status = 'CREATING'
      else if (provisioningState === 'Deleting') status = 'DELETING'

      // Get network interface IDs
      const nicIds = vm.properties?.networkProfile?.networkInterfaces?.map((nic: any) => nic.id) || []
      
      // Fetch IP addresses from network interfaces
      let publicIp = null
      let privateIp = null
      
      for (const nicId of nicIds) {
        try {
          const nicResponse = await fetch(
            `https://management.azure.com${nicId}?api-version=2023-05-01`,
            {
              headers: {
                'Authorization': `Bearer ${tokenResponse.token}`,
                'Content-Type': 'application/json',
              },
            }
          )

          if (nicResponse.ok) {
            const nicData = await nicResponse.json()
            const ipConfigs = nicData.properties?.ipConfigurations || []
            
            for (const ipConfig of ipConfigs) {
              if (ipConfig.properties?.privateIPAddress) {
                privateIp = ipConfig.properties.privateIPAddress
              }
              
              if (ipConfig.properties?.publicIPAddress?.id) {
                const publicIpResponse = await fetch(
                  `https://management.azure.com${ipConfig.properties.publicIPAddress.id}?api-version=2023-05-01`,
                  {
                    headers: {
                      'Authorization': `Bearer ${tokenResponse.token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                )
                
                if (publicIpResponse.ok) {
                  const publicIpData = await publicIpResponse.json()
                  publicIp = publicIpData.properties?.ipAddress
                }
              }
            }
          }
        } catch (err) {
          console.error('Error fetching network interface:', err)
        }
      }

      // Extract resource group from VM id
      const rgMatch = vm.id.match(/resourceGroups\/([^\/]+)/)
      const resourceGroup = rgMatch ? rgMatch[1] : null

      const stored = await prisma.virtualMachine.upsert({
        where: { instanceId: vm.id },
        update: {
          name: vm.name,
          status: status,
          powerState: powerState,
          provisioningState: provisioningState,
          region: vm.location,
          size: vm.properties?.hardwareProfile?.vmSize || 'Unknown',
          osType: vm.properties?.storageProfile?.osDisk?.osType,
          computerName: vm.properties?.osProfile?.computerName,
          publicIpAddress: publicIp,
          privateIpAddress: privateIp,
          resourceGroup: resourceGroup,
          subscriptionId: subscriptionId,
          vmId: vm.properties?.vmId,
          networkInterfaces: nicIds,
          disks: vm.properties?.storageProfile?.dataDisks || [],
          tags: vm.tags || {},
          lastSyncedAt: new Date(),
        },
        create: {
          name: vm.name,
          provider: 'AZURE',
          status: status,
          powerState: powerState,
          provisioningState: provisioningState,
          region: vm.location,
          size: vm.properties?.hardwareProfile?.vmSize || 'Unknown',
          osType: vm.properties?.storageProfile?.osDisk?.osType,
          computerName: vm.properties?.osProfile?.computerName,
          publicIpAddress: publicIp,
          privateIpAddress: privateIp,
          resourceGroup: resourceGroup,
          subscriptionId: subscriptionId,
          instanceId: vm.id,
          vmId: vm.properties?.vmId,
          networkInterfaces: nicIds,
          disks: vm.properties?.storageProfile?.dataDisks || [],
          tags: vm.tags || {},
        },
      })
      
      vms.push(stored)
    }

    console.log(`Synced ${vms.length} VMs`)

    // Calculate stats
    const stats = {
      totalVMs: vms.length,
      running: vms.filter(vm => vm.status === 'RUNNING').length,
      stopped: vms.filter(vm => vm.status === 'STOPPED' || vm.status === 'DEALLOCATED').length,
      resourceGroups: resourceGroups.length,
    }

    return NextResponse.json({
      success: true,
      message: 'Azure resources synced successfully',
      stats,
      syncedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error syncing Azure resources:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync Azure resources',
      },
      { status: 500 }
    )
  }
}

