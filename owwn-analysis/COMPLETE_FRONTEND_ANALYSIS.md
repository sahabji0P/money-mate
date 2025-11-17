# OWWN FRONTEND - COMPLETE ANALYSIS & SOURCE CODE

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [All Routes - Complete Source Code](#all-routes)
4. [All Components - Complete Source Code](#all-components)
5. [Styling System](#styling-system)
6. [UI/UX Patterns](#ui-ux-patterns)
7. [Convex Integration](#convex-integration)
8. [User Flows](#user-flows)
9. [Project Configuration](#project-configuration)

---

## PROJECT OVERVIEW

Owwn is a modern expense-sharing application built with:
- **Framework**: React 19 + TanStack Start (file-based routing)
- **Backend**: Convex (serverless backend with real-time sync)
- **Styling**: Tailwind CSS v4 + custom CSS variables
- **UI Library**: Radix UI primitives + shadcn/ui components
- **Animation**: Framer Motion (motion package)
- **Authentication**: Convex Auth with Google OAuth
- **State Management**: React Query + Convex mutations/queries

---

## TECHNOLOGY STACK

### Dependencies (from package.json)
```json
{
  "dependencies": {
    "@convex-dev/auth": "^0.0.90",
    "@convex-dev/react-query": "^0.0.0-alpha.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@tanstack/react-query": "^5.89.0",
    "@tanstack/react-router": "^1.132.2",
    "@tanstack/react-router-with-query": "^1.130.17",
    "@tanstack/react-start": "^1.132.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "convex": "^1.28.0",
    "framer-motion": "^12.23.24",
    "jose": "^6.1.0",
    "lucide-react": "^0.553.0",
    "motion": "^12.23.24",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "tailwind-merge": "^3.4.0",
    "vaul": "^1.1.2"
  }
}
```

### Key Architecture Patterns
1. **File-based routing** with TanStack Router
2. **Real-time data sync** via Convex subscriptions
3. **Optimistic updates** using React Query mutations
4. **Mobile-first design** with responsive breakpoints
5. **Safe area support** for iOS devices (notch/home bar)
6. **View Transitions API** for smooth page transitions

---

## ALL ROUTES

### Route Structure
```
src/routes/
├── __root.tsx                          # Root layout with meta tags
├── index.tsx                           # Landing page + Dashboard
├── settings.tsx                        # API key management
└── groups/
    ├── new.tsx                         # Create new group
    ├── $groupId.tsx                    # Group detail (main page)
    └── $groupId/
        └── expenses/
            └── $expenseId.tsx          # Individual expense detail
```

---

