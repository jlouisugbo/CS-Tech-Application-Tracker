-- CRITICAL DATABASE INDEXES FOR INTERNSHIP PLATFORM
-- These indexes optimize the most common query patterns for 2000+ records
-- Execute these in your Supabase SQL editor

-- ===============================================
-- 1. PRIMARY QUERY OPTIMIZATION
-- ===============================================

-- Main query: WHERE is_active = true ORDER BY days_ago ASC
-- This is the most critical index - covers the base API query
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_internships_active_days_ago
ON internships (is_active, days_ago ASC)
WHERE is_active = true;

-- ===============================================
-- 2. CATEGORY FILTERING (Exact Match)
-- ===============================================

-- Supports: category = 'Software Engineering'
-- Combined with active status for efficiency
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_internships_active_category
ON internships (is_active, category)
WHERE is_active = true;

-- ===============================================
-- 3. COMPANY SEARCH OPTIMIZATION
-- ===============================================

-- Case-insensitive company search using trigram index
-- Supports: company ILIKE '%google%' type searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_internships_company_trgm
ON internships USING gin (company gin_trgm_ops)
WHERE is_active = true;

-- Additional index for exact company matches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_internships_active_company
ON internships (is_active, company)
WHERE is_active = true;

-- ===============================================
-- 4. LOCATION SEARCH OPTIMIZATION
-- ===============================================

-- GIN index for array operations on locations
-- Supports: locations && ARRAY['San Francisco'] type searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_internships_locations_gin
ON internships USING gin (locations)
WHERE is_active = true;

-- ===============================================
-- 5. BOOLEAN FILTER COMBINATIONS
-- ===============================================

-- Multi-column index for common boolean combinations
-- Covers: requires_citizenship, no_sponsorship, is_freshman_friendly
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_internships_active_boolean_filters
ON internships (is_active, requires_citizenship, no_sponsorship, is_freshman_friendly)
WHERE is_active = true;

-- ===============================================
-- 6. COMPOSITE INDEX FOR COMMON COMBINATIONS
-- ===============================================

-- Most common filter combination: active + category + sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_internships_active_category_days
ON internships (is_active, category, days_ago ASC)
WHERE is_active = true;

-- ===============================================
-- 7. USER SAVED INTERNSHIPS OPTIMIZATION
-- ===============================================

-- Optimize saved internships queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_saved_internships_user_id
ON user_saved_internships (user_id, saved_at DESC);

-- Optimize is_saved checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_saved_internships_internship_id
ON user_saved_internships (internship_id, user_id);

-- ===============================================
-- 8. STATS QUERIES OPTIMIZATION
-- ===============================================

-- Optimize category count queries (used in useInternshipStats)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_internships_active_category_count
ON internships (category)
WHERE is_active = true;

-- Optimize freshman-friendly counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_internships_active_freshman
ON internships (is_active, is_freshman_friendly)
WHERE is_active = true AND is_freshman_friendly = true;

-- ===============================================
-- ADDITIONAL PERFORMANCE NOTES:
-- ===============================================

-- 1. CONCURRENTLY keyword prevents table locks during index creation
-- 2. Partial indexes (WHERE is_active = true) are smaller and faster
-- 3. GIN indexes are optimal for array and text search operations
-- 4. Trigram indexes enable fast ILIKE pattern matching
-- 5. Composite indexes support multiple filter combinations efficiently

-- ===============================================
-- MONITORING QUERY (Check index usage):
-- ===============================================

-- Run this to monitor index effectiveness:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE tablename = 'internships'
-- ORDER BY idx_scan DESC;