import { NextResponse } from 'next/server'
import { AzureCliCredential } from '@azure/identity'

export async function GET() {
  try {
    // Use AzureCliCredential to explicitly use Azure CLI credentials
    const credential = new AzureCliCredential()
    
    // Get access token for Azure Resource Manager
    const tokenResponse = await credential.getToken('https://management.azure.com/.default')
    
    if (!tokenResponse) {
      throw new Error('Failed to get access token')
    }
    
    // Call Azure REST API directly to list subscriptions
    const response = await fetch('https://management.azure.com/subscriptions?api-version=2022-12-01', {
      headers: {
        'Authorization': `Bearer ${tokenResponse.token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Azure API returned ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Transform the response
    const subscriptions = data.value.map((sub: any) => ({
      id: sub.subscriptionId,
      name: sub.displayName,
      state: sub.state,
      tenantId: sub.tenantId,
    }))
    
    return NextResponse.json({
      success: true,
      subscriptions,
      count: subscriptions.length,
    })
  } catch (error: any) {
    console.error('Error fetching Azure subscriptions:', error)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch Azure subscriptions',
        details: 'Make sure you are authenticated with Azure CLI (az login)',
      },
      { status: 500 }
    )
  }
}

