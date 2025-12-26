# Biblical Battle Plans - Implementation Plan

## Project Overview
A web application that gamifies Bible reading through accountability, progress tracking, and group competition with an 8-bit/terminal aesthetic.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase
**Domain:** biblicalbattleplans.com
**Priority Reading Plan:** Professor Grant Horner's System (validates partial completion)

---

## Phase 0: Pre-Setup (Supabase Project Creation)

### 0.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Create new project: "biblical-battle-plans"
3. Select region closest to target users
4. Set a secure database password (save this!)
5. Wait for project provisioning (~2 minutes)

### 0.2 Get API Credentials
From Supabase Dashboard → Settings → API:
- Copy **Project URL** → `VITE_SUPABASE_URL`
- Copy **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 0.3 Configure Authentication
From Supabase Dashboard → Authentication → Providers:
1. **Email:** Enable (default)
   - Enable "Confirm email" for production
   - Disable for development (faster testing)
2. **Google OAuth:**
   - Enable provider
   - Create OAuth credentials in Google Cloud Console
   - Add Client ID and Secret to Supabase

### 0.4 Configure Auth URLs
From Authentication → URL Configuration:
- Site URL: `http://localhost:5173` (dev) / `https://biblicalbattleplans.com` (prod)
- Redirect URLs: Add both localhost and production domain

---

## Phase 1: Project Initialization

### 1.1 Create Vite Project
- Initialize with `npm create vite@latest . -- --template react-ts`
- Configure TypeScript strict mode

### 1.2 Install Dependencies
```bash
# Core
npm install @supabase/supabase-js @tanstack/react-query react-router-dom zustand

# Dev dependencies
npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom
```

### 1.3 Configure Tailwind with 8-Bit Theme
**File:** `tailwind.config.js`
- Custom colors:
  - `military-green`: #4A7C59
  - `terminal-dark`: #0D1117, #1C1C1C
  - `terminal-green`: #33FF33
  - `achievement-gold`: #FFD700
  - `alert-red`: #FF0000
- Custom fonts: JetBrains Mono, Press Start 2P
- Pixel border utilities

### 1.4 Project Structure Setup
```
src/
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── plans/
│   ├── profile/
│   └── ui/
├── hooks/
├── lib/
├── pages/
├── types/
├── App.tsx
├── main.tsx
└── index.css
```

### 1.5 Environment Configuration
**Files:** `.env.example`, `.env.local`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Phase 2: Supabase Setup

### 2.1 Database Migrations
**File:** `supabase/migrations/001_initial_schema.sql`

Tables to create:
1. `profiles` - Extended user data (username, display_name, avatar_url)
2. `reading_plans` - Plan templates with JSONB daily_structure
3. `user_plans` - User's active/completed plans
4. `daily_progress` - Per-day completion tracking with partial completion support
5. `groups` - Group structure (for Phase 2 features)
6. `group_members` - Group membership

### 2.2 Row Level Security Policies
- profiles: Users read/write own data
- reading_plans: All authenticated users can read
- user_plans: Users read/write own plans
- daily_progress: Users read/write own progress
- groups/group_members: Prepared for Phase 2

### 2.3 Seed Data
**File:** `supabase/seed.sql`

Import 3 initial reading plans:

#### Priority: Professor Grant Horner's System (10 Lists)
This plan has 10 independent reading lists that cycle at different rates:
1. Matthew-Acts (89 chapters, cycles every 89 days)
2. Romans-Colossians (78 chapters)
3. 1 Thess-Philemon (47 chapters)
4. Hebrews-Jude (65 chapters)
5. Psalms (150 chapters)
6. Proverbs (31 chapters, cycles monthly)
7. Genesis, Exodus, Leviticus, Numbers, Deut. (187 chapters)
8. Joshua-Song of Solomon (242 chapters)
9. Isaiah-Malachi (250 chapters)
10. John's Writings (46 chapters - Gospel, 1-3 John, Revelation)

**Data Model for Horner's:**
```json
{
  "daily_structure": {
    "type": "cycling_lists",
    "lists": [
      { "id": "list1", "label": "Gospels & Acts", "books": [...], "chapters": 89 },
      { "id": "list2", "label": "Pauline Epistles", "books": [...], "chapters": 78 }
    ]
  }
}
```
- User tracks which chapter they're on per-list
- Each list cycles independently when completed
- Partial completion: user can complete 6/10 lists and still make progress

#### 2. Canonical One-Year Plan
- Genesis to Revelation in order
- ~3-4 chapters per day (1,189 chapters / 365 days)
- Simple single reading per day

