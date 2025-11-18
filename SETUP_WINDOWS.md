# Money Mate - Quick Setup Guide for Windows/WSL

## Setup Steps

Since you're on Windows/WSL, follow these manual steps:

### 1. Fix Line Endings (if needed)
```bash
# Convert Windows line endings to Unix
sed -i 's/\r$//' setup.sh
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Edit with your preferred editor
nano .env.local
# or
code .env.local
```

Update `.env.local` with:
```env
# Database - Use one of these options:
# Option 1: Neon.tech (Free Cloud Database - RECOMMENDED)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/moneymate?sslmode=require"

# Option 2: Local PostgreSQL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/moneymate"

# NextAuth - Generate secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="paste-generated-secret-here"

# Google OAuth - Get from console.cloud.google.com
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"

# Optional - For receipt scanning
OPENAI_API_KEY="sk-..."
```

### 4. Set Up Database (Choose One)

#### Option A: Neon.tech (Easiest - Free Cloud Database)

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string
4. Paste it as DATABASE_URL in .env.local
5. Skip to step 5!

#### Option B: Local PostgreSQL on WSL

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo service postgresql start

# Create database
sudo -u postgres psql -c "CREATE DATABASE moneymate;"
sudo -u postgres psql -c "CREATE USER moneymate WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE moneymate TO moneymate;"

# Update DATABASE_URL in .env.local:
# DATABASE_URL="postgresql://moneymate:your_password@localhost:5432/moneymate"
```

### 5. Generate NextAuth Secret
```bash
openssl rand -base64 32
```
Copy the output and paste it as `NEXTAUTH_SECRET` in `.env.local`

### 6. Set Up Google OAuth

1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Choose "Web application"
6. Add Authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Copy Client ID and Client Secret to `.env.local`

### 7. Generate Prisma Client
```bash
npm run db:generate
```

If you get a 403 error, run:
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run db:generate
```

### 8. Push Database Schema
```bash
npm run db:push
```

This creates all the tables in your database.

### 9. Verify Setup
```bash
# Check if Prisma Client was generated
ls node_modules/.prisma/client

# Open Prisma Studio to view database
npm run db:studio
```

### 10. Start Development Server
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## Troubleshooting

### PostgreSQL Won't Start on WSL
```bash
# Check status
sudo service postgresql status

# Start it
sudo service postgresql start

# If it fails, check logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Port 3000 Already in Use
```bash
# Find what's using the port
lsof -ti:3000

# Kill it
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Prisma Generate Fails with 403
```bash
# Set environment variable
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Try again
npm run db:generate
```

### Database Connection Fails
```bash
# Test PostgreSQL connection
psql -U moneymate -d moneymate -h localhost

# If using Neon, test with:
psql "your-neon-connection-string"
```

---

## Quick Checklist

- [ ] Node.js installed (check: `node -v`)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created and filled out
- [ ] Database set up (Neon.tech or local PostgreSQL)
- [ ] NextAuth secret generated
- [ ] Google OAuth credentials created
- [ ] Prisma Client generated (`npm run db:generate`)
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Dev server running (`npm run dev`)

---

## Need Help?

If you get stuck:
1. Check the error message carefully
2. See SETUP.md for more detailed instructions
3. See QUICKSTART.md for alternative approaches
4. Create an issue on GitHub

Good luck! 🚀
