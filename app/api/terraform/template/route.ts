import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch Terraform template(s)
// Query params: ?resource=rg|vm&type=linux|windows (type is optional for rg)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resource = searchParams.get('resource')
    const type = searchParams.get('type')
    
    // If resource is specified, fetch that specific template
    if (resource) {
      const template = await prisma.terraformTemplate.findFirst({
        where: {
          resource,
          type: type || null,
        },
      })
      
      return NextResponse.json({
        success: true,
        template: template || null,
      })
    }
    
    // Otherwise return all templates
    const templates = await prisma.terraformTemplate.findMany({
      orderBy: [
        { resource: 'asc' },
        { type: 'asc' },
      ],
    })
    
    return NextResponse.json({
      success: true,
      templates,
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

// POST - Save/Update Terraform template
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { resource, type, name, description, templateContent, variablesContent } = body
    
    if (!resource || !templateContent || !variablesContent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resource, templateContent, and variablesContent are required',
        },
        { status: 400 }
      )
    }
    
    // Check if template exists
    const existingTemplate = await prisma.terraformTemplate.findFirst({
      where: {
        resource,
        type: type || null,
      },
    })

    let template
    if (existingTemplate) {
      // Update existing template
      template = await prisma.terraformTemplate.update({
        where: {
          id: existingTemplate.id,
        },
        data: {
          name: name || `${resource} Template`,
          description,
          templateContent,
          variablesContent,
        },
      })
    } else {
      // Create new template
      template = await prisma.terraformTemplate.create({
        data: {
          resource,
          type: type || null,
          name: name || `${resource} Template`,
          description,
          templateContent,
          variablesContent,
          isDefault: true,
        },
      })
    }
    
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

