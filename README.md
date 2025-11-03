# Vantage Point

A multi-cloud VM management dashboard for Azure, AWS, and vCenter built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Current Implementation Status

### ✅ Completed Features

#### Core Infrastructure
- **Next.js 15+ Application** with App Router and TypeScript
- **PostgreSQL Database** via Docker with Prisma ORM
- **Dark Navy Theme** with light green accents using Tailwind CSS
- **Responsive Layout** with collapsible sidebar navigation
- **Toast Notifications** - Custom toast component for user feedback

#### Azure Integration (PRIMARY FOCUS)
- ✅ **Azure CLI Authentication** using `AzureCliCredential`
- ✅ **Subscription Management** - Connect and store single Azure subscription
- ✅ **VM Sync Functionality** - Fetch and store all Azure VMs with full details
- ✅ **Resource Group Tracking** - Sync and store all Azure resource groups
- ✅ **Real-time Data Display** - View VMs with status, region, size, IPs
- ✅ **Network Details** - Public and private IP addresses fetched from NICs
- ✅ **Power State Monitoring** - Running, Stopped, Deallocated states
- ✅ **Search & Filter** - Search by name/resource group, filter by region
- ✅ **OS Detection** - Linux/Windows icons displayed for each VM

#### Terraform Integration (NEW!)
- ✅ **Template Management** - Dual Monaco editors for templates and variables
- ✅ **Resource Group Templates** - Separate editors for RG resources and variables
- ✅ **VM Templates** - Separate editors for VM resources and variables
- ✅ **Dynamic Form Generation** - Forms auto-generated from HCL variable definitions
- ✅ **HCL Parsing** - Uses `hcl2-parser` to extract variable metadata
- ✅ **Plan Execution** - Automated `terraform init` and `terraform plan`
- ✅ **Apply Execution** - Full `terraform apply` with real-time feedback
- ✅ **Plan Storage** - Store plans with sequential numeric IDs (starting at 1000)
- ✅ **Plan Visualization** - Two-tab view for logs and human-readable plans
- ✅ **File Management** - Auto-generate terraform files in dedicated folders
- ✅ **No-Color Output** - Clean terminal output for better readability
- ✅ **Auto-scroll Logs** - Logs panel automatically scrolls to bottom
- ✅ **Dynamic tfvars** - All form variables written to terraform.tfvars automatically

#### Settings Management
- ✅ **Tabbed Settings Interface** with five sections:
  - **Cloud Providers** - Azure connection management (AWS/vCenter placeholders)
  - **Notification Settings** - Toggle preferences for alerts
  - **Terraform** - Edit and save Terraform templates (RG & VM)
  - **Bicep** - Edit and save Bicep templates (RG & VM)
  - **User Management** - Profile and user administration UI

#### Pages & Navigation
- `/` - Dashboard home with overview statistics
- `/azure` - Azure VMs management (fully functional)
- `/aws` - AWS VMs placeholder
- `/vcenter` - vCenter VMs placeholder
- `/activity` - Terraform plan history and logs viewer
- `/settings` - Multi-tab settings interface

## 📋 Tech Stack

- **Framework**: Next.js 15.0.3 with App Router
- **Language**: TypeScript 5.6.3
- **Styling**: Tailwind CSS 3.4.14
- **Database**: PostgreSQL (Docker)
- **ORM**: Prisma 6.18.0
- **Icons**: Lucide React 0.462.0
- **Code Editor**: Monaco Editor (VS Code editor component)
- **HCL Parser**: hcl2-parser (for Terraform variable parsing)
- **IaC Tools**: Terraform (automated execution with init, plan, apply)
- **Azure SDKs**: 
  - `@azure/identity` - Authentication
  - `@azure/arm-subscriptions` - Subscription management
  - `@azure/arm-compute` - VM operations
  - `@azure/arm-network` - Network interface operations
  - `@azure/arm-resources` - Resource group operations

## 🗄️ Database Schema

### Models

