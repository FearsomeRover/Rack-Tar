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
- **UI**: Tailwind CSS v4 + shadcn/ui components
- **QR**: html5-qrcode (scanning), qrcode (generation)

## Architecture

### Database Models (prisma/schema.prisma)

- **Location** - Named locations (e.g., "Warehouse A")
- **Rack** - Storage racks with optional location reference
- **Item** - Items stored in racks, supports soft-delete via `removed` flag
- **User/AuditLog** - Prepared for auth (not yet implemented)

### Key Directories

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── racks/             # Rack list and creation
│   ├── rack/[id]/         # Single rack view, QR code page
│   ├── items/             # All items search page
│   └── scan/              # QR scanner page
├── components/
│   ├── ui/                # shadcn/ui primitives
│   └── *.tsx              # Feature components
└── lib/
    ├── actions/           # Server actions for CRUD
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
