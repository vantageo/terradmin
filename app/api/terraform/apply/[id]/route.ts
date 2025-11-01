import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params
    const planFolder = path.join(process.cwd(), 'terraform', planId)

    console.log(`[Plan ${planId}] Starting terraform apply...`)

    // Update status to applying
    await prisma.terraformPlan.update({
      where: { id: parseInt(planId) },
      data: { status: 'applying' },
    })

    try {
      // Execute terraform apply
      const applyResult = await execAsync('/usr/bin/terraform apply -no-color apply.tfplan', {
        cwd: planFolder,
        env: { ...process.env },
      })

      const applyOutput = `=== TERRAFORM APPLY ===\n${applyResult.stdout}\n${applyResult.stderr}`
      console.log(`[Plan ${planId}] Terraform apply completed successfully`)

      // Get current output and append apply output
      const currentPlan = await prisma.terraformPlan.findUnique({
        where: { id: parseInt(planId) },
      })

      const combinedOutput = (currentPlan?.output || '') + '\n\n' + applyOutput

      // Update status to applied
      await prisma.terraformPlan.update({
        where: { id: parseInt(planId) },
        data: {
          status: 'applied',
          output: combinedOutput,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Terraform apply completed successfully',
        output: applyOutput,
      })
    } catch (applyError: any) {
      console.error(`[Plan ${planId}] Terraform apply failed:`, applyError)

      const errorOutput = `=== TERRAFORM APPLY ERROR ===\n${applyError.stdout || ''}\n${applyError.stderr || ''}\n${applyError.message}`

      // Get current output and append error
      const currentPlan = await prisma.terraformPlan.findUnique({
        where: { id: parseInt(planId) },
      })

      const combinedOutput = (currentPlan?.output || '') + '\n\n' + errorOutput

      // Update status to failed
      await prisma.terraformPlan.update({
        where: { id: parseInt(planId) },
        data: {
          status: 'apply_failed',
          output: combinedOutput,
          errorMessage: `Terraform apply failed: ${applyError.message}`,
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Terraform apply failed',
          output: errorOutput,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error executing terraform apply:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to execute terraform apply',
      },
      { status: 500 }
    )
  }
}

