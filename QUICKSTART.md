# Quick Start Guide - Money Mate (Owwn Clone)

## 🚀 Get Started in 5 Minutes

### For Local Development (Recommended)

Since the cloud environment has network restrictions, please run this project locally on your machine:

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd money-mate
```

### Step 2: Run the Setup Script

```bash
./setup.sh
```

Or manually:

```bash
# Install dependencies
npm install

# Generate Prisma Client
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run db:generate
```

### Step 3: Set Up Database

You have two options:

#### Option A: Use Free Cloud Database (Easiest)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string
4. Update `.env.local`:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
   ```

#### Option B: Use Local PostgreSQL

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb moneymate

# Ubuntu/Debian
sudo apt install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb moneymate

# Update .env.local with:
DATABASE_URL="postgresql://localhost:5432/moneymate"
```

### Step 4: Push Database Schema

```bash
npm run db:push
```

### Step 5: Set Up Google OAuth

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`

### Step 6: Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Add to `.env.local`:
```env
NEXTAUTH_SECRET="<generated-secret>"
```

### Step 7: Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

## ✅ Verification Checklist

Before starting, make sure:

- [ ] Node.js 18+ installed (`node -v`)
- [ ] PostgreSQL running (local or cloud)
- [ ] `.env.local` configured with all values
- [ ] Prisma Client generated (`npm run db:generate`)
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Google OAuth credentials set up

## 🎯 What You'll Get

After setup, you'll have a fully functional expense tracking app with:

- **Landing Page** - Beautiful hero with features
- **Dashboard** - View and manage groups
- **Group Details** - Expenses, balances, settlements
- **Add Expenses** - 3 split types (Equal, Custom, Percentage)
- **Settlements** - Record payments between members
- **Member Management** - Add/remove group members

## 🔧 Troubleshooting

### Prisma Engine Download Fails (403 Forbidden)

This happens in restricted environments. Solutions:

1. **Set environment variable:**
   ```bash
   export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
   npm run db:generate
   ```

2. **Use local Prisma:**
   ```bash
   npx prisma generate
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

### Database Connection Fails

```bash
# Test connection
psql "postgresql://user:password@localhost:5432/moneymate"

# Or check if PostgreSQL is running
pg_isready

# View logs
tail -f /usr/local/var/log/postgres.log  # macOS
sudo journalctl -u postgresql            # Linux
```

### Google OAuth Error

Make sure redirect URI is **exactly**:
```
http://localhost:3000/api/auth/callback/google
```

No trailing slashes, match the protocol (http vs https).

### Port 3000 Already in Use

```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## 📚 Additional Resources

- **Full Setup Guide:** See `SETUP.md`
- **Architecture:** See `README.md`
- **Implementation Status:** See `OWWN_CLONE_STATUS.md`
- **Prisma Studio:** Run `npm run db:studio` to view database

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Module not found | `npm install` |
| Prisma Client error | `npm run db:generate` |
| Database error | Check `DATABASE_URL` in `.env.local` |
| OAuth error | Verify Google Console settings |
| Port conflict | Kill process or use different port |

## 🎉 You're Ready!

Once everything is set up:

1. **Sign in** with your Google account
2. **Create a group** (e.g., "Trip to Bali")
3. **Add members** by email
4. **Create expenses** and split them
5. **Settle up** when ready

---

**Need help?** Check the detailed `SETUP.md` or create an issue on GitHub.