#### `AzureConfig` (Singleton)
```prisma
- id: "azure_config" (fixed ID - only one record)
- subscriptionId: String
- subscriptionName: String
- tenantId: String?
- state: String?
- isActive: Boolean
- createdAt, updatedAt: DateTime
```

#### `VirtualMachine`
```prisma
- id: String (cuid)
- name: String
- provider: CloudProvider (AZURE|AWS|VCENTER)
- status: VMStatus (RUNNING|STOPPED|DEALLOCATED|CREATING|DELETING|ERROR)
- powerState: String? (detailed power state from Azure)
- provisioningState: String?
- region: String (location)
- size: String (VM size, e.g., Standard_B2s)
- osType: String? (Linux|Windows)
- computerName: String?
- publicIpAddress: String?
- privateIpAddress: String?
- resourceGroup: String?
- subscriptionId: String?
- instanceId: String @unique (Azure resource ID)
- vmId: String? (Azure VM UUID)
- networkInterfaces: Json? (NIC details)
- disks: Json? (disk information)
- tags: Json? (Azure tags)
- createdAt, updatedAt, lastSyncedAt: DateTime
```

#### `ResourceGroup`
```prisma
- id: String (cuid)
- name: String @unique
- location: String
- subscriptionId: String
- provider: CloudProvider
- provisioningState: String?
- tags: Json?
- createdAt, updatedAt, lastSyncedAt: DateTime
```

#### `TerraformTemplate` (Multi-row with unique constraint)
```prisma
- id: String (cuid)
- resource: String ("rg" | "vm")
- type: String? (null for RG, "linux" | "windows" for VM)
- name: String (user-friendly name)
- description: String? (optional description)
- templateContent: Text (Template resources only)
- variablesContent: Text (Variable declarations only)
- isDefault: Boolean
- createdAt, updatedAt: DateTime
- @@unique([resource, type]) (one template per resource/type combination)
```

**Examples**:
- Resource Group: `{ resource: "rg", type: null, ... }`
- Linux VM: `{ resource: "vm", type: "linux", ... }`
- Windows VM: `{ resource: "vm", type: "windows", ... }`

#### `BicepTemplate` (Singleton)
```prisma
- id: "bicep_template" (fixed ID - only one record)
- rgContent: Text (Resource Group template)
- vmContent: Text (VM template)
- createdAt, updatedAt: DateTime
```

#### `TerraformPlan`
```prisma
- id: Int @autoincrement (starts at 1000)
- type: String (resource-group | vm)
- variables: Json (terraform variables)
- status: String (pending | init | planning | success | failed | applying | applied | apply_failed)
- output: Text? (raw terraform output - includes init, plan, and apply logs)
- errorMessage: Text?
- createdAt, updatedAt: DateTime
```

#### `DeploymentLog`
```prisma
- id: String (cuid)
- vmId: String?
- action: String
- status: String
- message: String?
- metadata: Json?
- createdAt: DateTime
```

## 🔌 API Routes

### Azure APIs

#### `GET /api/azure/subscriptions`
Fetches all Azure subscriptions from current Azure CLI session.
- Uses `AzureCliCredential` for authentication
- Calls Azure Management REST API directly
- Returns: subscription ID, name, state, tenant ID

#### `GET /api/azure/config`
Retrieves stored Azure configuration from database.
- Returns connected status and subscription details

#### `POST /api/azure/config`
Saves/updates Azure subscription configuration (upsert).
- Body: `{ subscriptionId, subscriptionName, tenantId, state }`
- Singleton pattern - only one Azure config

#### `POST /api/azure/sync`
**Main sync operation** - Fetches all Azure resources and stores in database:
1. Fetches all resource groups
2. Fetches all VMs in subscription
3. For each VM:
   - Gets instance view for power state
   - Fetches network interfaces
   - Extracts public and private IPs
   - Maps to database schema
4. Upserts all data (creates or updates existing records)
- Returns: stats (totalVMs, running, stopped, resourceGroups)

#### `GET /api/azure/vms`
Retrieves all Azure VMs from local database (fast).
- Returns: VM list with stats
- No Azure API calls - reads from DB only

