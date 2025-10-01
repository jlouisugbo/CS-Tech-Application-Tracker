# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GT Technology Internship Portal** - A full-stack web application for Georgia Tech students to discover, track, and apply to 623+ Summer 2026 technology internships. Built for the GT Office of Student Achievement.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth (email/password)
- **Scraping**: Python with requests library
- **Deployment**: Vercel with serverless functions and cron jobs
- **Monitoring**: Sentry for error tracking

## Common Commands

### Development
```bash
npm run dev          # Start Next.js dev server on localhost:3000
npm run build        # Build production bundle
npm start            # Start production server
npm run lint         # Run ESLint
```

### Python Scraper
```bash
cd scraper
pip install -r requirements.txt  # Install: requests, supabase, schedule
python internship_scraper.py     # Run scraper manually
```

### Database Operations
- All schema changes must be done in Supabase SQL Editor
- Run `database_indexes.sql` for index optimization after schema changes

### API Testing
```bash
# Manual scraper trigger (requires CRON_SECRET)
curl -X POST http://localhost:3000/api/scrape \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Architecture

### Data Flow
1. **Python Scraper** (`scraper/internship_scraper.py`) fetches from SimplifyJobs GitHub repo
2. **Parser** (`app/lib/scraper-api.ts`) processes HTML tables with emoji detection
3. **Supabase** stores internships with bulk upsert operations
4. **API Route** (`app/api/internships/route.ts`) serves filtered data to frontend
5. **React Query** (`app/lib/hooks.ts`) manages client-side state and caching

### Scraping System
- **Source**: GitHub SimplifyJobs Summer2026-Internships (dev branch)
- **Format**: HTML tables with embedded emojis for metadata
- **Schedule**: Runs every 30 minutes via Vercel cron (`vercel.json`)
- **Detection Logic**:
  - 🛂 No Sponsorship detection
  - 🇺🇸 U.S. Citizenship requirement detection
  - 🔒 Closed application detection (HTTP checks + content parsing)
  - 🔥 FAANG company detection
  - Freshman-friendly logic based on graduation year requirements
- **Key Functions** in `scraper-api.ts`:
  - `parseSimplifyJobsMarkdown()`: Parses HTML table rows between `<tbody>` tags
  - `detectRequirements()`: Extracts emoji-based metadata
  - `checkApplicationLinks()`: Validates links and detects closed positions
  - `categorizeRole()`: Auto-categorizes into 25+ categories

### Authentication Flow
- Client: `supabaseClient.ts` (anon key, persists sessions in localStorage)
- Server: `supabaseAdmin.ts` (service role key for RLS bypass)
- Auth utilities: `app/lib/auth-utils.ts` has session refresh logic
- Protected routes: Dashboard requires authenticated user via `useAuth()` hook
- **Common Issue**: Session expiry - use `refreshSessionIfNeeded()` before sensitive operations

### Database Schema (Supabase)
Key tables:
- **`internships`**: Main data (company, role, category, locations[], metadata)
  - Unique ID format: `{company}_{role}_{location}_hash`
  - `is_active` flag marks stale positions
  - `last_seen` timestamp tracks scraper runs
- **`users`**: GT student profiles (username, grad_year, major, GPA)
- **`user_saved_internships`**: Application tracking with status workflow
  - Statuses: saved → interested → applied → interviewing → offer → accepted
  - Includes `notes`, `interview_rounds[]`, `application_date`, `link_clicked_at`
- **`scrape_logs`**: Audit trail for automated runs

**Important**: All user data queries MUST use RLS-compliant clients. Use `supabaseAdmin` only in API routes.

### Component Architecture
- **Atomic Design Pattern**: Small, reusable components
- **Key Components**:
  - `CompactFilterBar.tsx`: Advanced filtering with searchable dropdowns
  - `CompactInternshipCard.tsx`: Main internship display with save/unsave
  - `ApplicationTracker.tsx`: Full application workflow management
  - `SearchWithAutocomplete.tsx`: Real-time search with debouncing
  - `Header.tsx`: Navigation with auth state

### State Management
- **React Query** for server state (internships, saved items)
- **Local State** (useState) for UI state (filters, modals, tabs)
- **Custom Hooks** (`app/lib/hooks.ts`):
  - `useInternships(filters)`: Fetches and filters internships
  - `useSavedInternships()`: Manages user's saved/tracked internships
  - `useAuth()`: Session management with error handling

### Environment Variables (Required)
```
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Public anon key (client-side)
SUPABASE_SERVICE_ROLE_KEY=        # Service role key (server-side only)
CRON_SECRET=                       # Auth for /api/scrape endpoint
```

## Development Guidelines

### API Routes
- All routes in `app/api/*/route.ts` must use Next.js 14 App Router format
- Use `supabaseAdmin` for database operations (bypasses RLS)
- Always validate `CRON_SECRET` for scraper endpoints
- Error responses use `app/lib/logger.ts` utilities
- **Timeout**: Scraper route has 300s max duration (set in `vercel.json`)

### TypeScript Types
- All types defined in `app/types.ts`
- Key types: `Internship`, `User`, `SavedInternship`, `FilterState`
- Always use proper typing for Supabase queries (no `any` except for scraper parsing)

### Styling
- **Tailwind CSS** for all styling (no CSS modules)
- Mobile-first responsive design
- Touch-friendly UI (min 44px tap targets)
- Icons from `lucide-react`

### Scraper Modifications
- Parser lives in **both** Python (`scraper/`) AND TypeScript (`app/lib/scraper-api.ts`)
- **Primary parser**: TypeScript in `scraper-api.ts` (used by Vercel cron)
- **Backup**: Python scripts for local testing
- When updating parsing logic, modify `parseSimplifyJobsMarkdown()` function
- Test emoji detection thoroughly - Unicode handling varies

### Database Queries
- Use `.select('*')` sparingly - specify columns for performance
- Apply indexes via `database_indexes.sql` for filtered columns
- Batch operations: Use `.upsert()` with `onConflict` for bulk updates
- RLS policies: Authenticated users can only access their own `user_saved_internships`

### Error Handling
- Frontend: Show user-friendly messages, log details to console
- Backend: Use `logger.ts` utilities for structured logging
- Sentry integration captures production errors automatically

## Special Considerations

### SimplifyJobs Data Format
- HTML table format (not Markdown) with `<tbody>` wrapping
- Subsidiary companies use `↳` symbol - inherit parent company name
- Location format: `<details>` tags with `<br>` separated cities
- Application links may be Simplify redirects - extract direct URLs

### Freshman-Friendly Detection
Complex logic in `detectFreshmanFriendly()` checks for graduation year requirements:
- Current freshmen graduate ≥2029
- Filters out "by 2028", "before 2029", "Rising Junior/Senior only"
- Defaults to freshman-friendly if no restrictions found

### Application Link Checking
`checkApplicationLinks()` function:
- Validates HTTP status codes (404, 410, 503, etc.)
- Parses page content for closure indicators
- Batched requests with delays to avoid rate limiting
- Times out at 8 seconds per request

### Performance Optimization
- Internships API uses caching headers
- React Query caches for 5 minutes
- Filtering happens client-side after initial fetch
- Indexes on: `category`, `is_active`, `is_closed`, `company`, `last_seen`

## Deployment

### Vercel Configuration
- Automatic deployments from `main` branch
- Cron job defined in `vercel.json`: `*/30 * * * *` (every 30 min)
- Serverless function timeout: 300s for scraper
- Region: `iad1` (us-east-1)

### GitHub Actions
- Scraper workflow in `.github/workflows/scraper.yml` (currently disabled)
- Use Vercel cron instead for production

## Known Issues & Gotchas

1. **Session Expiry**: Supabase sessions expire after 1 hour. Frontend handles refresh, but manual operations may need `refreshSessionIfNeeded()`.

2. **RLS Bypass**: Never use `supabaseAdmin` client in frontend code. Only use in API routes.

3. **Emoji Encoding**: SimplifyJobs uses Unicode emojis. Check both raw emoji and encoded forms (`\ud83c\uddfa\ud83c\uddf8`).

4. **Link Validation**: Some companies block automated requests. `checkApplicationLinks()` may have false positives.

5. **Duplicate Detection**: ID generation uses `company_role_location` hash. Same role in multiple locations creates separate entries.

6. **Category Ambiguity**: Role categorization uses keyword matching. Manual overrides may be needed.

## Testing

- **Manual Scraper Test**: Run `npm run scrape` (if script added) or use curl to hit API endpoint
- **Auth Testing**: Use `AuthDebugger.tsx` component during development
- **Database Testing**: Query Supabase directly via SQL Editor

## Security

- Never commit `.env.local` or expose service role key
- CRON_SECRET must be set for production scraper endpoint
- RLS policies enforced on all user data tables
- Input sanitization in all API routes
