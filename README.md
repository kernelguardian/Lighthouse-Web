# Lighthouse - Christian Songs Database

A comprehensive multilingual Christian songs database built with React.js, Express.js, and PostgreSQL.

## Features

- 🎵 Christian songs database with 5 sample songs
- 🌙 Dark/Light mode toggle
- 🔍 Search functionality on landing page
- 📱 Responsive design with Tailwind CSS
- 🎨 Clean, modern UI with no top navigation search bar
- 🔐 Simple sign-in button
- 🗄️ PostgreSQL database with Drizzle ORM
- ☁️ Vercel deployment ready

## Local Development

```bash
npm install
npm run dev
```

## Database Setup

```bash
npm run db:push
```

## Vercel Deployment

This project is configured for Vercel deployment with:

- Static build for the React frontend
- Serverless functions for the API
- PostgreSQL database connection
- Environment variables for production

### Environment Variables Required:

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit OAuth client ID
- `ISSUER_URL` - OAuth issuer URL
- `REPLIT_DOMAINS` - Allowed domains

### Deploy to Vercel:

1. Connect your GitHub repository to Vercel
2. Set the environment variables in Vercel dashboard
3. Deploy - the build process will automatically handle the frontend and API

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Wouter (routing)
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Vercel
- **UI Components**: shadcn/ui, Radix UI primitives