### Terraform APIs

#### `GET /api/terraform/template`
Retrieves stored Terraform templates.
- Query params: `?resource=rg|vm&type=linux|windows` (type optional for rg)
- Without params: returns all templates
- With params: returns specific template
- Returns: `{ template: { templateContent, variablesContent, ... } }`
- Uses `findFirst` to handle nullable type field

#### `POST /api/terraform/template`
Saves/updates Terraform templates.
- Body: `{ resource, type, name, description, templateContent, variablesContent }`
- Uses find-then-update/create pattern (not upsert due to nullable type constraint)
- One template per resource/type combination via unique constraint
- Stores resources and variable declarations separately

#### `POST /api/terraform/plan`
**Creates and executes Terraform plan**:
1. Creates database record with sequential ID (1000+)
2. Creates folder: `terraform/{planId}/`
3. Fetches template from database by resource and type
4. Writes files:
   - `main.tf` - Template resources from database (templateContent)
   - `variables.tf` - Variable declarations from database (variablesContent)
   - `terraform.tfvars` - User input values (all form variables dynamically)
5. Executes `terraform init -no-color`
6. Executes `terraform plan -no-color -out=apply.tfplan`
7. Generates `plan.txt` via `terraform show -no-color`
8. Updates database with output and status
- Body: `{ type, variables }` (variables is JSON with all form inputs)
- Returns: `{ success, planId, folder, output }`

#### `GET /api/terraform/plan/[id]/tfplan`
Retrieves human-readable plan file.
- Reads pre-generated `plan.txt` file
- Returns: formatted plan content

#### `GET /api/terraform/plan/[id]/logs`
Retrieves complete execution logs for a plan.
- Returns logs from database (init + plan + apply)
- Body: `{ success, output }`

#### `GET /api/terraform/plans`
Retrieves all Terraform plans.
- Returns all plans ordered by updatedAt (newest first)
- Body: `{ success, plans: [...] }`

#### `POST /api/terraform/apply/[id]`
**Executes Terraform apply for a plan**:
1. Validates that plan exists and has `apply.tfplan` file
2. Updates status to "applying"
3. Executes `terraform apply -no-color apply.tfplan`
4. Appends apply output to existing logs in database
5. Updates status to "applied" or "apply_failed"
6. Returns apply output
- Returns: `{ success, message, output }`

### Bicep APIs

#### `GET /api/bicep/template`
Retrieves stored Bicep templates (RG and VM).

#### `POST /api/bicep/template`
Saves/updates Bicep templates (upsert).

## 🔐 Authentication & Authorization

### Current Setup
- **Azure CLI Authentication** - Uses `az login` credentials
- **AzureCliCredential** from `@azure/identity`
- Works locally for development
- No user authentication yet (placeholder UI in settings)

### For Production
Update to use one of:
1. **Managed Identity** (if hosting on Azure)
2. **Service Principal** with environment variables:
   ```
   AZURE_TENANT_ID=...
   AZURE_CLIENT_ID=...
   AZURE_CLIENT_SECRET=...
   ```

## 🎨 Theme & Styling

### Color Palette
```javascript
// Primary Backgrounds
navy-900: #0f172a  // Main background
navy-800: #1e293b  // Cards, sidebar
navy-700: #334155  // Borders, hover states

// Accents
accent-400: #4ade80  // Light green
accent-500: #22c55e  // Main green
accent-600: #16a34a  // Hover green

// Text
slate-100: #f1f5f9  // Primary text
slate-400: #94a3b8  // Secondary text
```

### Component Structure
- **Sidebar**: Collapsible navigation with active state highlighting
- **Header**: Page title, breadcrumbs, user profile
- **Cards**: Stats display with hover effects
- **Tables**: VM listings with status badges
- **Modals**: Azure configuration dialog

## 📁 Project Structure

