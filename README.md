# TerraAdmin

A multi-cloud VM management dashboard for Azure, AWS, and vCenter built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Multi-Cloud Support**: Manage VMs across Azure, AWS, and vCenter from a single dashboard
- **Modern UI**: Dark navy theme with light green accents
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Database Integration**: PostgreSQL with Prisma ORM
- **Type-Safe**: Full TypeScript support

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Docker (for PostgreSQL)

### Installation

1. Start the database:
```bash
docker-compose up -d
```

2. Install dependencies:
```bash
npm install
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run database migrations (when ready):
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
terradmin/
├── app/                    # Next.js app router pages
│   ├── azure/             # Azure VMs management
│   ├── aws/               # AWS VMs management
│   ├── vcenter/           # vCenter VMs management
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout with sidebar
│   ├── page.tsx           # Dashboard home
│   └── globals.css        # Global styles with Tailwind
├── components/            # React components
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── Header.tsx         # Top header bar
│   └── DashboardCard.tsx  # Reusable stat cards
├── lib/                   # Utility functions
│   └── prisma.ts          # Prisma client singleton
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Prisma schema
└── docker-compose.yml     # PostgreSQL database
```

## Database Schema

The initial schema includes:

- **VirtualMachine**: Stores VM information across all providers
- **DeploymentLog**: Tracks deployment and management actions

## Color Theme

- **Primary Background**: Navy-900 (#0f172a)
- **Secondary Background**: Navy-800 (#1e293b)
- **Accent**: Green-400/500 (#4ade80, #22c55e)
- **Text**: Slate-100 (#f1f5f9)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)

## Next Steps

1. Configure cloud provider connections in Settings
2. Implement Azure VM deployment functionality
3. Add AWS and vCenter integrations
4. Set up authentication system
5. Implement real-time VM monitoring

## License

ISC

