import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch current Azure configuration
export async function GET() {
  try {
    const config = await prisma.azureConfig.findUnique({
      where: { id: 'azure_config' },
    })
    
    if (!config) {
      return NextResponse.json({
        success: true,
        connected: false,
        config: null,
      })
    }
    
    return NextResponse.json({
      success: true,
      connected: true,
      config: {
        subscriptionId: config.subscriptionId,
        subscriptionName: config.subscriptionName,
        tenantId: config.tenantId,
        state: config.state,
        isActive: config.isActive,
      },
    })
  } catch (error: any) {
    console.error('Error fetching Azure config:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch Azure configuration',
      },
      { status: 500 }
    )
  }
}

// POST - Save Azure configuration (upsert - create or update)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { subscriptionId, subscriptionName, tenantId, state } = body
    
    if (!subscriptionId || !subscriptionName) {
      return NextResponse.json(
        {
          success: false,
          error: 'subscriptionId and subscriptionName are required',
        },
        { status: 400 }
      )
    }
    
    // Upsert - update if exists, create if not (singleton pattern)
    const config = await prisma.azureConfig.upsert({
      where: { id: 'azure_config' },
      update: {
        subscriptionId,
        subscriptionName,
        tenantId,
        state,
        isActive: true,
      },
      create: {
        id: 'azure_config',
        subscriptionId,
        subscriptionName,
        tenantId,
        state,
        isActive: true,
      },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Azure configuration saved successfully',
      config: {
        subscriptionId: config.subscriptionId,
        subscriptionName: config.subscriptionName,
        tenantId: config.tenantId,
        state: config.state,
      },
    })
  } catch (error: any) {
    console.error('Error saving Azure config:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save Azure configuration',
      },
      { status: 500 }
    )
  }
}