```
terradmin/
├── app/
│   ├── api/
│   │   ├── azure/
│   │   │   ├── subscriptions/route.ts  # Fetch Azure subscriptions
│   │   │   ├── config/route.ts         # Get/save Azure config
│   │   │   ├── sync/route.ts           # Sync VMs from Azure
│   │   │   └── vms/route.ts            # Get VMs from DB
│   │   ├── terraform/
│   │   │   ├── template/route.ts       # Get/save Terraform templates
│   │   │   ├── plans/route.ts          # Get all plans
│   │   │   ├── plan/
│   │   │   │   ├── route.ts            # Create/execute plan
│   │   │   │   └── [id]/
│   │   │   │       ├── tfplan/route.ts # Get plan output
│   │   │   │       └── logs/route.ts   # Get execution logs
│   │   │   └── apply/[id]/route.ts     # Execute terraform apply
│   │   └── bicep/
│   │       └── template/route.ts       # Get/save Bicep templates
│   ├── azure/page.tsx                  # Azure VMs management (fully functional)
│   ├── aws/page.tsx                    # AWS placeholder
│   ├── vcenter/page.tsx                # vCenter placeholder
│   ├── activity/page.tsx               # Terraform plan history viewer
│   ├── settings/page.tsx               # Settings with tabs
│   ├── layout.tsx                      # Root layout
│   ├── page.tsx                        # Dashboard home
│   └── globals.css                     # Tailwind styles
├── components/
│   ├── Sidebar.tsx                     # Navigation sidebar
│   ├── Header.tsx                      # Top header
│   ├── DashboardCard.tsx               # Stat cards
│   ├── Toast.tsx                       # Toast notification component
│   ├── AzureConfigModal.tsx            # Azure config modal
│   ├── activity/
│   │   ├── VariablesModal.tsx          # View plan variables modal
│   │   └── LogsModal.tsx               # View plan logs modal
│   ├── azure/
│   │   └── ResourceGroupModal.tsx      # RG deployment modal with plan execution
│   ├── settings/
│   │   ├── CloudProviders.tsx          # Cloud provider settings
│   │   ├── NotificationSettings.tsx    # Notification prefs
│   │   ├── TerraformSettings.tsx       # Terraform template editor (dual editors)
│   │   ├── BicepSettings.tsx           # Bicep template editor
│   │   └── UserManagement.tsx          # User management UI
│   └── ui/
│       └── CustomSelect.tsx            # Styled dropdown component
├── lib/
│   ├── prisma.ts                       # Prisma singleton
│   └── hclParser.ts                    # HCL variable parser (regex-based)
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── migrations/                     # Migration history
├── terraform/                          # Terraform plan folders (gitignored)
│   ├── .gitkeep                        # Preserve folder in git
│   ├── 1000/                           # Plan ID folders
│   │   ├── main.tf                     # Generated template (resources)
│   │   ├── variables.tf                # Variable declarations
│   │   ├── terraform.tfvars            # User input values
│   │   ├── apply.tfplan                # Binary plan file
│   │   ├── plan.txt                    # Human-readable plan
│   │   └── .terraform/                 # Terraform working dir
│   └── 1001/                           # Next plan...
├── docker-compose.yml                  # PostgreSQL container
├── tailwind.config.ts                  # Tailwind configuration
├── tsconfig.json                       # TypeScript config
└── package.json                        # Dependencies
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Azure CLI (`az`) installed and authenticated (`az login`)
- Terraform CLI (`terraform`) installed at `/usr/bin/terraform`

### Installation

1. **Start PostgreSQL database**:
```bash
docker-compose up -d
```

2. **Install dependencies**:
```bash
npm install
```

3. **Setup environment variables**:
```bash
# .env file is created automatically
# Contains: DATABASE_URL="postgresql://dbadmin:dbpass@localhost:5432/terradmin?schema=public"
```

4. **Run database migrations**:
```bash
npx prisma migrate dev
# or
npx prisma db push
```

5. **Generate Prisma client**:
```bash
npx prisma generate
```

6. **Start development server**:
```bash
npm run dev
```

7. **Open browser**: http://localhost:3000

### First-Time Setup

#### Azure Connection
1. Navigate to **Settings** → **Cloud Providers**
2. Click **Configure** on Microsoft Azure
3. Select your Azure subscription from dropdown
4. Click **Save Configuration**
5. Go to **Azure VMs** page
6. Click **Refresh** button to sync VMs

#### Terraform Templates
1. Navigate to **Settings** → **Terraform**
2. Select "Resource Group Template" or "VM Template"
3. Edit templates in the Monaco editor
4. Click **Save Template** to persist to database
5. Templates are used for all plan operations

## 🔄 How Azure Sync Works

The sync process (`POST /api/azure/sync`) performs the following:

```
1. Retrieve Azure config from database (subscription ID)
2. Authenticate using AzureCliCredential
3. Get access token for Azure Management API
4. Fetch resource groups (REST API call)
   └─> Upsert to ResourceGroup table
