import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params

    const plan = await prisma.terraformPlan.findUnique({
      where: { id: parseInt(planId) },
      select: {
        output: true,
        status: true,
      },
    })

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      output: plan.output || 'No logs available',
      status: plan.status,
    })
  } catch (error: any) {
    console.error('Error fetching plan logs:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}

