import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const plans = await prisma.terraformPlan.findMany({
      orderBy: { updatedAt: 'desc' },
    })
    
    return NextResponse.json({
      success: true,
      plans,
    })
  } catch (error: any) {
    console.error('Error fetching Terraform plans:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch plans',
      },
      { status: 500 }
    )
  }
}

