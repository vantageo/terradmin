import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all Azure VMs from database
    const vms = await prisma.virtualMachine.findMany({
      where: {
        provider: 'AZURE',
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Fetch resource groups count
    const resourceGroupsCount = await prisma.resourceGroup.count({
      where: {
        provider: 'AZURE',
      },
    })

    // Calculate stats
    const stats = {
      totalVMs: vms.length,
      running: vms.filter(vm => vm.status === 'RUNNING').length,
      stopped: vms.filter(vm => vm.status === 'STOPPED' || vm.status === 'DEALLOCATED').length,
      resourceGroups: resourceGroupsCount,
    }

    return NextResponse.json({
      success: true,
      vms: vms.map(vm => ({
        id: vm.id,
        name: vm.name,
        status: vm.status,
        powerState: vm.powerState,
        region: vm.region,
        size: vm.size,
        resourceGroup: vm.resourceGroup,
        publicIpAddress: vm.publicIpAddress,
        privateIpAddress: vm.privateIpAddress,
        osType: vm.osType,
      })),
      stats,
    })
  } catch (error: any) {
    console.error('Error fetching VMs:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch VMs',
      },
      { status: 500 }
    )
  }
}

