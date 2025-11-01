import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  let planRecord: any = null
  
  try {
    const body = await request.json()
    const { type, variables } = body
    
    if (!type || !variables) {
      return NextResponse.json(
        { success: false, error: 'Type and variables are required' },
        { status: 400 }
      )
    }

    // Create database record
    planRecord = await prisma.terraformPlan.create({
      data: {
        type,
        variables,
        status: 'pending',
      },
    })

    const planId = planRecord.id
    const planIdStr = planId.toString()
    
    // Ensure terraform root folder exists
    const terraformRoot = path.join(process.cwd(), 'terraform')
    await fs.mkdir(terraformRoot, { recursive: true })
    
    // Create plan-specific subfolder
    const planFolder = path.join(terraformRoot, planIdStr)
    await fs.mkdir(planFolder, { recursive: true })
    
    // Fetch the resource group template from database
    const template = await prisma.terraformTemplate.findUnique({
      where: { id: 'terraform_template' },
    })
    
    const rgTemplateContent = template?.rgContent || `# Configure the Azure provider
provider "azurerm" {
  features {}
}

# Create a Resource Group
resource "azurerm_resource_group" "example" {
  name     = var.resource_group_name
  location = var.location
}`

    const rgVariablesContent = template?.rgVariables || `variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
}

variable "location" {
  description = "Azure region where the resources will be created"
  type        = string
}`
    
    // Create rg.tf file
    const rgTfPath = path.join(planFolder, 'rg.tf')
    await fs.writeFile(rgTfPath, rgTemplateContent, 'utf-8')
    
    // Create variables.tf file
    const variablesTfPath = path.join(planFolder, 'variables.tf')
    await fs.writeFile(variablesTfPath, rgVariablesContent, 'utf-8')
    
    // Create terraform.tfvars file dynamically from all variables
    let tfvarsContent = ''
    if (type === 'resource-group') {
      // Generate tfvars from all submitted variables
      const tfvarsLines: string[] = []
      
      for (const [key, value] of Object.entries(variables)) {
        // Format each variable line with proper alignment
        const paddedKey = key.padEnd(20)
        tfvarsLines.push(`${paddedKey} = "${value}"`)
      }
      
      tfvarsContent = tfvarsLines.join('\n')
    }
    
    const tfvarsPath = path.join(planFolder, 'terraform.tfvars')
    await fs.writeFile(tfvarsPath, tfvarsContent, 'utf-8')
    
    // Execute terraform init
    await prisma.terraformPlan.update({
      where: { id: planId },
      data: { status: 'init' },
    })
    
    let initOutput = ''
    let planOutput = ''
    let combinedOutput = ''
    
    try {
      console.log(`[Plan ${planIdStr}] Running terraform init...`)
      const initResult = await execAsync('/usr/bin/terraform init -no-color', {
        cwd: planFolder,
        env: { ...process.env },
      })
      initOutput = `=== TERRAFORM INIT ===\n${initResult.stdout}\n${initResult.stderr}\n\n`
      combinedOutput += initOutput
      console.log(`[Plan ${planIdStr}] Terraform init completed successfully`)
      
      // Execute terraform plan
      await prisma.terraformPlan.update({
        where: { id: planId },
        data: { status: 'planning', output: combinedOutput },
      })
      
      console.log(`[Plan ${planIdStr}] Running terraform plan...`)
      const planResult = await execAsync('/usr/bin/terraform plan -no-color -out=apply.tfplan', {
        cwd: planFolder,
        env: { ...process.env },
      })
      planOutput = `=== TERRAFORM PLAN ===\n${planResult.stdout}\n${planResult.stderr}`
      combinedOutput += planOutput
      console.log(`[Plan ${planIdStr}] Terraform plan completed successfully`)
      
      // Generate plan.txt file
      console.log(`[Plan ${planIdStr}] Generating plan.txt...`)
      await execAsync('/usr/bin/terraform show -no-color apply.tfplan > plan.txt', {
        cwd: planFolder,
        env: { ...process.env },
        shell: '/bin/bash',
      })
      console.log(`[Plan ${planIdStr}] plan.txt generated successfully`)
      
      // Update status to success with full output
      await prisma.terraformPlan.update({
        where: { id: planId },
        data: { 
          status: 'success',
          output: combinedOutput,
        },
      })
      
      return NextResponse.json({
        success: true,
        message: 'Terraform plan created and executed successfully',
        planId: planIdStr,
        folder: planFolder,
        output: combinedOutput,
      })
      
    } catch (terraformError: any) {
      console.error(`[Plan ${planIdStr}] Terraform execution failed:`, terraformError)
      
      const errorOutput = terraformError.stdout || terraformError.stderr || terraformError.message
      combinedOutput += `\n=== ERROR ===\n${errorOutput}`
      
      await prisma.terraformPlan.update({
        where: { id: planId },
        data: { 
          status: 'failed',
          output: combinedOutput,
          errorMessage: `Terraform execution failed: ${errorOutput}`,
        },
      })
      
      return NextResponse.json({
        success: false,
        error: 'Terraform execution failed',
        planId: planIdStr,
        output: combinedOutput,
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Error creating Terraform plan:', error)
    
    // Update status to failed if record was created
    if (planRecord?.id) {
      try {
        await prisma.terraformPlan.update({
          where: { id: planRecord.id },
          data: { 
            status: 'failed',
            errorMessage: error.message || 'Unknown error occurred'
          },
        })
      } catch (updateError) {
        console.error('Error updating plan status:', updateError)
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create Terraform plan',
      },
      { status: 500 }
    )
  }
}