#### 3. Discipleship Journal Plan
- 25 readings per month (6 catch-up days built in)
- 4 sections daily: OT, NT, Psalms, Proverbs

---

## Phase 3: Core UI Components

### 3.1 Base Components
**Directory:** `src/components/ui/`

| Component | Description |
|-----------|-------------|
| `Button.tsx` | Pixel-style button with variants (primary, secondary, danger) |
| `Card.tsx` | Terminal-border container |
| `ProgressBar.tsx` | Block-fill progress indicator |
| `StatBlock.tsx` | RPG-style stat display |
| `Input.tsx` | Terminal-style input field |
| `Modal.tsx` | Pixel-bordered modal dialog |
| `Badge.tsx` | Achievement/status badges |
| `Navigation.tsx` | Terminal menu navigation |
| `LoadingSpinner.tsx` | 8-bit loading animation |

### 3.2 Global Styles
**File:** `src/index.css`
- Terminal font imports (Google Fonts)
- Base terminal styling
- Pixel animation keyframes
- Utility classes for 8-bit effects

---

## Phase 4: Authentication System

### 4.1 Supabase Auth Configuration
**File:** `src/lib/supabase.ts`
- Initialize Supabase client
- Export typed client

### 4.2 Auth Context/Store
**File:** `src/hooks/useAuth.ts`
- Zustand store or React Context
- Session management
- User profile loading

### 4.3 Auth Pages
**Files in `src/pages/`:**
- `Login.tsx` - Email/password + Google OAuth
- `Signup.tsx` - Registration with username selection
- `ForgotPassword.tsx` - Password reset flow

### 4.4 Auth Components
**Files in `src/components/auth/`:**
- `AuthForm.tsx` - Shared form component
- `GoogleAuthButton.tsx` - OAuth button
- `ProtectedRoute.tsx` - Route guard wrapper

---

## Phase 5: Reading Plans Feature

### 5.1 Type Definitions
**File:** `src/types/index.ts`
```typescript
interface ReadingPlan {
  id: string
  name: string
  description: string
  duration_days: number
  daily_structure: DayReading[]
}

interface DayReading {
  day: number
  sections: ReadingSection[]
}

interface ReadingSection {
  id: string
  label: string
  passages: string[]
}

interface UserPlan {
  id: string
  plan_id: string
  start_date: string
  current_day: number
  is_completed: boolean
}

interface DailyProgress {
  id: string
  user_plan_id: string
  day_number: number
  date: string
  completed_sections: string[]
  is_complete: boolean
  notes?: string
}
```

### 5.2 Plans Hooks
**File:** `src/hooks/usePlans.ts`
- `useReadingPlans()` - Fetch available plans
- `useUserPlans()` - Fetch user's active plans
- `useStartPlan()` - Start a new plan mutation
- `useDailyProgress()` - Today's progress for a plan
- `useMarkComplete()` - Mark section/day complete

### 5.3 Plans Pages
**Files in `src/pages/`:**
- `Plans.tsx` - Browse available plans
- `PlanDetail.tsx` - View plan details + start
- `ActivePlan.tsx` - Current plan progress view

### 5.4 Plans Components
**Files in `src/components/plans/`:**
- `PlanCard.tsx` - Plan preview card
- `DailyReading.tsx` - Today's reading display
- `ReadingSection.tsx` - Individual section with checkbox
- `PlanProgress.tsx` - Overall plan progress
- `CalendarView.tsx` - Reading history calendar

---

## Phase 6: Dashboard

### 6.1 Dashboard Page
**File:** `src/pages/Dashboard.tsx`
- Active campaigns overview
- Today's readings (all plans)
- Quick stats widget
- Recent activity feed

### 6.2 Dashboard Components
**Files in `src/components/dashboard/`:**
- `ActiveCampaigns.tsx` - List of active plans
- `TodaysReadings.tsx` - Combined daily assignments
- `StatsWidget.tsx` - Streak, chapters, etc.
- `ActivityFeed.tsx` - Recent completions

### 6.3 Stats Hook
**File:** `src/hooks/useStats.ts`
- Calculate total chapters read
- Current streak calculation
- Longest streak tracking
- Plans completed count

---

## Phase 7: Profile & Stats

### 7.1 Profile Page
**File:** `src/pages/Profile.tsx`
- User info display/edit
- Comprehensive stats
- Reading history
- Plan history

