# OWWN FRONTEND - COMPLETE & THOROUGH ANALYSIS

> **Generated**: $(date)
> **Purpose**: Build an EXACT clone of the Owwn expense tracking frontend

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Complete Route Analysis](#2-complete-route-analysis)
3. [Complete Component Analysis](#3-complete-component-analysis)
4. [Styling System Deep Dive](#4-styling-system-deep-dive)
5. [UI/UX Patterns](#5-uiux-patterns)
6. [Convex Integration Patterns](#6-convex-integration-patterns)
7. [User Flows - Step by Step](#7-user-flows)
8. [Forms & Validation](#8-forms--validation)
9. [Mobile Optimization](#9-mobile-optimization)
10. [Project Setup & Configuration](#10-project-setup--configuration)

---

## 1. PROJECT OVERVIEW

### Tech Stack
- **React**: 19.1.1 (latest with concurrent features)
- **Routing**: TanStack Router v1.132 (file-based routing)
- **Backend**: Convex v1.28 (serverless, real-time)
- **Authentication**: Convex Auth with Google OAuth
- **Styling**: Tailwind CSS v4.1.13 + custom CSS variables
- **Animation**: Motion (Framer Motion) v12.23
- **UI Primitives**: Radix UI (checkbox, dialog, popover, radio-group)
- **Drawer**: Vaul v1.1.2
- **Icons**: Lucide React v0.553
- **Type Safety**: TypeScript with strict mode

### Project Structure
```
src/
├── routes/                      # File-based routing
│   ├── __root.tsx              # Root layout (meta, fonts, view transitions)
│   ├── index.tsx               # Landing + Dashboard (auth-dependent)
│   ├── settings.tsx            # API key management
│   └── groups/
│       ├── new.tsx             # Create group form
│       ├── $groupId.tsx        # Main group detail (2286 lines!)
│       └── $groupId/
│           └── expenses/
│               └── $expenseId.tsx  # Expense detail view
├── components/
│   ├── GroupBottomNav.tsx      # Mobile bottom navigation
│   └── ui/                     # shadcn/ui components
│       ├── drawer.tsx
│       ├── checkbox.tsx
│       ├── radio-group.tsx
│       ├── dialog.tsx
│       ├── popover.tsx
│       └── command.tsx
├── lib/
│   ├── auth-context.tsx        # Auth hook wrapper
│   ├── utils.ts                # cn() utility
│   └── view-transitions.ts     # View Transitions API
├── styles/
│   └── app.css                 # Global styles + CSS variables
└── router.tsx                  # Router configuration
```

---

## 2. COMPLETE ROUTE ANALYSIS

### 2.1 ROOT ROUTE (`__root.tsx`)

**Purpose**: App-wide layout, meta tags, fonts, suspense boundary

**Key Features**:
- Sets up viewport for mobile (viewport-fit=cover for notch support)
- Loads Audiowide font from Google Fonts
- Implements View Transitions API meta tag dynamically
- Provides app skeleton loading state
- Uses Outlet for nested routes

**Complete Source**: See `root-route-COMPLETE.tsx`

**Important Patterns**:
```tsx
// View transitions setup
React.useEffect(() => {
  if (supportsViewTransitions()) {
    const meta = document.createElement('meta')
    meta.name = 'view-transition'
    meta.content = 'same-origin'
    document.head.appendChild(meta)
    return () => {
      if (document.head.contains(meta)) {
        document.head.removeChild(meta)
      }
    }
  }
}, [])

// Suspense with skeleton
<React.Suspense fallback={<AppSkeleton />}>
  <Outlet />
</React.Suspense>
```

**Skeleton Structure**:
- Header with logo and user info placeholders
- Grid of 6 loading cards
- Pulse animation on all loading elements

---

### 2.2 LANDING & DASHBOARD (`index.tsx`)

**Two States**: Landing page (unauthenticated) vs Dashboard (authenticated)

#### Landing Page Features:
1. **Gradient background** with animated blobs
2. **Hero section** with:
   - App badge ("AI-powered group expense tracking")
   - Large headline with gradient text
   - Description copy
   - Google sign-in button (2 variants: desktop header + mobile CTA)
   - Feature badges (Track every bill, Built for real groups)
3. **Feature cards** (3 columns):
   - Smart expense timelines
   - Balances that make sense
   - AI-powered inputs
4. **Mock app preview card**:
   - Shows fake "Goa 2025" group
   - Balance display with gradient effects
   - Mini member list
   - "Settle up" CTA
5. **Footer** with marketing copy

**Complete Source**: See `index-route-COMPLETE.tsx`

**Key Design Elements**:
```css
/* Gradient backgrounds */
.bg-gradient-to-b from-[#020617] via-[#020817] to-[#020617]

/* Floating blobs */
.absolute -top-40 -left-40 w-80 h-80 bg-[#10B981]/20 blur-3xl rounded-full opacity-60

/* Text gradient */
.text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300
```

#### Dashboard Features:
1. **Header** with:
   - Owwn logo + tagline
   - User name/email
   - Settings link
   - Logout button
2. **Groups grid** with:
   - Empty state (with CTA)
   - Card grid (3 columns on desktop)
   - Framer Motion stagger animation
3. **Floating "Create Group" button** (desktop) or drawer (mobile)
4. **Create Group Drawer** (mobile):
   - Group name input
   - Description textarea
   - Currency selector (10 currencies with symbols)
   - Cancel/Create buttons

**Motion Animation Pattern**:
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.div variants={container} initial="hidden" animate="show">
  {groups.map((group) => (
    <motion.div key={group._id} variants={item} whileHover={{ scale: 1.02, y: -4 }}>
      ...
    </motion.div>
  ))}
</motion.div>
```

---

### 2.3 NEW GROUP (`groups/new.tsx`)

**Purpose**: Full-page form to create a new group

**Form Fields**:
1. **Group Name** (required)
   - Text input
   - Placeholder: "e.g., Roommates, Trip to Paris"
2. **Description** (optional)
   - Textarea (3 rows)
   - Placeholder: "What's this group for?"
3. **Currency** (required)
   - Select dropdown with dollar icon
   - 10 currencies: USD, EUR, GBP, INR, JPY, AUD, CAD, CHF, CNY, SEK
   - Shows symbol, name, and code
   - Helper text shows selected currency name

**Complete Source**: See `new-group-route-COMPLETE.tsx`

**Submit Logic**:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!name) return

  const selectedCurrency = CURRENCIES.find(c => c.code === currency)!
  const groupId = await createGroup({
    name,
    description: description || undefined,
    createdBy: user._id,
    currency: selectedCurrency.code,
    currencySymbol: selectedCurrency.symbol,
  })
  navigate({ to: '/groups/$groupId', params: { groupId } })
}
```

---

### 2.4 GROUP DETAIL (`groups/$groupId.tsx`) - THE BIG ONE!

**Size**: 2286 lines - the most complex route

**Main Component**: `GroupDetail`

**State Management**:
```tsx
const [showAddExpense, setShowAddExpense] = useState(false)
const [showAddMember, setShowAddMember] = useState(false)
const [showSettlement, setShowSettlement] = useState(false)
const [settlementMember, setSettlementMember] = useState<any>(null)
const [showAiAssistant, setShowAiAssistant] = useState(false)
const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'members' | 'balances' | 'activity' | 'settings'>('expenses')
const [aiInstruction, setAiInstruction] = useState('')
const [aiStatus, setAiStatus] = useState<string | null>(null)
const [aiLoading, setAiLoading] = useState(false)
```

**Data Fetching**:
```tsx
const { data: group } = useSuspenseQuery(
  convexQuery(api.groups.getGroupDetails, { groupId: groupId as any })
)
const { data: expenses } = useSuspenseQuery(
  convexQuery(api.expenses.getGroupExpenses, { groupId: groupId as any })
)
const { data: settlements } = useSuspenseQuery(
  convexQuery(api.settlements.getGroupSettlements, { groupId: groupId as any })
)
const { data: balances } = useSuspenseQuery(
  convexQuery(api.expenses.getGroupBalances, { groupId: groupId as any })
)
```

**Tab System** (Desktop):
1. **Overview** - Balance summary + suggested settlements + export
2. **Expenses** - Transaction list (expenses + settlements combined)
3. **Members** - Member list with "Add Member" button

**Mobile Navigation**: Uses `GroupBottomNav` component at bottom

**Complete Source**: See `groupId-route-COMPLETE.tsx`

**Sub-Components** (all defined in same file):
1. **AddExpenseDrawer** - Mobile expense form
2. **AddExpenseModal** - Desktop expense form
3. **AddMemberModal** - Search and add members
4. **SettlementDrawer** - Record payment between members
5. **ExportDataSection** - Export as JSON/CSV
6. **MembersTabContent** - Member list view

---

### 2.5 EXPENSE DETAIL (`groups/$groupId/expenses/$expenseId.tsx`)

**Purpose**: Read-only view of a single expense

**Displays**:
1. **Amount** (large, centered, with currency symbol)
2. **Description** (below amount)
3. **Category badge** (if set)
4. **Date** (formatted as "Monday, January 1, 2025")
5. **Paid By** section:
   - Single payer: Shows name + amount
   - Multiple payers: Shows each payer + their amount
6. **Split Between** section:
   - Each split with name + amount
   - "Paid" badge if applicable
7. **Notes** (if present)

**Complete Source**: See `expense-detail-route-COMPLETE.tsx`

---

### 2.6 SETTINGS (`settings.tsx`)

**Purpose**: API key management for MCP server integration

**Features**:
1. **API Key List**:
   - Shows key name, preview, creation date, last used, expiry
   - Status badges (Active/Revoked)
   - Revoke and Delete actions
2. **Create Key Modal**:
   - Name input
   - Shows created key once (with copy button)
   - Warning: "Save this key now - you won't be able to see it again!"
3. **MCP Endpoint Info**:
   - Shows endpoint URL for AI tool integration
   - Instructions to replace with Convex deployment URL

**Complete Source**: See `settings-route-COMPLETE.tsx`

---

## 3. COMPLETE COMPONENT ANALYSIS

### 3.1 GroupBottomNav Component

**Purpose**: Mobile-only bottom navigation bar

**Tabs**:
1. Overview - LayoutGrid icon
2. Transactions - CreditCard icon
3. **Add** (center, elevated) - Plus icon
4. Members - UserCheck icon
5. Settings - Settings icon

**Special Add Button Design**:
```tsx
// Elevated circular button above navigation bar
<motion.div
  className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full shadow-lg shadow-[#10B981]/50 flex items-center justify-center"
  whileHover={{ y: -2, boxShadow: "0 10px 40px rgba(16, 185, 129, 0.6)" }}
  transition={{ type: "spring", stiffness: 400, damping: 10 }}
>
  <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
</motion.div>
```

**Animation**:
- `layoutId="activeTab"` for smooth indicator transition
- `whileTap={{ scale: 0.95 }}`
- `whileHover={{ scale: 1.05 }}`
- Add button: `whileTap={{ scale: 0.85, rotate: 90 }}`

**Complete Source**: `components/GroupBottomNav.tsx`

---

### 3.2 UI Components (shadcn/ui)

All UI components use Radix UI primitives with Tailwind styling.

#### Drawer (`ui/drawer.tsx`)
- Uses `vaul` library
- Supports 4 directions: top, bottom, left, right
- Auto-shows handle on bottom drawers
- Backdrop overlay with fade animation

#### Checkbox (`ui/checkbox.tsx`)
- Radix Checkbox primitive
- Shows CheckIcon from lucide-react
- Primary color on checked state
- Focus ring with 3px width

#### Radio Group (`ui/radio-group.tsx`)
- Custom styling with #10B981 theme color
- CircleIcon indicator
- Focus ring on keyboard navigation

#### Dialog (`ui/dialog.tsx`)
- Full-screen overlay
- Centered modal
- Close button in top-right
- Zoom + fade animations

#### Popover (`ui/popover.tsx`)
- Portaled content
- Configurable alignment and offset
- Slide animations based on side

#### Command (`ui/command.tsx`)
- cmdk library wrapper
- Search input with icon
- Group headers, separators, items
- Keyboard navigation support

**Complete Sources**: `components/ui/*.tsx`

---

## 4. STYLING SYSTEM DEEP DIVE

### 4.1 CSS Variables (from `app.css`)

**Custom Theme Colors**:
```css
@theme {
  --color-teal: #10B981;           /* Primary brand color */
  --color-teal-dark: #059669;      /* Hover/active states */
  --color-teal-medium: #34D399;    /* Lighter accent */
  --color-blue-teal: #101418;      /* Card backgrounds */
  --color-blue-dark: #111827;      /* Input backgrounds */
  --color-navy: #0A0F12;           /* Page background */
  --color-purple-blue: #0F172A;    /* Unused */
  --color-purple-dark: #0F172A;    /* Unused */
}
```

**Safe Area Utilities** (for iOS notch/home bar):
```css
.pt-safe { padding-top: max(env(safe-area-inset-top), 0px); }
.pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 0px); }
.pl-safe { padding-left: max(env(safe-area-inset-left), 0px); }
.pr-safe { padding-right: max(env(safe-area-inset-right), 0px); }
.px-safe { padding-left: max(env(safe-area-inset-left), 0px); padding-right: max(env(safe-area-inset-right), 0px); }
.b-safe-4 { bottom: max(env(safe-area-inset-bottom), 1rem); }
.r-safe-4 { right: max(env(safe-area-inset-right), 1rem); }
```

**Audiowide Font**:
```css
.font-audiowide {
  font-family: 'Audiowide', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif;
  font-weight: 400;
}
```

**Custom Animations**:
```css
@keyframes blob {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}
.animate-blob { animation: blob 7s infinite; }
```

**View Transitions API**:
```css
@view-transition { navigation: auto; }

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Complete Source**: `app.css`

---

### 4.2 Color Palette Usage

| Color | Usage |
|-------|-------|
| `#0A0F12` | Page background |
| `#101418` | Card/panel backgrounds |
| `#111827` | Input/textarea backgrounds |
| `#10B981` | Primary CTA, borders, accents |
| `#059669` | Hover states |
| `#34D399` | Light accents (unused mostly) |
| `white/70` | Body text |
| `white/50` | Muted text |
| `white/10` | Borders |

---

### 4.3 Spacing System

**Consistent spacing scale**:
- Gap: `gap-2` (0.5rem), `gap-3` (0.75rem), `gap-4` (1rem), `gap-6` (1.5rem)
- Padding: `p-4` (1rem), `p-6` (1.5rem), `p-8` (2rem)
- Margin: `mb-4`, `mb-6`, `mb-8`

**Rounded corners**:
- Small: `rounded-lg` (0.5rem)
- Medium: `rounded-xl` (0.75rem)
- Large: `rounded-2xl` (1rem)

---

## 5. UI/UX PATTERNS

### 5.1 Tab System (Desktop)

**Implementation**:
- Uses Framer Motion's `layoutId` for smooth indicator
- Active tab has green background that slides between tabs
- Inactive tabs show on hover
- Grid layout with equal columns

```tsx
<motion.div layoutId="activeTab" className="absolute inset-0 bg-[#10B981] rounded-xl shadow-lg" />
```

### 5.2 Expense Creation Drawer (Mobile)

**User Flow**:
1. **Amount Entry** (centered, large):
   - Currency symbol + input field
   - Auto-resizing based on input length
   - Most prominent element
2. **Description** (required)
3. **Category Selection** (horizontal scroll):
   - 6 categories with icons
   - Food, Transport, Entertainment, Utilities, Shopping, Other
   - Single select, togglable
4. **Paid By** button:
   - Opens nested drawer
   - Single person OR multiple people mode
   - Multiple: enter exact amounts per person
   - Validates total matches expense amount
5. **Split** button:
   - Opens nested drawer
   - 3 split types:
     - **Equal**: Select members, auto-divides
     - **Exact**: Enter amount for each member
     - **Percentage**: Enter % for each member
   - Real-time validation (amounts/percentages must sum to 100%)
   - Visual feedback: green check or red/yellow warning

**Nested Drawer Pattern**:
```tsx
<Drawer open={splitDrawerOpen} onOpenChange={setSplitDrawerOpen}>
  <DrawerContent className="bg-[#0A0F12] border-t border-[#10B981]/30">
    {/* Split configuration UI */}
  </DrawerContent>
</Drawer>
```

**Validation Examples**:
```tsx
// Exact values validation
const totalAmount = parseFloat(amount) || 0
const allocatedAmount = splitBetween.reduce((sum, id) => {
  return sum + (parseFloat(exactValues[id] || '0'))
}, 0)
const remaining = totalAmount - allocatedAmount
const isValid = Math.abs(remaining) < 0.01

// Visual feedback
<div className={`text-sm p-3 rounded-lg border-2 ${
  isValid 
    ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' 
    : remaining > 0
      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
      : 'bg-red-500/10 border-red-500/30 text-red-500'
}`}>
  {isValid ? (
    <span>✓ Total matches: {currencySymbol}{totalAmount.toFixed(2)}</span>
  ) : (
    <span>
      {remaining > 0 ? 'Remaining' : 'Over by'}: {currencySymbol}{Math.abs(remaining).toFixed(2)}
    </span>
  )}
</div>
```

### 5.3 Settlement Flow

1. User sees "Suggested Settlements" on Overview tab
2. Click "Settle Up" on a suggestion
3. Opens SettlementDrawer with:
   - Who owes whom (pre-filled)
   - Amount input (with quick "settle full amount" button)
   - Notes textarea (optional)
4. Submit creates settlement record
5. Balances update in real-time

### 5.4 Loading States

**Skeleton Pattern**:
- Pulse animation on gray backgrounds
- Mimic actual content layout
- Used in root and group detail

**Suspense Boundaries**:
```tsx
<Suspense fallback={<GroupDetailSkeleton />}>
  <Outlet />
</Suspense>
```

### 5.5 Empty States

All empty states follow pattern:
1. Large icon (gray-400)
2. Bold heading
3. Muted description
4. CTA button (if applicable)

Example:
```tsx
<div className="text-center py-12">
  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
  <p className="text-lg text-white/70 mb-2">No groups yet</p>
  <p className="text-sm text-white/50">
    Create your first group to start tracking expenses
  </p>
</div>
```

### 5.6 Error Handling

**Auth Required State**:
```tsx
if (!user) {
  return (
    <motion.div className="min-h-[100dvh] bg-[#0A0F12] flex items-center justify-center">
      <div className="text-center">
        <h2>Authentication Required</h2>
        <p>Please sign in to view this group.</p>
        <button onClick={() => navigate({ to: '/' })}>
          Go to Sign In
        </button>
      </div>
    </motion.div>
  )
}
```

**Not Found State**:
```tsx
if (!group) {
  return (
    <motion.div className="min-h-[100dvh] bg-[#0A0F12] flex items-center justify-center">
      <div className="text-center">
        <h2>Group not found</h2>
        <p>This group doesn't exist or you don't have access to it.</p>
        <button onClick={() => navigate({ to: '/' })}>
          Go to Dashboard
        </button>
      </div>
    </motion.div>
  )
}
```

**Form Errors**:
```tsx
{error && (
  <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
    <span>{error}</span>
  </div>
)}
```

---

## 6. CONVEX INTEGRATION PATTERNS

### 6.1 Query Pattern

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

const { data: groups } = useSuspenseQuery(
  convexQuery(api.groups.getUserGroups, { userId: user._id })
)
```

### 6.2 Mutation Pattern

```tsx
import { useMutation } from 'convex/react'

const createExpense = useMutation(api.expenses.createExpense)

await createExpense({
  groupId,
  description,
  amount: totalCents,
  paidBy: primaryPayer,
  currency: currencyCode,
  date: Date.now(),
  splitType,
  category: category || undefined,
  splits,
  paidByMultiple: paidByData,
})
```

### 6.3 Action Pattern (for AI)

```tsx
import { useAction } from 'convex/react'

const createFromInstruction = useAction(api.ai.createExpenseFromInstruction)

const res = await createFromInstruction({
  groupId: groupId as any,
  userId: user._id,
  instruction: aiInstruction.trim(),
})
```

### 6.4 Direct Query (without React Query)

```tsx
import { useConvex } from 'convex/react'

const convex = useConvex()
const results = await convex.query(api.users.searchUsersByEmail, { emailQuery: email })
```

### 6.5 Auth Integration

```tsx
import { useAuthActions } from "@convex-dev/auth/react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useConvexAuth } from "convex/react"

export function useAuth() {
  const { signIn, signOut } = useAuthActions()
  const { isLoading: isAuthLoading } = useConvexAuth()
  const currentUser = useQuery(api.users.getCurrentUser)
  
  const isLoading = isAuthLoading || currentUser === undefined

  return {
    user: currentUser,
    isLoading,
    signInWithGoogle: async () => {
      await signIn("google")
    },
    signOut,
  }
}
```

---

## 7. USER FLOWS

### 7.1 New User Onboarding

1. **Land on homepage** → See landing page
2. **Click "Continue with Google"** → OAuth flow
3. **Redirect back** → Now see dashboard (empty state)
4. **Click "Create Your First Group"** → Navigate to /groups/new
5. **Fill form** (name, description, currency) → Submit
6. **Redirect to group detail** → Empty expenses state

### 7.2 Create Group Flow

1. **From Dashboard**: Click "Create Group" button (FAB or drawer trigger)
2. **Mobile**: Drawer slides up from bottom
3. **Desktop**: Navigate to /groups/new (full page form)
4. **Enter details**:
   - Group name (required)
   - Description (optional)
   - Select currency from dropdown
5. **Submit** → Creates group in Convex
6. **Navigate** to /groups/{newGroupId}

### 7.3 Add Member Flow

1. **Navigate to Members tab** (or click "+ Add Member")
2. **Modal opens** with email search
3. **Enter complete email address** → Click "Find User"
4. **Search results show** (exact match only)
5. **If already member** → Show "Already a member" badge
6. **If new** → Click "Add" button
7. **Member added** → Modal closes, member list updates

**Error Cases**:
- Invalid email format → "Please enter a complete, valid email address"
- No user found → "No user found with that email address"
- User already member → Show in UI, disable add button
- Convex error → Extract user-friendly message from error

### 7.4 Create Expense Flow - All 3 Split Types

#### 7.4.1 Equal Split

1. **Click "Add Expense"** (FAB or header button)
2. **Drawer/modal opens**
3. **Enter amount** (centered, large input)
4. **Enter description** (required)
5. **Select category** (optional, horizontal scroll)
6. **Click "Paid by"**:
   - Opens nested drawer
   - Select single person (radio buttons)
   - OR click "Paid by Multiple People"
   - Drawer closes on selection
7. **Click "Split"**:
   - Opens nested drawer
   - Select "Split Equally" (default)
   - Check/uncheck members in list
   - See live per-person amount
   - Click "Done"
8. **Click "Add"** → Expense created

**Amount calculation**:
```tsx
const n = splitBetween.length
const base = Math.floor(totalCents / n)
let remainder = totalCents - base * n
splits = splitBetween.map((id) => {
  const extra = remainder > 0 ? 1 : 0
  if (remainder > 0) remainder -= 1
  return { userId: id, amount: base + extra }
})
```

#### 7.4.2 Exact Values Split

1. **Follow steps 1-6 above**
2. **Click "Split"** → Opens nested drawer
3. **Select "Split by Exact Values"**
4. **Enter amount for each selected member**:
   - Grid of name + input field
   - Real-time sum calculation
   - Visual feedback:
     - Green check if sum = total
     - Yellow warning if remaining > 0
     - Red warning if over
5. **When valid** → "Done" button enabled
6. **Click "Done"** → Drawer closes
7. **Click "Add"** → Expense created

#### 7.4.3 Percentage Split

1. **Follow steps 1-6 above**
2. **Click "Split"** → Opens nested drawer
3. **Select "Split by Percentage"**
4. **Enter percentage for each member**:
   - Shows calculated amount per person
   - Real-time sum (must = 100%)
   - Visual feedback (same as exact values)
5. **When valid** → "Done" button enabled
6. **Click "Done"** → Drawer closes
7. **Click "Add"** → Expense created

**Backend note**: Percentages sent as-is to backend, which calculates amounts

### 7.5 View Balances Flow

1. **Navigate to Overview tab**
2. **See "Your Balance"**:
   - Large amount display
   - Green if owed, red if owing
   - Badge: "You are owed" / "You owe" / "All settled up!"
3. **Below**: "Suggested Settlements" section
   - Shows optimal settlement paths
   - Each shows: "Person A → Person B: $X.XX"
   - "Settle Up" button if you're the payer

### 7.6 Settlement Creation Flow

1. **From Overview tab**: Click "Settle Up" on suggestion
   - OR from Members tab: Click member, then settle action
2. **SettlementDrawer opens**
3. **Shows**:
   - Who owes whom
   - Current balance amount
4. **Enter amount** (or click "Settle full amount")
5. **Optionally add notes**
6. **Click "Record Payment"**
7. **Settlement created** → Drawer closes → Balances update

### 7.7 Export Data Flow

1. **Navigate to Overview tab**
2. **Scroll to "Export Group Data" section**
3. **Click "Export"** → Dropdown menu
4. **Select format**:
   - Export as JSON
   - Export as CSV
5. **File downloads** with filename: `{GroupName}_export_{date}.{ext}`

**Data included**:
- Group info (name, description, currency, created date)
- All members with roles
- All balances
- All expenses with splits
- All settlements
- Export metadata (timestamp, exported by)

---

## 8. FORMS & VALIDATION

### 8.1 Form Input Styling

**Standard Input**:
```tsx
<input
  className="w-full px-4 py-2.5 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all text-sm"
  required
/>
```

**Large Amount Input**:
```tsx
<div className="flex items-baseline justify-center gap-1">
  <span className="text-3xl font-bold text-white/60">{currencySymbol}</span>
  <input
    type="number"
    step="0.01"
    className="bg-transparent border-none outline-none text-4xl font-bold text-white placeholder-white/30 w-auto min-w-[100px] max-w-[200px] text-left focus:text-[#10B981] transition-colors"
    style={{ width: `${Math.max(3, (amount || '0').toString().length)}ch` }}
  />
</div>
```

### 8.2 Validation Patterns

**Email Validation**:
```tsx
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  setError('Please enter a complete, valid email address')
  return
}
```

**Amount Validation**:
```tsx
const totalCents = Math.round(parseFloat(amount) * 100)
if (!isFinite(totalCents) || totalCents <= 0) {
  setFormError('Enter a valid amount.')
  return
}
```

**Split Sum Validation**:
```tsx
// Exact values
let sum = 0
splits = splitBetween.map((id) => {
  const v = Math.round(parseFloat(exactValues[id] || '0') * 100)
  sum += v
  return { userId: id, amount: v }
})
if (sum !== totalCents) {
  setFormError('Exact amounts must add up to the total amount.')
  return
}

// Percentages
let pctSum = 0
splits = splitBetween.map((id) => {
  const p = parseFloat(percentValues[id] || '0')
  pctSum += isFinite(p) ? p : 0
  return { userId: id, amount: isFinite(p) ? p : 0 }
})
if (Math.abs(pctSum - 100) > 0.01) {
  setFormError('Percentages must add up to 100%.')
  return
}
```

**Multiple Payers Validation**:
```tsx
const paidTotal = Object.values(paidByMultiple).reduce((sum, val) => {
  return sum + Math.round(parseFloat(val || '0') * 100)
}, 0)
if (Math.abs(paidTotal - totalCents) > 1) {
  setFormError('Paid amounts must add up to the total amount.')
  return
}
```

---

## 9. MOBILE OPTIMIZATION

### 9.1 Responsive Breakpoints

- **Mobile**: < 768px (md breakpoint)
- **Desktop**: >= 768px

**Common Patterns**:
```tsx
className="md:hidden"           // Show only on mobile
className="hidden md:block"     // Show only on desktop
className="text-sm sm:text-base" // Responsive text size
className="flex-col sm:flex-row" // Stack on mobile, row on desktop
```

### 9.2 Mobile-Specific Components

1. **GroupBottomNav** (only visible on mobile)
2. **Drawer** for expense creation (mobile) vs Modal (desktop)
3. **Floating FAB** for create group (mobile) vs header button (desktop)

### 9.3 Safe Area Handling

**iOS Notch/Home Bar Support**:
```css
.pt-safe { padding-top: max(env(safe-area-inset-top), 0px); }
.pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 0px); }
```

**Usage**:
```tsx
<header className="sticky top-0 pt-safe px-safe">
  {/* Content */}
</header>

<div className="fixed bottom-0 pb-safe">
  {/* Bottom nav */}
</div>
```

### 9.4 Touch Optimizations

**Tap Highlight Removal**:
```css
html, body {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
```

**Overscroll Behavior**:
```css
html, body {
  overscroll-behavior: none;
}
```

### 9.5 Viewport Configuration

```tsx
meta: [
  {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1, viewport-fit=cover',
  },
]
```

`viewport-fit=cover` ensures content extends into safe areas.

---

## 10. PROJECT SETUP & CONFIGURATION

### 10.1 package.json Scripts

```json
{
  "scripts": {
    "dev": "npx convex dev --once && concurrently -r npm:dev:web npm:dev:convex",
    "dev:web": "vite dev",
    "dev:ts": "tsc -b -w",
    "dev:convex": "npx convex dev",
    "build": "vite build && tsc --noEmit",
    "start": "node .output/server/index.mjs"
  }
}
```

**Development Workflow**:
1. Run `npm run dev`
2. Convex initializes once
3. Vite dev server starts on port 3000
4. Convex dev server runs in parallel
5. TypeScript compiles in watch mode

### 10.2 TypeScript Configuration

**Key Settings**:
- Target: ES2022
- Module: ESNext
- Strict mode enabled
- Path alias: `~/*` → `./src/*`
- JSX: react-jsx

**Complete tsconfig.json**:
```json
{
  "include": ["**/*.ts", "**/*.tsx", "public/script*.js"],
  "compilerOptions": {
    "target": "ES2022",
    "jsx": "react-jsx",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["./src/*"]
    },
    "esModuleInterop": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 10.3 Vite Configuration

```typescript
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import netlify from '@netlify/vite-plugin-tanstack-start'

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: true,
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ['./tsconfig.json'] }),
    tanstackStart(),
    netlify(),
    viteReact(),
  ],
})
```

### 10.4 Router Setup

```typescript
import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL!
  const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        gcTime: 5000,
      },
    },
  })
  convexQueryClient.connect(queryClient)

  const router = routerWithQueryClient(
    createRouter({
      routeTree,
      defaultPreload: 'intent',
      context: { queryClient },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0,
      Wrap: ({ children }) => (
        <ConvexAuthProvider client={convexQueryClient.convexClient}>
          {children}
        </ConvexAuthProvider>
      ),
    }),
    queryClient,
  )

  return router
}
```

### 10.5 Environment Variables

**Required**:
- `VITE_CONVEX_URL` - Convex deployment URL

**Example** (`.env.local`):
```
VITE_CONVEX_URL=https://YOUR_DEPLOYMENT.convex.cloud
```

### 10.6 shadcn/ui Configuration

**components.json**:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/app.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "~/components",
    "utils": "~/lib/utils",
    "ui": "~/components/ui",
    "lib": "~/lib",
    "hooks": "~/hooks"
  }
}
```

---

## SUMMARY: BUILDING THE CLONE

To build an exact clone:

### 1. Initial Setup
```bash
npm create vite@latest my-owwn-clone -- --template react-ts
cd my-owwn-clone
npm install
```

### 2. Install Dependencies
```bash
npm install @convex-dev/auth @convex-dev/react-query @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-radio-group @tanstack/react-query @tanstack/react-router @tanstack/react-router-with-query @tanstack/react-start class-variance-authority clsx cmdk convex framer-motion jose lucide-react motion react react-dom tailwind-merge vaul

npm install -D @convex-dev/eslint-plugin @netlify/vite-plugin-tanstack-start @tailwindcss/vite @tanstack/eslint-config @types/react @types/react-dom @vitejs/plugin-react concurrently prettier tailwindcss tw-animate-css typescript vite vite-tsconfig-paths
```

### 3. Copy File Structure
- Use all route files from `owwn-analysis/` directory
- Copy all component files
- Copy lib files (utils, auth-context, view-transitions)
- Copy app.css with all CSS variables
- Configure router.tsx
- Set up tsconfig.json and vite.config.ts

### 4. Set Up Convex
- Initialize Convex: `npx convex dev`
- Configure authentication (Google OAuth)
- Create all backend functions (refer to backend analysis)

### 5. Configure Tailwind
- Install Tailwind CSS v4
- Copy app.css exactly
- Import in root route

### 6. Test All Flows
- Test authentication
- Test group creation
- Test expense creation (all 3 split types)
- Test settlements
- Test export functionality
- Test mobile navigation
- Test responsive design

---

## FILE REFERENCE

All complete source files are saved in `/home/user/money-mate/owwn-analysis/`:

**Routes**:
- `index-route-COMPLETE.tsx` - Landing + Dashboard
- `root-route-COMPLETE.tsx` - Root layout
- `new-group-route-COMPLETE.tsx` - Create group
- `groupId-route-COMPLETE.tsx` - Group detail (2286 lines)
- `expense-detail-route-COMPLETE.tsx` - Expense detail
- `settings-route-COMPLETE.tsx` - Settings/API keys

**Components**:
- `components/GroupBottomNav.tsx`
- `components/ui/drawer.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/radio-group.tsx`
- `components/ui/dialog.tsx`
- `components/ui/popover.tsx`
- `components/ui/command.tsx`

**Lib**:
- `lib/utils.ts`
- `lib/auth-context.tsx`
- `lib/view-transitions.ts`

**Other**:
- `app.css` - Complete styles
- `router.tsx` - Router configuration

---

**END OF ANALYSIS**

This document contains EVERY detail needed to build an exact clone of Owwn's frontend.
All source code files are complete and ready to use.

