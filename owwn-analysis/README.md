# OWWN FRONTEND - COMPLETE SOURCE CODE & ANALYSIS

This directory contains a **complete and thorough exploration** of the Owwn expense tracking application frontend.

## 📁 Directory Contents

### 📄 Analysis Documents
- **COMPLETE_ANALYSIS.md** - 500+ line comprehensive analysis covering:
  - Project overview & tech stack
  - Complete route analysis (all 6 routes)
  - Component breakdown
  - Styling system deep dive
  - UI/UX patterns
  - Convex integration patterns
  - User flows (step-by-step for all features)
  - Forms & validation
  - Mobile optimization
  - Project setup & configuration

### 🛤️ Routes (Complete Source Code)
All route files contain the **exact source code** from the Owwn repository:

1. **root-route-COMPLETE.tsx** (90 lines)
   - Root layout with meta tags
   - View Transitions API setup
   - App skeleton loading state
   - Audiowide font loading

2. **index-route-COMPLETE.tsx** (650+ lines)
   - Landing page (unauthenticated)
   - Dashboard (authenticated)
   - Create Group Drawer (mobile)
   - Framer Motion animations

3. **new-group-route-COMPLETE.tsx** (120 lines)
   - Full-page group creation form
   - Currency selector (10 currencies)
   - Form validation & submission

4. **groupId-route-COMPLETE.tsx** (2286 lines) ⭐ **THE BIG ONE**
   - Main group detail page
   - Tab system (Overview, Expenses, Members, Settings)
   - **AddExpenseDrawer** (mobile) with nested drawers
   - **AddExpenseModal** (desktop)
   - **AddMemberModal** (search & add)
   - **SettlementDrawer** (record payments)
   - **ExportDataSection** (JSON/CSV export)
   - **MembersTabContent** (member list)
   - All 3 split types: Equal, Exact, Percentage
   - Multiple payer support
   - AI assistant integration

5. **expense-detail-route-COMPLETE.tsx** (130 lines)
   - Read-only expense view
   - Shows amount, description, category
   - Paid by section (single/multiple payers)
   - Split between details
   - Optional notes

6. **settings-route-COMPLETE.tsx** (320 lines)
   - API key management
   - Create/revoke/delete keys
   - MCP server endpoint info
   - Animated modals

### 🧩 Components (Complete Source Code)

**Main Components:**
- **components/GroupBottomNav.tsx** - Mobile bottom navigation with elevated FAB

**UI Components (shadcn/ui):**
- **components/ui/drawer.tsx** - Vaul drawer wrapper
- **components/ui/checkbox.tsx** - Radix checkbox
- **components/ui/radio-group.tsx** - Radix radio group
- **components/ui/dialog.tsx** - Radix dialog/modal
- **components/ui/popover.tsx** - Radix popover
- **components/ui/command.tsx** - cmdk wrapper

### 📚 Lib Files (Complete Source Code)
- **lib/utils.ts** - `cn()` utility for class merging
- **lib/auth-context.tsx** - Auth hook wrapping Convex Auth
- **lib/view-transitions.ts** - View Transitions API helpers

### 🎨 Styles
- **app.css** - Complete global styles with:
  - CSS variables for theme colors
  - Safe area utilities (iOS support)
  - Audiowide font utility
  - Blob animation
  - View Transitions API styles
  - Custom scrollbar
  - Base styles

### ⚙️ Configuration
- **router.tsx** - Router configuration with Convex integration

---

## 🎯 Key Features Analyzed

### 1. Expense Creation
- **3 split types**: Equal, Exact Values, Percentage
- **Multiple payer support**: Split payment among multiple people
- **Category selection**: 6 categories with icons
- **Real-time validation**: Visual feedback for split calculations
- **Nested drawers**: Mobile-optimized UX

### 2. Settlement System
- **Suggested settlements**: Optimal payment paths
- **Quick settle**: Button to settle full amount
- **Notes support**: Add context to payments
- **Real-time balance updates**

### 3. Data Export
- **JSON export**: Full structured data
- **CSV export**: Spreadsheet-friendly format
- **Comprehensive data**: Groups, members, expenses, settlements, balances

### 4. Mobile Optimization
- **Safe area support**: iOS notch/home bar handling
- **Bottom navigation**: 5-tab system with elevated FAB
- **Drawer UI**: Bottom sheets for forms
- **Touch optimizations**: Tap highlight removal, overscroll prevention

### 5. Animation & Transitions
- **Framer Motion**: Stagger animations, layout transitions
- **View Transitions API**: Page transition smoothness
- **Spring physics**: Natural feel interactions
- **Micro-interactions**: Hover, tap, focus states

---

## 🚀 How to Use This Analysis

