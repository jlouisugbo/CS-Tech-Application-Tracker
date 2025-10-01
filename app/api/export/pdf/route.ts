import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import type { Internship } from '../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters = {}, savedOnly = false, userId = null } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    let internships: Internship[] = [];
    let title = 'Internship Listings';

    if (savedOnly && userId) {
      // Export saved internships for the user
      const { data, error } = await supabaseAdmin
        .from('user_saved_internships')
        .select(`
          *,
          internships (*)
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      internships = data?.map((saved: any) => ({
        ...saved.internships,
        application_status: saved.application_status,
        notes: saved.notes,
        saved_at: saved.saved_at
      })) || [];
      title = 'My Saved Internships';
    } else {
      // Export all internships with optional filters
      let query = supabaseAdmin
        .from('internships')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (filters.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }
      if (filters.citizenship === 'Required') {
        query = query.eq('requires_citizenship', true);
      }
      if (filters.sponsorship === 'No Sponsorship') {
        query = query.eq('no_sponsorship', true);
      }
      if (filters.freshman_friendly) {
        query = query.eq('is_freshman_friendly', true);
      }

      const { data, error } = await query
        .order('days_ago', { ascending: true })
        .limit(1000); // PDF reasonable limit

      if (error) throw error;
      internships = data || [];

      // Build title based on filters
      const filterParts = [];
      if (filters.category && filters.category !== 'All') {
        filterParts.push(filters.category);
      }
      if (filterParts.length > 0) {
        title = `${filterParts.join(' • ')} Internships`;
      }
    }

    // Return data for client-side PDF generation
    // (jsPDF works better client-side due to browser APIs)
    return NextResponse.json({
      internships,
      title,
      totalCount: internships.length,
      exportDate: new Date().toISOString(),
      filters: savedOnly ? null : filters
    });

  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to prepare PDF export data' },
      { status: 500 }
    );
  }
}
