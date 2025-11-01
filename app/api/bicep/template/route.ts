import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch Bicep templates
export async function GET() {
  try {
    const template = await prisma.bicepTemplate.findUnique({
      where: { id: 'bicep_template' },
    })
    
    return NextResponse.json({
      success: true,
      template: template || null,
    })
  } catch (error: any) {
    console.error('Error fetching Bicep templates:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch templates',
      },
      { status: 500 }
    )
  }
}

// POST - Save Bicep templates
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rgContent, vmContent } = body
    
    // Upsert - update if exists, create if not (singleton pattern)
    const template = await prisma.bicepTemplate.upsert({
      where: { id: 'bicep_template' },
      update: {
        rgContent: rgContent || '',
        vmContent: vmContent || '',
      },
      create: {
        id: 'bicep_template',
        rgContent: rgContent || '',
        vmContent: vmContent || '',
      },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Template saved successfully',
      template,
    })
  } catch (error: any) {
    console.error('Error saving Bicep template:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save template',
      },
      { status: 500 }
    )
  }
}