### For Cloning Owwn:
1. Read **COMPLETE_ANALYSIS.md** sections 1-10
2. Copy all route files from this directory
3. Copy all component files
4. Copy lib and styles files
5. Follow setup instructions in section 10

### For Understanding Specific Features:
- **Expense creation**: See section 5.2 + `groupId-route-COMPLETE.tsx` lines 560-1200
- **Split types**: See section 7.4 (all 3 types explained)
- **Settlements**: See section 5.3 + 7.6
- **Mobile nav**: See section 3.1 + `components/GroupBottomNav.tsx`
- **Styling**: See section 4 + `app.css`

### For Integration Patterns:
- **Convex queries**: See section 6.1
- **Convex mutations**: See section 6.2
- **Authentication**: See section 6.5 + `lib/auth-context.tsx`
- **AI integration**: See `groupId-route-COMPLETE.tsx` lines 150-200

---

## 📊 Statistics

- **Total routes analyzed**: 6
- **Total components**: 7 main + 6 UI primitives
- **Largest file**: groupId.tsx (2286 lines)
- **Total dependencies**: 28
- **Animation library**: Framer Motion (motion)
- **UI framework**: Radix UI + Tailwind CSS v4
- **Backend**: Convex serverless

---

## 🎨 Design System Summary

### Colors
- Primary: `#10B981` (Emerald/Teal)
- Background: `#0A0F12` (Dark Navy)
- Cards: `#101418` (Lighter Navy)
- Inputs: `#111827` (Dark Gray)

### Typography
- Brand font: Audiowide (logo/headings)
- Body font: System font stack

### Spacing
- Base unit: 0.25rem (4px)
- Common gaps: 2, 3, 4, 6 (0.5rem to 1.5rem)
- Common padding: 4, 6, 8 (1rem to 2rem)

### Rounded Corners
- Small: rounded-lg (0.5rem)
- Medium: rounded-xl (0.75rem)
- Large: rounded-2xl (1rem)

---

## 🔑 Key Patterns to Implement

### 1. Nested Drawers (Mobile)
Used for expense split configuration:
```tsx
<Drawer open={mainOpen}>
  <DrawerContent>
    {/* Main form */}
    <Drawer open={nestedOpen}>
      <DrawerContent>
        {/* Nested configuration */}
      </DrawerContent>
    </Drawer>
  </DrawerContent>
</Drawer>
```

### 2. Real-time Validation
Visual feedback for form validation:
```tsx
const isValid = Math.abs(remaining) < 0.01
const statusColor = isValid ? 'green' : remaining > 0 ? 'yellow' : 'red'
```

### 3. Suspense + Skeleton
Loading states with fallback:
```tsx
<Suspense fallback={<Skeleton />}>
  <DataComponent />
</Suspense>
```

### 4. Motion Animations
Stagger animations for lists:
```tsx
<motion.div variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.div key={item.id} variants={item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### 5. Safe Area Handling
iOS notch support:
```tsx
<header className="pt-safe px-safe">
  {/* Content */}
</header>
```

---

## 📝 Notes

- All source code is from the **main branch** of https://github.com/notnotrachit/Owwn
- Fetched on: $(date)
- All files are complete and unmodified
- TypeScript with strict mode enabled
- React 19 with concurrent features
- TanStack Router for file-based routing
- Convex for backend (serverless, real-time)

---

## 💡 Next Steps

1. **Read COMPLETE_ANALYSIS.md** thoroughly
2. **Study groupId-route-COMPLETE.tsx** - the core of the app
3. **Examine mobile UX patterns** in GroupBottomNav and drawers
4. **Review validation logic** for split calculations
5. **Understand Convex integration** patterns
6. **Set up your own Convex backend** following the patterns
7. **Build incrementally**: Start with auth, then groups, then expenses

---

## ⚡ Quick Reference

| Feature | File | Lines |
|---------|------|-------|
| Landing page | index-route-COMPLETE.tsx | 1-300 |
| Dashboard | index-route-COMPLETE.tsx | 301-650 |
| Create group | new-group-route-COMPLETE.tsx | All |
| Group detail | groupId-route-COMPLETE.tsx | All (2286!) |
| Expense form | groupId-route-COMPLETE.tsx | 560-1200 |
| Settlement | groupId-route-COMPLETE.tsx | 1950-2100 |
| Export | groupId-route-COMPLETE.tsx | 2100-2200 |
| Mobile nav | components/GroupBottomNav.tsx | All |
| Auth | lib/auth-context.tsx | All |
| Styling | app.css | All |

---

**This analysis provides EVERYTHING needed to build an exact clone of Owwn.**

All patterns, components, flows, and implementation details are documented and source code is provided.

Good luck building! 🚀