5. Fetch all VMs (REST API call)
6. For each VM:
   ├─> Get instance view (power state)
   ├─> Fetch network interfaces
   ├─> Extract public/private IPs
   ├─> Parse resource group from resource ID
   └─> Upsert to VirtualMachine table
7. Return statistics
```

**Performance Notes**:
- With 195 resource groups + many VMs, sync can take 1-3 minutes
- Network calls are the bottleneck (getting IPs for each VM)
- Data is cached in database for fast subsequent loads

## 🎯 Key Features Explained

### Azure VMs Page

**Stats Cards**:
- Total VMs count
- Running VMs (green)
- Stopped/Deallocated VMs (gray)
- Resource Groups count

**VM Table**:
- OS icon (Linux penguin / Windows logo)
- VM name and OS type
- Status badge (color-coded)
- Region/Location
- VM Size
- Public & Private IPs
- Action buttons (placeholders)

**Filters**:
- Search box (filters by name or resource group)
- Region dropdown (dynamically populated from synced VMs)
- Filters work together

**Action Buttons**:
- **Refresh** - Fetches fresh data from Azure and updates database
- **Resource Group** - Opens modal to create Terraform plan for new RG
- **Deploy New VM** - (Placeholder) Future VM deployment

**Refresh Button**:
- Fetches fresh data from Azure
- Updates database
- Reloads display
- Shows spinner while syncing

### Resource Group Deployment Modal

**Dynamic Form Generation**:
1. Click **"+ Resource Group"** button
2. System automatically:
   - Fetches template with `resource=rg, type=null`
   - Parses `variablesContent` using regex-based HCL parser
   - Generates form fields dynamically based on variable definitions
   - **Preserves variable order** from template
   - Detects field types: string, number, bool
   - Shows descriptions as placeholders
   - Marks required fields (no default value)
   - Special handling for location/region (dropdown)

**Plan Creation Workflow**:
3. Fill in dynamically generated form (fields match template variables in order)
4. Click **"Plan"** button
5. System performs:
   - Creates `terraform/{id}/` folder
   - Generates `main.tf` from stored template (templateContent)
   - Generates `variables.tf` from stored variables (variablesContent)
   - Creates `terraform.tfvars` with ALL form inputs dynamically
   - Executes `terraform init -no-color`
   - Executes `terraform plan -no-color -out=apply.tfplan`
   - Generates `plan.txt` for human reading
6. Modal switches to results view with two tabs:
   - **Logs** - Shows full terraform init + plan output (auto-scrolls to bottom)
   - **Plan File** - Shows formatted plan from plan.txt

**Apply Workflow**:
7. Click **"Apply"** button (becomes available after successful plan)
8. System performs:
   - Executes `terraform apply -no-color apply.tfplan`
   - Appends apply output to logs (auto-scrolls to bottom)
   - Updates database with complete logs
   - Updates status to "applied"
9. Button changes: **Apply** → **Applying...** → **Applied** (disabled)
10. Toast notification shows success/failure
11. **Close** to exit modal (or leave open to review logs)

### Settings Page

**Cloud Providers Tab**:
- Shows Azure connection status
- Displays connected subscription name
- Modal to select/change subscription

**Notification Settings Tab**:
- Toggle switches for preferences
- Email, deployment, error, weekly, cost alerts

**Terraform Tab**:
- Toggle between "Resource Group Template" and "VM Template"
- **VM Type Dropdown** - Select Linux or Windows when editing VM templates
- **Custom styled dropdown** matching the app theme
- **Dual Monaco editors** for each template type:
  - **Template Editor** - For resource definitions (provider, resources)
  - **Variables Editor** - For variable declarations
- Syntax highlighting for HCL (Terraform language)
- Save button persists both fields to database per resource/type
- Templates and variables stored separately in database (multi-row structure)
- Variables editor content is parsed for dynamic form generation
- Toast notifications for save confirmation
- Each template (RG, VM Linux, VM Windows) stored as separate row

**Bicep Tab**:
- Similar to Terraform tab
- Toggle between "Resource Group Template" and "VM Template"
- Monaco editor for Bicep templates
- Save functionality (currently placeholder data)

**User Management Tab**:
- Current user profile
- Users table (placeholder data)
- Add user functionality (UI only)

## 📝 Next Steps / TODO

### High Priority
1. ✅ ~~**Terraform Apply** - Implement "Run" button to execute `terraform apply`~~ (COMPLETED)
2. ✅ ~~**Plan History** - View list of all terraform plans with status~~ (COMPLETED - Activity page)
3. **VM Actions** - Implement start/stop/restart/delete for Azure VMs
4. **VM Deployment** - Terraform plan for VM creation (similar to RG)
5. **VM Details Modal** - Click VM to see full details

### Medium Priority
6. **Plan Management** - Delete/archive old plans
7. **Apply Status Tracking** - Track terraform apply execution
8. **Dashboard Stats** - Populate homepage with real data
9. **Auto-refresh** - Periodic sync in background
10. **Error Handling** - Better error messages and retry logic

### Low Priority
11. **Bicep Integration** - Similar to Terraform (templates ready, execution pending)
12. **Cost Tracking** - Display Azure costs per VM
13. **AWS Integration** - Similar to Azure implementation
14. **vCenter Integration** - On-premise VM management
15. **Authentication** - Real user auth system
16. **User Management** - Real user CRUD operations
17. **Audit Logs** - Track all actions in DeploymentLog

## 🐛 Known Issues

1. **Sync Performance** - Large subscriptions (100+ VMs) take several minutes to sync
2. **No Error Recovery** - Sync failures don't have retry mechanism
3. **Single Subscription** - Only one Azure subscription supported
4. **No Pagination** - VM list loads all VMs at once
5. **Hardcoded User** - User profile is static
6. **Terraform Path** - Hardcoded to `/usr/bin/terraform` (may need adjustment per system)
7. **No Plan History UI** - Can't view previous plans in UI (only stored in DB)
8. **No Rollback** - No terraform destroy or rollback functionality yet

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Create new migration
npx prisma db push             # Push schema without migration
npx prisma generate            # Regenerate Prisma client

# Docker
docker-compose up -d           # Start PostgreSQL
docker-compose down            # Stop PostgreSQL
docker-compose logs postgres   # View database logs
```

