# Replit.md

## Overview

This is a full-stack web application built with React, Express, and PostgreSQL specifically for managing Christian song lyrics. The application follows a modern monorepo structure with shared TypeScript schemas and uses shadcn/ui for the frontend components. It integrates with Replit's authentication system and uses Drizzle ORM for database operations. The platform focuses exclusively on Christian music including hymns, contemporary worship songs, gospel music, and praise songs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
- **`client/`** - React frontend application with Vite build system
- **`server/`** - Express.js backend API server
- **`shared/`** - Common TypeScript schemas and types used by both frontend and backend
- **Root configuration files** - Shared tooling configuration (TypeScript, Tailwind, Drizzle, etc.)

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with development server and production bundling
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit's OpenID Connect integration with Passport.js
- **Session Management**: Express sessions stored in PostgreSQL
- **Database Driver**: Neon serverless PostgreSQL driver

## Key Components

### Database Schema (shared/schema.ts)
- **Users**: Store user profiles from Replit auth (id, email, names, profile image)
- **Songs**: Main content entities (title, artist, language, tags, view count)
- **Song Lyrics**: Verse-by-verse lyrics with language and translations
- **Favorites**: User's favorite songs
- **Edit Suggestions**: Community-driven content improvement system
- **Sessions**: Authentication session storage

### Authentication System
- Uses Replit's OIDC for user authentication
- Passport.js strategy implementation
- PostgreSQL session storage with connect-pg-simple
- User profile synchronization with Replit data

### Storage Layer (server/storage.ts)
- Abstracted database operations interface
- CRUD operations for all entities
- Search functionality for songs
- Favorite management
- View counting and popularity metrics

### API Routes (server/routes.ts)
- RESTful endpoints for songs, lyrics, favorites
- Authentication-protected routes
- Search and filtering capabilities
- Popular songs aggregation
- Edit suggestion workflow

## Data Flow

1. **Authentication Flow**:
   - User authenticates via Replit OIDC
   - Session created and stored in PostgreSQL
   - User profile synced/created in local database

2. **Content Management**:
   - Songs created with metadata (title, artist, language, tags)
   - Lyrics added verse by verse with language support
   - View counts tracked for popularity metrics

3. **User Interactions**:
   - Favorites added/removed per user
   - Edit suggestions submitted for community review
   - Search across songs by title, artist, or lyrics content

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Drizzle Kit**: Database schema management and migrations
- **Connection Pooling**: Neon's connection pooling for serverless

### Authentication
- **Replit OIDC**: Primary authentication provider
- **OpenID Client**: OIDC client implementation
- **Passport.js**: Authentication middleware

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **TanStack Query**: Server state management
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- Express server with tsx for TypeScript execution
- Database migrations via Drizzle Kit
- Replit-specific development banner integration

### Production Build
- Vite builds frontend to `dist/public`
- esbuild bundles server code to `dist/`
- Single Node.js process serves both static files and API
- Environment variables for database and auth configuration

### Database Management
- Schema defined in TypeScript with Drizzle
- Migrations generated and applied via `drizzle-kit push`
- PostgreSQL dialect with connection string configuration

## Recent Changes

### January 31, 2025
- Removed top search bar from navigation for cleaner UI
- Simplified authentication to single "Sign In" button in top right
- Reduced to exactly 5 Christian songs with sample lyrics in database
- Added night mode with theme toggle (moon/sun icon in navigation)
- Updated all components (Landing, SongCard, Navigation, Footer) with dark mode support
- Configured Vercel deployment with serverless functions and static build
- Created proper build scripts and deployment configuration files

## Deployment Strategy

The application is designed to run seamlessly in Replit's environment while maintaining full Vercel deployment capability:

### Vercel Deployment
- Static build for React frontend via `vite build`
- Serverless functions for API endpoints in `/api` directory
- PostgreSQL database connection with environment variables
- Proper CORS configuration for production
- Build script handles client bundling and API preparation

### Files for Deployment
- `vercel.json` - Vercel configuration
- `api/index.js` - Serverless function entry point
- `build.sh` - Build script for deployment
- `README.md` - Deployment instructions and environment variables

The application maintains flexibility to deploy on Replit or Vercel with minimal configuration changes.