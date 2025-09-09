// Database types matching Supabase schema
export interface Internship {
  id: string;
  company: string;
  role: string;
  category: string;
  locations: string[];
  application_link: string | null;
  date_posted: string;
  requires_citizenship: boolean;
  no_sponsorship: boolean;
  is_subsidiary: boolean;
  is_active: boolean;
  is_freshman_friendly?: boolean; // New field for freshman designation
  is_closed?: boolean; // New field for locked/closed internships
  last_seen: string;
  created_at: string;
}

export interface FilterState {
  category: string;
  location: string;
  citizenship: string;
  sponsorship: string;
  freshman_friendly: boolean;
  company: string;
  date_posted: string;
  sort_by: 'date_newest' | 'date_oldest' | 'company_az' | 'company_za';
  company_sort_by: 'most_positions' | 'alphabetical' | 'most_open' | 'most_freshman_friendly';
  view_mode: 'list' | 'grid' | 'grouped';
  group_expanded: Record<string, boolean>; // Track which companies are expanded
}

export interface CompanyGroup {
  company: string;
  internships: Internship[];
  totalCount: number;
  freshmanFriendlyCount: number;
  openCount: number; // Non-closed internships
  isExpanded: boolean;
}

export interface User {
  id: string;
  email: string;
  gt_username?: string;
  full_name?: string;
  graduation_year?: number;
  major?: string;
  gpa?: number;
  resume_url?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  preferred_locations?: string[];
  preferred_categories?: string[];
  needs_sponsorship: boolean;
  is_us_citizen: boolean;
  created_at: string;
}

export interface SavedInternship {
  id: string;
  user_id: string;
  internship_id: string;
  saved_at: string;
  notes?: string;
  application_status: 'saved' | 'interested' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'accepted' | 'ghosted' | 'withdrawn';
  // Enhanced tracking fields
  applied_at?: string;
  application_link_clicked_at?: string;
  link_verified?: boolean;
  interview_rounds?: InterviewRound[];
  offer_details?: OfferDetails;
  rejection_reason?: string;
  timeline_events?: TimelineEvent[];
}

export interface InterviewRound {
  id: string;
  round_number: number;
  round_type: 'phone' | 'technical' | 'behavioral' | 'onsite' | 'final' | 'other';
  scheduled_at?: string;
  completed_at?: string;
  result: 'pending' | 'passed' | 'failed' | 'cancelled';
  notes?: string;
  interviewer_name?: string;
}

export interface OfferDetails {
  salary?: number;
  location?: string;
  start_date?: string;
  deadline?: string;
  benefits?: string;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  event_type: 'saved' | 'applied' | 'interview_scheduled' | 'interview_completed' | 'offer_received' | 'rejected' | 'withdrew' | 'link_clicked';
  event_date: string;
  description: string;
  metadata?: Record<string, any>;
}

// Categories for internships
export const INTERNSHIP_CATEGORIES = [
  'Software Engineering',
  'Full Stack',
  'Front End', 
  'Back End',
  'AI/ML',
  'Data Science',
  'Data Engineering',
  'DevOps',
  'Mobile',
  'Security',
  'Product Management',
  'Quant/Trading',
  'Research',
  'Business Analyst',
  'Data Analyst',
  'Hardware Engineering',
  'Systems Engineering',
  'Cloud Engineering',
  'Site Reliability Engineering',
  'Information Technology',
  'Quality Assurance',
  'UX/UI Design',
  'Sales Engineering',
  'Technical Program Management',
  'Other'
] as const;