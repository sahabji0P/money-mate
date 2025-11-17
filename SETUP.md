# Money Mate Setup Guide

Complete step-by-step guide to set up the Owwn clone (Money Mate) application.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or remote)
- Google Cloud Console account (for OAuth)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://user:password@localhost:5432/moneymate?schema=public"

# NextAuth - Generate a secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# Google OAuth - Get from Google Cloud Console
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI (Optional)
OPENAI_API_KEY="your-openai-api-key"
```

### 3. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

1. Install PostgreSQL if you haven't:
   - macOS: `brew install postgresql@15`
   - Ubuntu: `sudo apt install postgresql postgresql-contrib`
   - Windows: Download from postgresql.org

2. Start PostgreSQL service:
   - macOS: `brew services start postgresql@15`
   - Ubuntu: `sudo systemctl start postgresql`
   - Windows: Use pgAdmin or service manager

3. Create database:
   ```bash
   # Access PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE moneymate;

   # Create user (optional)
   CREATE USER moneymate_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE moneymate TO moneymate_user;

   # Exit
   \q
   ```

#### Option B: Free Cloud PostgreSQL

Use one of these free services:
- **Neon** (neon.tech) - Recommended
- **Supabase** (supabase.com)
- **Railway** (railway.app)
- **ElephantSQL** (elephantsql.com)

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select existing one

3. Enable Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Copy Client ID and Client Secret to `.env.local`

### 5. Initialize Prisma Database

Run these commands in order:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

**Note:** If you get errors, make sure your DATABASE_URL is correct and PostgreSQL is running.

### 6. Verify Database Setup

Check that tables were created:

```bash
# Open Prisma Studio (database GUI)
npm run db:studio
```

This opens `http://localhost:5555` where you can view your database tables.

### 7. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the landing page!

## Common Issues & Solutions

### Issue: Prisma Client not generated

**Error:**
```
Error: Cannot find module '@prisma/client'
```

**Solution:**
```bash
npm run db:generate
```

### Issue: Database connection failed

**Error:**
```
Can't reach database server at localhost:5432
```

**Solutions:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env.local`
3. Test connection: `psql "postgresql://user:password@localhost:5432/moneymate"`

### Issue: Migration errors

**Error:**
```
Error: P3009 migrate found failed migrations
```

**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or push schema without migrations
npm run db:push
```

### Issue: Google OAuth not working

**Error:**
```
OAuth error: redirect_uri_mismatch
```

**Solutions:**
1. Add exact redirect URI in Google Console:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
2. Clear browser cookies
3. Restart dev server

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma Client
npm run db:push         # Push schema to database
npm run db:migrate      # Create migration
npm run db:studio       # Open database GUI

# Other
npm run lint            # Run ESLint
```

## Database Schema Overview

The application uses these main tables:

- **User** - User accounts (from Google OAuth)
- **Account** - OAuth account linkage
- **Session** - User sessions
- **Group** - Expense groups
- **GroupMember** - Group membership
- **Expense** - Expense records
- **ExpensePayment** - Who paid for an expense
- **ExpenseSplit** - How expense is split
- **Settlement** - Settlement records

## Next Steps

1. Sign in with Google OAuth
2. Create your first group
3. Add members to the group
4. Create expenses and settlements
5. Explore the features!

## Development Workflow

1. Make code changes
2. App auto-reloads (Next.js Hot Reload)
3. If schema changes:
   ```bash
   npm run db:push
   npm run db:generate
   ```
4. Restart dev server

## Troubleshooting

Still having issues? Check:

1. Node version: `node --version` (should be 18+)
2. Database connection: Can you connect with psql?
3. Environment variables: Are they all set in `.env.local`?
4. Prisma Client: Run `npm run db:generate`
5. Dependencies: Try `rm -rf node_modules && npm install`

## Support

- GitHub Issues: [Create an issue](https://github.com/sahabji0P/money-mate/issues)
- Documentation: See README.md and OWWN_CLONE_STATUS.md

---

**Ready to build!** 🚀
