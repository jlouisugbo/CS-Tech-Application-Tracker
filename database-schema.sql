-- SIMPLIFIED DATABASE SCHEMA - Only What We Actually Use
-- Remove all the unnecessary columns and keep it lean!

-- 1. INTERNSHIPS TABLE (Core Data)
-- Remove: last_seen, updated_at (not needed)
-- Keep: Only what's displayed and filtered
CREATE TABLE IF NOT EXISTS public.internships (
    id text PRIMARY KEY,
    company text NOT NULL,
    role text NOT NULL,
    category text,
    locations text[] DEFAULT '{}',
    application_link text,
    date_posted text,
    requires_citizenship boolean DEFAULT false,
    no_sponsorship boolean DEFAULT false,
    is_subsidiary boolean DEFAULT false,
    is_freshman_friendly boolean DEFAULT false,
    is_closed boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 2. USER SAVED INTERNSHIPS (Application Tracking)
-- Remove: interview_rounds, offer_details, timeline_events, rejection_reason (over-engineered)
-- Keep: Essential tracking only
CREATE TABLE IF NOT EXISTS public.user_saved_internships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    internship_id text REFERENCES public.internships(id) ON DELETE CASCADE NOT NULL,
    saved_at timestamptz DEFAULT now(),
    notes text,
    
    -- Simple status tracking
    application_status text DEFAULT 'saved' CHECK (application_status IN (
        'saved', 'interested', 'applied', 'interviewing', 'offer', 'rejected', 'accepted', 'ghosted', 'withdrawn'
    )),
    
    -- Basic tracking
    applied_at timestamptz,
    application_link_clicked_at timestamptz,
    
    -- One save per user per internship
    UNIQUE(user_id, internship_id)
);

-- 3. USERS TABLE (Minimal Profile)
-- Remove: gt_username, gpa, resume_url, github_url, linkedin_url, portfolio_url, 
--          preferred_locations, preferred_categories, graduation_year, major (not used)
-- Keep: Only authentication essentials
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text,
    needs_sponsorship boolean DEFAULT false,
    is_us_citizen boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 4. SCRAPE LOGS (System Monitoring) - Keep this, it's useful
CREATE TABLE IF NOT EXISTS public.scrape_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id text UNIQUE NOT NULL,
    status text NOT NULL CHECK (status IN ('running', 'success', 'error')),
    internships_found integer DEFAULT 0,
    internships_added integer DEFAULT 0,
    internships_updated integer DEFAULT 0,
    error_message text,
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- DROP USER ALERTS TABLE (not implemented in app)
DROP TABLE IF EXISTS public.user_alerts;

-- ESSENTIAL INDEXES ONLY
CREATE INDEX IF NOT EXISTS idx_internships_active ON public.internships(is_active);
CREATE INDEX IF NOT EXISTS idx_internships_company ON public.internships(company);
CREATE INDEX IF NOT EXISTS idx_internships_category ON public.internships(category);
CREATE INDEX IF NOT EXISTS idx_user_saved_internships_user_id ON public.user_saved_internships(user_id);

-- ROW LEVEL SECURITY (Essential for production)
ALTER TABLE public.user_saved_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Simple Policies
DROP POLICY IF EXISTS "Users can manage their own saved internships" ON public.user_saved_internships;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can read active internships" ON public.internships;
DROP POLICY IF EXISTS "Service role can manage internships" ON public.internships;

CREATE POLICY "user_saved_internships_policy" ON public.user_saved_internships FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_policy" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "internships_read_policy" ON public.internships FOR SELECT TO public USING (is_active = true);
CREATE POLICY "internships_service_policy" ON public.internships FOR ALL TO service_role USING (true);

-- REMOVE UNUSED COLUMNS FROM EXISTING TABLES
-- Run these to clean up your current database:

-- From internships table (if they exist)
ALTER TABLE public.internships DROP COLUMN IF EXISTS updated_at;
ALTER TABLE public.internships DROP COLUMN IF EXISTS last_seen;

-- From user_saved_internships table (if they exist)
ALTER TABLE public.user_saved_internships DROP COLUMN IF EXISTS link_verified;
ALTER TABLE public.user_saved_internships DROP COLUMN IF EXISTS interview_rounds;
ALTER TABLE public.user_saved_internships DROP COLUMN IF EXISTS offer_details;
ALTER TABLE public.user_saved_internships DROP COLUMN IF EXISTS timeline_events;
ALTER TABLE public.user_saved_internships DROP COLUMN IF EXISTS rejection_reason;
ALTER TABLE public.user_saved_internships DROP COLUMN IF EXISTS updated_at;
ALTER TABLE public.user_saved_internships DROP COLUMN IF EXISTS created_at;

-- From users table (if they exist)  
ALTER TABLE public.users DROP COLUMN IF EXISTS gt_username;
ALTER TABLE public.users DROP COLUMN IF EXISTS graduation_year;
ALTER TABLE public.users DROP COLUMN IF EXISTS major;
ALTER TABLE public.users DROP COLUMN IF EXISTS gpa;
ALTER TABLE public.users DROP COLUMN IF EXISTS resume_url;
ALTER TABLE public.users DROP COLUMN IF EXISTS github_url;
ALTER TABLE public.users DROP COLUMN IF EXISTS linkedin_url;
ALTER TABLE public.users DROP COLUMN IF EXISTS portfolio_url;
ALTER TABLE public.users DROP COLUMN IF EXISTS preferred_locations;
ALTER TABLE public.users DROP COLUMN IF EXISTS preferred_categories;
ALTER TABLE public.users DROP COLUMN IF EXISTS updated_at;