### 7.2 Profile Components
**Files in `src/components/profile/`:**
- `ProfileHeader.tsx` - Avatar, name, join date
- `ProfileStats.tsx` - Full stat breakdown
- `ReadingHistory.tsx` - Calendar/list view
- `CompletedPlans.tsx` - Past campaigns

---

## Phase 8: Routing & App Shell

### 8.1 Router Configuration
**File:** `src/App.tsx`
```
Routes:
/ - Dashboard (protected)
/login - Login page
/signup - Signup page
/forgot-password - Password reset
/plans - Browse plans (protected)
/plans/:id - Plan detail (protected)
/campaign/:id - Active plan view (protected)
/profile - User profile (protected)
```

### 8.2 Layout Components
**Files in `src/components/`:**
- `Layout.tsx` - App shell with navigation
- `Header.tsx` - Top bar with user menu
- `MobileNav.tsx` - Bottom navigation for mobile

---

## Phase 9: Deployment

### 9.1 Vercel Configuration
**File:** `vercel.json`
- Environment variables setup
- Build configuration
- Redirects for SPA

### 9.2 Production Checklist
- [ ] Production Supabase project
- [ ] Environment variables in Vercel
- [ ] Custom domain setup (biblicalbattleplans.com)
- [ ] Error tracking (optional: Sentry)

---

## Key Implementation Notes

### Streak Calculation Logic
```
1. Get all daily_progress entries for user
2. Sort by date descending
3. Count consecutive days from today/yesterday
4. Streak breaks if gap > 24 hours
5. Store longest streak on profile
```

### Partial Completion (Horner's Plan)
- Each day has multiple sections (up to 10)
- Track `completed_sections` array
- Day is complete when all sections checked
- Allow any subset completion

### Battle/Campaign Theming
- Use themed language throughout UI
- "Campaign Started" not "Plan Started"
- "Day X Conquered" not "Day X Complete"
- Achievement unlocks with pixel badges

---

## Files to Create (Ordered)

### Project Setup
1. `package.json` (via npm init)
2. `vite.config.ts`
3. `tsconfig.json`
4. `tailwind.config.js`
5. `postcss.config.js`
6. `.env.example`
7. `.gitignore`

### Source Files
8. `src/main.tsx`
9. `src/App.tsx`
10. `src/index.css`
11. `src/lib/supabase.ts`
12. `src/lib/utils.ts`
13. `src/types/index.ts`

### UI Components
14. `src/components/ui/Button.tsx`
15. `src/components/ui/Card.tsx`
16. `src/components/ui/Input.tsx`
17. `src/components/ui/ProgressBar.tsx`
18. `src/components/ui/StatBlock.tsx`
19. `src/components/ui/Modal.tsx`
20. `src/components/ui/Badge.tsx`
21. `src/components/ui/LoadingSpinner.tsx`

### Auth
22. `src/hooks/useAuth.ts`
23. `src/components/auth/ProtectedRoute.tsx`
24. `src/components/auth/AuthForm.tsx`
25. `src/pages/Login.tsx`
26. `src/pages/Signup.tsx`

### Layout
27. `src/components/Layout.tsx`
28. `src/components/Navigation.tsx`

### Plans Feature
29. `src/hooks/usePlans.ts`
30. `src/hooks/useProgress.ts`
31. `src/components/plans/PlanCard.tsx`
32. `src/components/plans/DailyReading.tsx`
33. `src/components/plans/ReadingSection.tsx`
34. `src/components/plans/PlanProgress.tsx`
35. `src/pages/Plans.tsx`
36. `src/pages/PlanDetail.tsx`
37. `src/pages/ActivePlan.tsx`

### Dashboard
38. `src/hooks/useStats.ts`
39. `src/components/dashboard/ActiveCampaigns.tsx`
40. `src/components/dashboard/TodaysReadings.tsx`
41. `src/components/dashboard/StatsWidget.tsx`
42. `src/pages/Dashboard.tsx`

### Profile
43. `src/components/profile/ProfileHeader.tsx`
44. `src/components/profile/ProfileStats.tsx`
45. `src/pages/Profile.tsx`

### Supabase
46. `supabase/migrations/001_initial_schema.sql`
47. `supabase/seed.sql`

---

## Success Criteria for MVP

- [ ] User can sign up and log in
- [ ] User can browse reading plans
- [ ] User can start a reading plan
- [ ] User can mark daily readings complete
- [ ] Partial completion works for multi-section plans (Horner's 10 lists)
- [ ] Streak tracking displays correctly
- [ ] Dashboard shows all active plans
- [ ] 8-bit terminal aesthetic throughout
- [ ] Mobile responsive design
- [ ] Deployed to production
