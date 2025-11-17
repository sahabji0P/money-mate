#!/bin/bash

# Money Mate Setup Script
# This script helps set up the project locally

set -e

echo "🚀 Money Mate Setup Script"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} installed${NC}"
echo ""

# Check npm
echo -e "${YELLOW}Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION} installed${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Check .env.local
echo -e "${YELLOW}Checking environment variables...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ .env.local not found. Creating from example...${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}⚠ Please edit .env.local with your actual values${NC}"
else
    echo -e "${GREEN}✓ .env.local exists${NC}"
fi
echo ""

# Generate Prisma Client
echo -e "${YELLOW}Generating Prisma Client...${NC}"
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
if npm run db:generate; then
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    echo -e "${YELLOW}This might be due to network restrictions.${NC}"
    echo -e "${YELLOW}Try running: PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run db:generate${NC}"
fi
echo ""

# Check PostgreSQL connection
echo -e "${YELLOW}Checking database connection...${NC}"
if npm run db:push; then
    echo -e "${GREEN}✓ Database connected and schema pushed${NC}"
else
    echo -e "${RED}❌ Failed to connect to database${NC}"
    echo -e "${YELLOW}Make sure PostgreSQL is running and DATABASE_URL is correct in .env.local${NC}"
    echo ""
    echo "Quick PostgreSQL setup:"
    echo "  1. Install: brew install postgresql@15 (macOS)"
    echo "  2. Start: brew services start postgresql@15"
    echo "  3. Create DB: createdb moneymate"
fi
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local with your credentials"
echo "  2. Set up Google OAuth (see SETUP.md)"
echo "  3. Run: npm run dev"
echo "  4. Visit: http://localhost:3000"
echo ""
echo "For detailed instructions, see SETUP.md"
