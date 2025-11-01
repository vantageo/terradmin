import hcl from 'hcl2-parser'

export interface TerraformVariable {
  name: string
  type: string
  description?: string
  default?: any
  required: boolean
  order?: number // To preserve order from template
}

export function parseHclVariables(hclContent: string): TerraformVariable[] {
  try {
    if (!hclContent || hclContent.trim() === '') {
      console.warn('Empty HCL content')
      return []
    }

    console.log('Parsing HCL content:', hclContent.substring(0, 200))
    
    const variables: TerraformVariable[] = []
    
    // Use regex to extract variables in order they appear in the file
    // Match: variable "name" { ... }
    const variableRegex = /variable\s+"([^"]+)"\s*{([^}]*)}/g
    let match
    let order = 0
    
    while ((match = variableRegex.exec(hclContent)) !== null) {
      const name = match[1]
      const body = match[2]
      
      // Extract type
      const typeMatch = body.match(/type\s*=\s*(\w+)/)
      const type = typeMatch ? typeMatch[1] : 'string'
      
      // Extract description
      const descMatch = body.match(/description\s*=\s*"([^"]*)"/)
      const description = descMatch ? descMatch[1] : undefined
      
      // Extract default value
      const defaultMatch = body.match(/default\s*=\s*(.+)/)
      let defaultValue = undefined
      if (defaultMatch) {
        const defaultStr = defaultMatch[1].trim()
        // Try to parse the default value
        if (defaultStr === 'true') defaultValue = true
        else if (defaultStr === 'false') defaultValue = false
        else if (defaultStr.startsWith('"') && defaultStr.endsWith('"')) {
          defaultValue = defaultStr.slice(1, -1)
        } else if (!isNaN(Number(defaultStr))) {
          defaultValue = Number(defaultStr)
        } else {
          defaultValue = defaultStr
        }
      }
      
      variables.push({
        name,
        type,
        description,
        default: defaultValue,
        required: defaultValue === undefined,
        order: order++,
      })
    }

    console.log('Extracted variables in order:', variables)
    return variables
  } catch (error) {
    console.error('Error parsing HCL:', error)
    return []
  }
}

export function getDefaultFormValues(variables: TerraformVariable[]): Record<string, any> {
  const defaults: Record<string, any> = {}
  
  variables.forEach(variable => {
    if (variable.default !== undefined) {
      defaults[variable.name] = variable.default
    } else {
      // Set empty defaults based on type
      if (variable.type === 'bool') {
        defaults[variable.name] = false
      } else if (variable.type === 'number') {
        defaults[variable.name] = 0
      } else {
        defaults[variable.name] = ''
      }
    }
  })
  
  return defaults
}

