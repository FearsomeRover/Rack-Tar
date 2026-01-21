# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Racktar is a storage rack tracking system built with Next.js. Users can manage racks and their items, with QR code support for quick access via mobile devices.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production (includes prisma generate)
npm run lint         # Run ESLint

npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database (no migrations)
npm run db:migrate   # Create and apply migrations
npm run db:studio    # Open Prisma Studio GUI
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js v5 with AuthSCH (BME OAuth)
- **UI**: Tailwind CSS v4 + shadcn/ui components
- **QR**: html5-qrcode (scanning), qrcode (generation)

## Architecture

### Database Models (prisma/schema.prisma)

- **Location** - Named locations (e.g., "Warehouse A")
- **Rack** - Storage racks with optional location reference
- **Item** - Items stored in racks, supports soft-delete via `removed` flag
- **User** - Authenticated users with roles (VIEWER, EDITOR, ADMIN)
- **AuditLog** - Tracks all mutations with user, action, and details

### Key Directories

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── racks/             # Rack list and creation
│   ├── rack/[id]/         # Single rack view, QR code page
│   ├── items/             # All items search page
│   ├── scan/              # QR scanner page
│   ├── login/             # Login page
│   ├── admin/             # Admin panel (users, audit logs)
│   └── api/auth/          # NextAuth API routes
├── components/
│   ├── ui/                # shadcn/ui primitives
│   └── *.tsx              # Feature components
└── lib/
    ├── actions/           # Server actions for CRUD (with permission checks)
    ├── auth.ts            # NextAuth configuration
    ├── permissions.ts     # Role checking utilities
    └── db.ts              # Prisma client singleton
```

### Data Flow

- Server Components fetch data directly via Prisma
- Client Components use Server Actions for mutations
- `revalidatePath()` refreshes data after mutations
- Toast notifications via Sonner

### Item States

Items have a `removed` boolean for soft-delete. When `removed: true`:
- Item is hidden from main lists and counts
- Appears in collapsible "Temporarily removed" section
- Can be restored without re-entering data

### Authentication & Permissions

Uses AuthSCH (BME SSO) via NextAuth.js v5. Key files:
- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/permissions.ts` - Role checking utilities
- `src/app/api/auth/[...nextauth]/route.ts` - Auth API routes

**Roles:**
- **VIEWER** (default): Read-only access, same as unauthenticated users
- **EDITOR**: Can create/edit/delete racks, items, and locations
- **ADMIN**: Full access including user management and audit logs

**Environment variables required:**
```
AUTHSCH_CLIENT_ID=<from AuthSCH developer console>
AUTHSCH_CLIENT_SECRET=<secret>
AUTH_SECRET=<random 32+ char string>
AUTH_TRUST_HOST=true  # Required when behind reverse proxy
```

All mutations are logged to AuditLog with user ID, action, and details.

## Deployment

### Docker (Self-hosted)

The project includes Docker support for self-hosting:

- `Dockerfile` - Multi-stage build for minimal production image
- `docker-compose.yml` - Orchestrates app + PostgreSQL
- `docker-entrypoint.sh` - Runs migrations on container start
- `deploy.sh` - Automated deployment script

**Quick start:**
```bash
cp .env.production.template .env
# Edit .env with your values
./deploy.sh
```

**Useful commands:**
```bash
docker compose logs -f app     # View app logs
docker compose ps              # Check container status
docker compose down            # Stop all containers
docker compose exec db psql -U racktar -d racktar  # Database shell
```

### Vercel

Can be deployed to Vercel with an external PostgreSQL database. Set environment variables in Vercel dashboard.