## 📊 Database Access

**Prisma Studio** (GUI):
```bash
npx prisma studio
# Opens at http://localhost:5555
```

**PostgreSQL Direct Access**:
```bash
docker exec -it postgres_db psql -U dbadmin -d terradmin
```

## 🏗️ Architecture Decisions

### Why REST API instead of Azure SDK clients?
- More control over API calls
- Easier to debug
- Consistent across different Azure services
- Works reliably with token-based auth

### Why singleton Azure config?
- Requirement: only one Azure subscription needed
- Simplifies UI and logic
- Easy to extend to multi-subscription if needed

### Why store VMs in database?
- Fast page loads (no Azure API calls needed)
- Enables search, filter, pagination
- Historical data tracking
- Works offline/when Azure is slow

### Why AzureCliCredential?
- Perfect for development (uses `az login`)
- No secrets in code
- Easy transition to production (DefaultAzureCredential)

### Why Terraform CLI execution instead of SDK?
- Direct control over terraform workflow
- Easier to capture and display output
- Standard terraform commands (familiar to DevOps)
- Plan files generated exactly as terraform expects
- Simplifies debugging

### Why Monaco Editor?
- Professional code editing experience
- Syntax highlighting for HCL/Bicep
- IntelliSense and error detection
- Same editor as VS Code
- Familiar to developers

