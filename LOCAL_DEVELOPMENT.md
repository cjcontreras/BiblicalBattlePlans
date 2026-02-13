# Local Development with Supabase

This guide explains how to run a local Supabase instance for development and testing.

## Why Local Development?

| Production (Cloud) | Local (Docker) |
|-------------------|----------------|
| Real user data | Test data only |
| Changes affect everyone | Only affects you |
| Risky to test migrations | Safe to experiment |
| Can't easily reset | Reset anytime |

**Use local for:** Testing migrations, developing new features, debugging

**Use production for:** Final deployment only

---

## Prerequisites

1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
2. **Supabase CLI** - Install via Homebrew:
   ```bash
   brew install supabase/tap/supabase
   ```

---

## Quick Start

### 1. Start Local Supabase
```bash
npm run db:start
```

This starts Docker containers for:
- **PostgreSQL** database (port 54322)
- **Supabase API** (port 54321)
- **Supabase Studio** UI (port 54323)
- **Auth, Storage, Realtime** services

First run downloads images (~2-3 min). Subsequent starts are fast (~10 sec).

### 2. Switch to Local Environment

Create `.env.local` with local credentials:
```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

> The anon key above is the **standard local development key** - it's safe to commit.

### 3. Start the App
```bash
npm run dev
```

Your app now talks to local Supabase!

---

## Available Commands

| Command | What it does |
|---------|--------------|
| `npm run db:start` | Start local Supabase (Docker) |
| `npm run db:stop` | Stop local Supabase |
| `npm run db:reset` | Reset DB: runs all migrations + seed data |
| `npm run db:migrate` | Run pending migrations only |
| `npm run db:migrate:new <name>` | Create a new migration file |
| `npm run db:status` | Show running services & ports |
| `npm run db:studio` | Open Supabase Studio in browser |
| `npm run db:types` | Regenerate TypeScript types from local DB |

---

## Common Workflows

### Testing a New Migration

1. Create the migration file:
   ```bash
   npm run db:migrate:new add_new_feature
   ```

2. Edit the file in `supabase/migrations/`

3. Apply it locally:
   ```bash
   npm run db:reset
   ```

4. Test your app against local DB

5. When ready, push migration to production via Supabase Dashboard or CLI

### Resetting to Clean State

```bash
npm run db:reset
```

This:
- Drops all tables
- Runs all migrations (001 through latest)
- Runs `seed.sql` to populate reading plans

### Viewing Data in Studio

```bash
npm run db:studio
```

Opens Supabase Studio at http://127.0.0.1:54323 where you can:
- Browse tables
- Run SQL queries
- View auth users
- Check logs

---

## Switching Between Local and Production

### To use LOCAL:
```bash
# .env.local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### To use PRODUCTION:
```bash
# .env.local
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-production-anon-key>
```

> Restart dev server (`npm run dev`) after changing env vars.

---

## Pulling Production Schema (Optional)

If production has changes not in your migrations, you can pull them:

```bash
# Link to your project (one-time setup)
supabase link --project-ref <your-project-ref>

# Pull remote schema as a new migration
supabase db pull
```

---

## Troubleshooting

### "Cannot connect to Docker"
- Make sure Docker Desktop is running
- Try: `docker ps` to verify Docker works

### "Port already in use"
- Another service is using the port
- Stop other Supabase instances: `npm run db:stop`
- Or check what's using the port: `lsof -i :54321`

### "Migration failed"
- Check the SQL syntax in your migration file
- Run `npm run db:reset` to start fresh
- Check Studio logs for details

### Slow first start
- First run downloads ~1GB of Docker images
- Subsequent starts are fast (~10 seconds)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Your Machine                     │
│                                                  │
│  ┌──────────────┐      ┌──────────────────────┐ │
│  │  Vite Dev    │      │   Docker Containers  │ │
│  │  Server      │      │                      │ │
│  │              │ ───▶ │  ┌────────────────┐  │ │
│  │  :5173       │      │  │ Supabase API   │  │ │
│  └──────────────┘      │  │ :54321         │  │ │
│                        │  └────────────────┘  │ │
│                        │  ┌────────────────┐  │ │
│                        │  │ PostgreSQL     │  │ │
│                        │  │ :54322         │  │ │
│                        │  └────────────────┘  │ │
│                        │  ┌────────────────┐  │ │
│                        │  │ Studio UI      │  │ │
│                        │  │ :54323         │  │ │
│                        │  └────────────────┘  │ │
│                        └──────────────────────┘ │
└─────────────────────────────────────────────────┘
```
