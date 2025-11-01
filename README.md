# TerraAdmin

A multi-cloud VM management dashboard for Azure, AWS, and vCenter built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Current Implementation Status

### ✅ Completed Features

#### Core Infrastructure
- **Next.js 15+ Application** with App Router and TypeScript
- **PostgreSQL Database** via Docker with Prisma ORM
- **Dark Navy Theme** with light green accents using Tailwind CSS
- **Responsive Layout** with collapsible sidebar navigation

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

#### Settings Management
- ✅ **Tabbed Settings Interface** with three sections:
  - **Cloud Providers** - Azure connection management (AWS/vCenter placeholders)
  - **Notification Settings** - Toggle preferences for alerts
  - **User Management** - Profile and user administration UI

#### Pages & Navigation
- `/` - Dashboard home with overview statistics
- `/azure` - Azure VMs management (fully functional)
- `/aws` - AWS VMs placeholder
- `/vcenter` - vCenter VMs placeholder
- `/settings` - Multi-tab settings interface

## 📋 Tech Stack

- **Framework**: Next.js 15.0.3 with App Router
- **Language**: TypeScript 5.6.3
- **Styling**: Tailwind CSS 3.4.14
- **Database**: PostgreSQL (Docker)
- **ORM**: Prisma 6.18.0
- **Icons**: Lucide React 0.462.0
- **Azure SDKs**: 
  - `@azure/identity` - Authentication
  - `@azure/arm-subscriptions` - Subscription management
  - `@azure/arm-compute` - VM operations
  - `@azure/arm-network` - Network interface operations

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
│   │   └── azure/
│   │       ├── subscriptions/route.ts  # Fetch Azure subscriptions
│   │       ├── config/route.ts         # Get/save Azure config
│   │       ├── sync/route.ts           # Sync VMs from Azure
│   │       └── vms/route.ts            # Get VMs from DB
│   ├── azure/page.tsx                  # Azure VMs management (fully functional)
│   ├── aws/page.tsx                    # AWS placeholder
│   ├── vcenter/page.tsx                # vCenter placeholder
│   ├── settings/page.tsx               # Settings with tabs
│   ├── layout.tsx                      # Root layout
│   ├── page.tsx                        # Dashboard home
│   └── globals.css                     # Tailwind styles
├── components/
│   ├── Sidebar.tsx                     # Navigation sidebar
│   ├── Header.tsx                      # Top header
│   ├── DashboardCard.tsx               # Stat cards
│   ├── AzureConfigModal.tsx            # Azure config modal
│   └── settings/
│       ├── CloudProviders.tsx          # Cloud provider settings
│       ├── NotificationSettings.tsx    # Notification prefs
│       └── UserManagement.tsx          # User management UI
├── lib/
│   └── prisma.ts                       # Prisma singleton
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── migrations/                     # Migration history
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

1. Navigate to **Settings** → **Cloud Providers**
2. Click **Configure** on Microsoft Azure
3. Select your Azure subscription from dropdown
4. Click **Save Configuration**
5. Go to **Azure VMs** page
6. Click **Refresh** button to sync VMs

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

**Refresh Button**:
- Fetches fresh data from Azure
- Updates database
- Reloads display
- Shows spinner while syncing

### Settings Page

**Cloud Providers Tab**:
- Shows Azure connection status
- Displays connected subscription name
- Modal to select/change subscription

**Notification Settings Tab**:
- Toggle switches for preferences
- Email, deployment, error, weekly, cost alerts

**User Management Tab**:
- Current user profile
- Users table (placeholder data)
- Add user functionality (UI only)

## 📝 Next Steps / TODO

### High Priority
1. **VM Actions** - Implement start/stop/restart/delete for Azure VMs
2. **VM Details Modal** - Click VM to see full details
3. **Auto-refresh** - Periodic sync in background
4. **Error Handling** - Better error messages and retry logic
5. **Loading States** - More granular loading indicators

### Medium Priority
6. **Azure VM Deployment** - Form to create new Azure VMs
7. **Resource Group Filtering** - Add resource group dropdown filter
8. **Dashboard Stats** - Populate homepage with real data
9. **Cost Tracking** - Display Azure costs per VM
10. **Authentication** - Real user auth system

### Low Priority
11. **AWS Integration** - Similar to Azure implementation
12. **vCenter Integration** - On-premise VM management
13. **Notifications System** - Actual notification backend
14. **User Management** - Real user CRUD operations
15. **Audit Logs** - Track all actions in DeploymentLog

## 🐛 Known Issues

1. **Sync Performance** - Large subscriptions (100+ VMs) take several minutes to sync
2. **No Error Recovery** - Sync failures don't have retry mechanism
3. **Single Subscription** - Only one Azure subscription supported
4. **No Pagination** - VM list loads all VMs at once
5. **Hardcoded User** - User profile is static

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

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Azure SDK for JavaScript](https://learn.microsoft.com/en-us/javascript/api/overview/azure/)
- [Azure REST API Reference](https://learn.microsoft.com/en-us/rest/api/azure/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 License

ISC

---

**Last Updated**: November 1, 2025  
**Primary Focus**: Azure VM Management  
**Status**: Development - Core features functional, ready for VM actions implementation
