# Biblical Battle Plans - Next Steps Guide

## Prerequisites Checklist

Before proceeding, ensure you have completed:

- [ ] Created Supabase project at [supabase.com](https://supabase.com)
- [ ] Run `001_initial_schema.sql` in Supabase SQL Editor
- [ ] Run `seed.sql` in Supabase SQL Editor
- [ ] Created `.env.local` with your credentials:
  ```
  VITE_SUPABASE_URL=your_project_url
  VITE_SUPABASE_ANON_KEY=your_anon_key
  ```
- [ ] Enabled Email auth in Supabase Dashboard → Authentication → Providers
- [ ] (Optional) Configured Google OAuth provider

---

## Phase 1: Authentication System

### 1.1 Create Auth Store (Zustand)

**File:** `src/hooks/useAuth.ts`

```typescript
// Auth store with Zustand
// - Track user session state
// - Handle login/logout/signup
// - Load user profile from profiles table
// - Provide isAuthenticated, isLoading states
```

**Key functions to implement:**
- `signIn(email, password)` - Email/password login
- `signUp(email, password, username)` - Registration
- `signOut()` - Logout
- `signInWithGoogle()` - OAuth login
- `resetPassword(email)` - Password reset email
- `updateProfile(data)` - Update user profile

### 1.2 Create Auth Components

**Files to create:**

| File | Purpose |
|------|---------|
| `src/components/auth/AuthForm.tsx` | Reusable form for login/signup |
| `src/components/auth/ProtectedRoute.tsx` | Route guard wrapper |
| `src/components/auth/GoogleAuthButton.tsx` | OAuth button component |

### 1.3 Create Auth Pages

**Files to create:**

| File | Purpose |
|------|---------|
| `src/pages/Login.tsx` | Login page with email + Google |
| `src/pages/Signup.tsx` | Registration with username |
| `src/pages/ForgotPassword.tsx` | Password reset request |

### 1.4 Auth Page Design Notes

- Use terminal aesthetic (green text on dark background)
- Include ASCII art or pixel logo at top
- Form fields should use the `Input` component
- Buttons should use the `Button` component
- Add "blinking cursor" effect on focus
- Error messages in red terminal style

---

## Phase 2: App Layout & Routing

### 2.1 Create Layout Component

**File:** `src/components/Layout.tsx`

```
┌─────────────────────────────────────────┐
│ HEADER: Logo, Nav, User Menu            │
├─────────────────────────────────────────┤
│                                         │
│              MAIN CONTENT               │
│                                         │
├─────────────────────────────────────────┤
│ MOBILE NAV (bottom, mobile only)        │
└─────────────────────────────────────────┘
```

**Features:**
- Responsive navigation
- User dropdown menu (Profile, Logout)
- Current streak display in header
- Mobile bottom navigation

### 2.2 Set Up React Router

**File:** `src/App.tsx`

```
Routes:
/              → Dashboard (protected)
/login         → Login page
/signup        → Signup page
/forgot-password → Password reset
/plans         → Browse plans (protected)
/plans/:id     → Plan detail (protected)
/campaign/:id  → Active plan view (protected)
/profile       → User profile (protected)
```

### 2.3 Navigation Component

**File:** `src/components/Navigation.tsx`

- Desktop: Horizontal nav in header
- Mobile: Bottom tab bar
- Active state styling (green glow)
- Icons + text labels

---

## Phase 3: Dashboard

### 3.1 Dashboard Page

**File:** `src/pages/Dashboard.tsx`

**Layout:**
```
┌────────────────────────────────────────────┐
│ WELCOME BACK, SOLDIER                      │
│ Current Streak: 7 DAYS [WARRIOR]           │
├────────────────────────────────────────────┤
│ TODAY'S MISSIONS                           │
│ ┌──────────────────────────────────────┐   │
│ │ Horner's System - Day 45             │   │
│ │ [░░░░░░░░░░] 0/10 Lists              │   │
│ │ > Start Mission                      │   │
│ └──────────────────────────────────────┘   │
├────────────────────────────────────────────┤
│ STATS            │ RECENT ACTIVITY         │
│ ┌──────────────┐ │ • Completed Day 44      │
│ │ CHAPTERS: 423│ │ • Started Horner's      │
│ │ STREAK: 7    │ │ • Joined campaign       │
│ │ CAMPAIGNS: 2 │ │                         │
│ └──────────────┘ │                         │
└────────────────────────────────────────────┘
```

### 3.2 Dashboard Components

**Files to create:**

| File | Purpose |
|------|---------|
| `src/components/dashboard/TodaysReadings.tsx` | Today's reading cards |
| `src/components/dashboard/StatsWidget.tsx` | Quick stats display |
| `src/components/dashboard/ActiveCampaigns.tsx` | List of active plans |
| `src/components/dashboard/ActivityFeed.tsx` | Recent completions |

### 3.3 Stats Hook

**File:** `src/hooks/useStats.ts`

Queries to implement:
- Total chapters read (count completed sections)
- Current streak (consecutive days)
- Longest streak (historical max)
- Plans completed count
- Plans active count

---

## Phase 4: Reading Plans Feature

### 4.1 Plans Listing Page

**File:** `src/pages/Plans.tsx`

- Grid of available reading plans
- Each plan shows: name, description, type badge
- "Start Campaign" button
- Filter by type (future)

### 4.2 Plan Detail Page

**File:** `src/pages/PlanDetail.tsx`

- Full plan description
- What's included (books, duration)
- Start date picker (defaults to today)
- "Begin Campaign" button
- Preview of daily structure

### 4.3 Active Plan Page (Campaign View)

**File:** `src/pages/ActivePlan.tsx`

This is the core reading interface:

**For Horner's System (10 lists):**
```
┌────────────────────────────────────────────┐
│ HORNER'S SYSTEM - DAY 45                   │
│ [████████░░░░░░░░░░░░] 4/10 Complete       │
├────────────────────────────────────────────┤
│ ☑ List 1: Matthew 17                       │
│ ☑ List 2: Romans 8                         │
│ ☑ List 3: 1 Thessalonians 3                │
│ ☑ List 4: Hebrews 5                        │
│ ☐ List 5: Psalm 45                         │
│ ☐ List 6: Proverbs 14                      │
│ ☐ List 7: Exodus 23                        │
│ ☐ List 8: 1 Samuel 15                      │
│ ☐ List 9: Isaiah 45                        │
│ ☐ List 10: Revelation 12                   │
├────────────────────────────────────────────┤
│ [MARK DAY COMPLETE]  (disabled until 10/10)│
└────────────────────────────────────────────┘
```

**For Sequential Plans:**
```
┌────────────────────────────────────────────┐
│ CANONICAL CAMPAIGN - DAY 45                │
│ [████████████░░░░░░░░] 45/365 Days         │
├────────────────────────────────────────────┤
│ TODAY'S READING:                           │
│                                            │
│ > Exodus 15-17                             │
│                                            │
│ ☐ Mark as Complete                         │
├────────────────────────────────────────────┤
│ [CONQUER THIS DAY]                         │
└────────────────────────────────────────────┘
```

### 4.4 Plans Hooks

**File:** `src/hooks/usePlans.ts`

```typescript
// Queries
useReadingPlans()      // Fetch all available plans
useUserPlans()         // Fetch user's active/completed plans
useUserPlan(id)        // Fetch single user plan with progress
useDailyProgress(userPlanId, dayNumber)  // Today's progress

// Mutations
useStartPlan()         // Start a new plan
useMarkSectionComplete()  // Mark one section done
useMarkDayComplete()   // Mark entire day done
useUpdateNotes()       // Save daily notes
```

### 4.5 Plans Components

**Files to create:**

| File | Purpose |
|------|---------|
| `src/components/plans/PlanCard.tsx` | Plan preview card |
| `src/components/plans/DailyReading.tsx` | Today's reading display |
| `src/components/plans/ReadingSection.tsx` | Checkbox + passage |
| `src/components/plans/PlanProgress.tsx` | Overall progress bar |
| `src/components/plans/CalendarView.tsx` | Monthly calendar view |

---

## Phase 5: Profile Page

### 5.1 Profile Page

**File:** `src/pages/Profile.tsx`

```
┌────────────────────────────────────────────┐
│ SOLDIER PROFILE                            │
├────────────────────────────────────────────┤
│ [Avatar]  @username                        │
│           Display Name                     │
│           Enlisted: Jan 1, 2025            │
├────────────────────────────────────────────┤
│ BATTLE STATISTICS                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │CHAPTERS  │ │CURRENT   │ │LONGEST   │    │
│ │   423    │ │STREAK: 7 │ │STREAK: 14│    │
│ └──────────┘ └──────────┘ └──────────┘    │
├────────────────────────────────────────────┤
│ CAMPAIGN HISTORY                           │
│ • Horner's System (Active - Day 45)        │
│ • Canonical Plan (Completed - 365 days)    │
├────────────────────────────────────────────┤
│ [EDIT PROFILE]  [SIGN OUT]                 │
└────────────────────────────────────────────┘
```

### 5.2 Profile Components

**Files to create:**

| File | Purpose |
|------|---------|
| `src/components/profile/ProfileHeader.tsx` | Avatar, name, join date |
| `src/components/profile/ProfileStats.tsx` | Full stat breakdown |
| `src/components/profile/CompletedPlans.tsx` | Campaign history |

---

## Phase 6: React Query Setup

### 6.1 Query Client Configuration

**File:** `src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})
```

### 6.2 Wrap App with Provider

**File:** `src/main.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'

// Wrap <App /> with <QueryClientProvider client={queryClient}>
```

---

## Implementation Order

### Recommended sequence:

1. **Auth System** (useAuth hook → ProtectedRoute → Login/Signup pages)
2. **Layout & Routing** (Layout component → App.tsx routes)
3. **Dashboard** (basic version with placeholder data)
4. **Plans Hooks** (usePlans, useUserPlans, etc.)
5. **Plans Pages** (Browse → Detail → Active Plan)
6. **Dashboard** (connect to real data)
7. **Profile Page**
8. **Polish & Testing**

---

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

---

## Supabase Queries Reference

### Fetch user's active plans with plan details:
```typescript
const { data } = await supabase
  .from('user_plans')
  .select(`
    *,
    plan:reading_plans(*)
  `)
  .eq('user_id', userId)
  .eq('is_completed', false)
```

### Fetch today's progress:
```typescript
const { data } = await supabase
  .from('daily_progress')
  .select('*')
  .eq('user_plan_id', userPlanId)
  .eq('day_number', currentDay)
  .single()
```

### Mark section complete:
```typescript
const { data } = await supabase
  .from('daily_progress')
  .upsert({
    user_id: userId,
    user_plan_id: userPlanId,
    day_number: dayNumber,
    date: new Date().toISOString().split('T')[0],
    completed_sections: [...existingSections, sectionId],
    is_complete: allSectionsComplete,
  })
```

---

## Design Tokens Reference

Use these Tailwind classes for consistent styling:

| Element | Classes |
|---------|---------|
| Background | `bg-terminal-dark` or `bg-terminal-darker` |
| Primary text | `text-terminal-gray-100` |
| Accent text | `text-terminal-green` |
| Muted text | `text-terminal-gray-400` |
| Success | `text-military-green` or `bg-military-green` |
| Warning/Gold | `text-achievement-gold` |
| Error | `text-alert-red` |
| Border | `border-terminal-gray-500` |
| Pixel font | `font-pixel` (for headers) |
| Mono font | `font-mono` (default) |

---

## Ready to Continue?

When you've completed the prerequisites checklist at the top, let me know and we can start implementing Phase 1 (Authentication System).
