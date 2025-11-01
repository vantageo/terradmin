import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params
    const planFolder = path.join(process.cwd(), 'terraform', planId)
    const planTxtPath = path.join(planFolder, 'plan.txt')

    // Check if plan.txt file exists
    try {
      await fs.access(planTxtPath)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Plan file not found' },
        { status: 404 }
      )
    }

    // Read plan.txt file
    try {
      const content = await fs.readFile(planTxtPath, 'utf-8')

      return NextResponse.json({
        success: true,
        content,
      })
    } catch (error: any) {
      console.error('Error reading plan file:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to read plan file',
          details: error.message,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error fetching plan file:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch plan file' },
      { status: 500 }
    )
  }
}