### Why sequential numeric plan IDs?
- Easy to reference and communicate (Plan 1000, 1001, etc.)
- Clean folder structure (`terraform/1000/`)
- Better than random UUIDs for human readability
- Sortable and predictable

### Why split templates and variables?
- Better organization and clarity
- Variables can be parsed independently for form generation
- Resources stay clean without variable declarations mixed in
- Easier to maintain and version control
- Standard Terraform practice (variables.tf + main.tf)
- Separate files written during plan execution

### Why multi-row template storage?
- Supports multiple VM types (Linux, Windows) with different templates
- Cleaner than singleton with many columns
- Easier to add new resource types
- Unique constraint ensures one template per resource/type
- More scalable for future expansion (e.g., different regions, providers)

### Why dynamic form generation?
- Single source of truth (variables.tf defines the form)
- No need to update UI code when changing variables
- Type-safe form fields (string, number, bool)
- Automatic placeholder text from descriptions
- Scales to any number of variables
- Required field detection (no default = required)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Azure SDK for JavaScript](https://learn.microsoft.com/en-us/javascript/api/overview/azure/)
- [Azure REST API Reference](https://learn.microsoft.com/en-us/rest/api/azure/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 License

ISC

## 🔥 Recent Updates

### Latest Features (November 1, 2025)

#### Recent Updates
- ✅ **Activity Page** - View all Terraform plans with status, resource name, and location
- ✅ **Plan History Viewer** - Modal dialogs to view variables and logs for any plan
- ✅ **Multi-row Template Storage** - Support for multiple VM types (Linux/Windows)
- ✅ **VM Type Selector** - Dropdown to choose Linux or Windows VM templates
- ✅ **Custom Styled Dropdown** - Fully themed dropdown component matching app design
- ✅ **Variable Order Preservation** - Form fields appear in same order as template
- ✅ **Separate Terraform Files** - Generates main.tf and variables.tf during plan execution
- ✅ **Improved Template API** - Handles nullable type field with findFirst pattern

#### Core Features
- ✅ **Terraform Apply** - Full apply execution with real-time feedback
- ✅ **Dynamic Form Generation** - Forms auto-generated from HCL variable definitions
- ✅ **Dual Template Editors** - Separate editors for resources and variables
- ✅ **Regex-based HCL Parsing** - Preserves variable order for consistent forms
- ✅ **Auto-scroll Logs** - Logs panel automatically scrolls to latest output
- ✅ **Dynamic tfvars** - All form variables written automatically to terraform.tfvars
- ✅ **Complete Logging** - Init, plan, and apply output stored in database
- ✅ **Apply Status Tracking** - Button states: Apply → Applying → Applied
- ✅ **Terraform Integration** - Full template management and plan/apply execution
- ✅ **Monaco Editor** - Professional code editor for IaC templates
- ✅ **Resource Group Deployment** - Create and apply terraform plans with visual feedback
- ✅ **Toast Notifications** - Replaced browser alerts with custom toast component
- ✅ **Plan Visualization** - Two-tab view for logs and plan output
- ✅ **Sequential Plan IDs** - Clean numbering system starting at 1000
- ✅ **No-Color Output** - Clean terminal logs without ANSI codes
- ✅ **Underline Tab Styling** - Consistent tab indicators across all interfaces

---

**Last Updated**: November 1, 2025  
**Primary Focus**: Azure VM Management + Terraform Integration  
**Status**: Development - Core Azure features functional, Terraform plan/apply fully operational with dynamic form generation
