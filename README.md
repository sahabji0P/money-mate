# Money Mate - Own what you owe 💰

A modern, AI-powered expense tracking and bill splitting application inspired by [Owwn](https://github.com/notnotrachit/Owwn). Features group expense management, smart settlement suggestions, intelligent receipt scanning, and multiple split types for easy bill sharing among friends and groups.

## 🌟 Features

### Core Features (Implemented)
- **🔐 Google OAuth Authentication** - Secure sign-in with NextAuth.js v5
- **👥 Group Management** - Create and manage expense-sharing groups with members
- **💰 Smart Expense Tracking** - Three split types:
  - **Equal Split** - Divide evenly with proper rounding
  - **Custom Split** - Specify exact amounts for each person
  - **Percentage Split** - Allocate by percentages
- **💳 Multiple Payer Support** - Split who paid for an expense
- **📊 Real-time Balance Calculations** - Automatic credit/debit tracking
- **🎯 Settlement Suggestions** - Greedy algorithm minimizes transactions
- **📸 Receipt Scanning** - AI-powered receipt analysis (Google Gemini)
- **📁 Data Export** - Export group data to JSON/CSV
- **🌙 Dark Mode** - Beautiful Owwn-inspired dark theme
- **🏷️ Expense Categories** - Food, Transport, Entertainment, Utilities, Shopping, Other

### Technical Features
- **Type-Safe Backend** - Prisma ORM with PostgreSQL
- **RESTful API** - Comprehensive endpoints for all operations
- **Optimistic Updates** - TanStack Query for smooth UX
- **Mobile-Responsive** - Drawer-based mobile-first design
- **Role-Based Access** - Admin and member permissions
- **Calculation Algorithms**:
  - Balance calculation (O(n) complexity)
  - Settlement optimization (greedy matching)
  - Split validation and rounding

## 🏗️ Architecture

### Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | SSR, API routes, modern React |
| **Language** | TypeScript | Type safety |
| **Database** | PostgreSQL + Prisma | Type-safe ORM, migrations |
| **Authentication** | NextAuth.js v5 | Google OAuth, session management |
| **UI Library** | Radix UI | Accessible component primitives |
| **Styling** | Tailwind CSS | Utility-first styling |
| **State Management** | TanStack Query | Server state, caching |
| **Animations** | Framer Motion | Page transitions, UI animations |
| **Mobile UI** | Vaul | Bottom drawer component |
| **AI** | Google Gemini | Receipt OCR, expense parsing |

### Database Schema

```
Users (NextAuth)
├── Accounts (OAuth)
├── Sessions
└── VerificationTokens

Groups
├── createdBy → User
├── members → GroupMember[]
├── expenses → Expense[]
└── settlements → Settlement[]

GroupMember
├── user → User
├── group → Group
└── role (admin | member)

Expense
├── group → Group
├── payments → ExpensePayment[]
├── splits → ExpenseSplit[]
└── metadata (description, amount, category, date, notes, receiptImage)

ExpensePayment
├── expense → Expense
├── user → User
└── amount (in cents)

ExpenseSplit
├── expense → Expense
├── user → User
├── amount (in cents)
└── isPaid (boolean)

Settlement
├── group → Group
├── fromUser → User
├── toUser → User
├── amount (in cents)
└── date, notes
```

### API Routes

#### Authentication
- `POST /api/auth/signin` - Google OAuth sign-in
- `POST /api/auth/signout` - Sign out

#### Groups
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create group
- `GET /api/groups/[id]` - Get group details
- `PUT /api/groups/[id]` - Update group (admin)
- `DELETE /api/groups/[id]` - Delete group (admin)
- `POST /api/groups/[id]/members` - Add member (admin)
- `DELETE /api/groups/[id]/members/[userId]` - Remove member (admin or self)

#### Expenses
- `GET /api/groups/[id]/expenses` - List group expenses
- `POST /api/groups/[id]/expenses` - Create expense
- `GET /api/groups/[id]/expenses/[expenseId]` - Get expense details
- `DELETE /api/groups/[id]/expenses/[expenseId]` - Delete expense (admin or creator)

#### Balances & Settlements
- `GET /api/groups/[id]/balances` - Get balances and settlement suggestions
- `GET /api/groups/[id]/balances?userId=[userId]` - Get pairwise balances
- `GET /api/groups/[id]/settlements` - List settlements
- `POST /api/groups/[id]/settlements` - Create settlement

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials ([Get here](https://console.cloud.google.com/))
- Google Gemini API key (for receipt scanning)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sahabji0P/money-mate.git
cd money-mate
git checkout claude/clone-nextjs-branch-01MYkuYvFfHBAgrgSjxmQdZu
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL database**

Create a database:
```bash
createdb moneymate
```

Or use a hosted solution like Vercel Postgres, Supabase, or Railway.

4. **Configure environment variables**

Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/moneymate?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth (from console.cloud.google.com)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Google Gemini (for receipt scanning)
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"
```

5. **Generate Prisma client and run migrations**
```bash
npx prisma generate
npx prisma db push
```

6. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set application type to **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to `.env.local`

## 📖 Key Algorithms

### Balance Calculation

Calculates net balance for each user in a group:

```typescript
Balance = (Total Paid) - (Total Owed) + (Settlements Received) - (Settlements Paid)
```

**Complexity:** O(E × P + E × S + T) where:
- E = number of expenses
- P = average payers per expense
- S = average splits per expense
- T = number of settlements

### Settlement Suggestion (Greedy Matching)

Minimizes the number of transactions needed to settle all debts:

```
1. Separate users into debtors (negative balance) and creditors (positive balance)
2. Sort both by absolute balance (descending)
3. Match largest debtor with largest creditor
4. Create settlement for min(debtor_debt, creditor_credit)
5. Adjust balances and move to next if settled
6. Repeat until all balanced
```

**Example:**
```
Balances:
- Alice: +$50 (owed)
- Bob: +$30 (owed)
- Charlie: -$40 (owes)
- David: -$40 (owes)

Settlements:
1. Charlie → Alice $40 (Charlie settled, Alice has $10 left)
2. David → Alice $10 (Alice settled)
3. David → Bob $30 (Bob and David settled)

Result: 3 transactions instead of 6 direct payments
```

**Complexity:** O(n log n) for sorting + O(n) for matching = O(n log n)

### Split Functions

**Equal Split:**
```typescript
base = floor(total / n)
remainder = total - (base × n)
splits[0] = base + remainder  // First person gets remainder
splits[1..n] = base
```

**Percentage Split:**
```typescript
splits[i] = floor((total × percentage[i]) / 100)
// Adjust first person for rounding errors
splits[0] += total - sum(splits)
```

**Custom Split:**
```typescript
// Validate sum equals total
if (sum(customAmounts) !== total) throw Error
splits = customAmounts
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open Prisma Studio (database GUI)
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema changes to database
npx prisma migrate dev   # Create and apply migration

# Linting
npm run lint             # Run ESLint
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Your application URL | Yes |
| `NEXTAUTH_SECRET` | Random secret for session encryption | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key for receipt scanning | Yes |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **[Owwn](https://github.com/notnotrachit/Owwn)** - Inspiration for the expense tracking system
- **[shadcn/ui](https://ui.shadcn.com/)** - Component design patterns
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives

## 📧 Contact

Created by [Shashwat Jain](https://github.com/sahabji0P)

- Twitter: [@itsshashwatj](https://twitter.com/itsshashwatj)
- Website: [shashwatjain.me](https://shashwatjain.me)

---

**Built with ❤️ using Next.js, Prisma, and modern web technologies.**
