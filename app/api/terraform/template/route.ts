import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch Terraform templates
export async function GET() {
  try {
    const template = await prisma.terraformTemplate.findUnique({
      where: { id: 'terraform_template' },
    })
    
    return NextResponse.json({
      success: true,
      template: template || null,
    })
  } catch (error: any) {
    console.error('Error fetching Terraform templates:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch templates',
      },
      { status: 500 }
    )
  }
}

// POST - Save Terraform templates
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rgContent, rgVariables, vmContent, vmVariables } = body
    
    // Upsert - update if exists, create if not (singleton pattern)
    const template = await prisma.terraformTemplate.upsert({
      where: { id: 'terraform_template' },
      update: {
        rgContent: rgContent || '',
        rgVariables: rgVariables || '',
        vmContent: vmContent || '',
        vmVariables: vmVariables || '',
      },
      create: {
        id: 'terraform_template',
        rgContent: rgContent || '',
        rgVariables: rgVariables || '',
        vmContent: vmContent || '',
        vmVariables: vmVariables || '',
      },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Template saved successfully',
      template,
    })
  } catch (error: any) {
    console.error('Error saving Terraform template:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save template',
      },
      { status: 500 }
    )
  }
}

