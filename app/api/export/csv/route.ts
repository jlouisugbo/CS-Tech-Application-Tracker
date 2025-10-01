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
        .limit(5000);

      if (error) throw error;
      internships = data || [];
    }

    // Generate CSV content
    const headers = savedOnly
      ? ['Company', 'Role', 'Category', 'Locations', 'Application Link', 'Date Posted', 'Status', 'Notes', 'Saved At']
      : ['Company', 'Role', 'Category', 'Locations', 'Application Link', 'Date Posted', 'Citizenship Required', 'No Sponsorship', 'Freshman Friendly'];

    const csvRows = [headers.join(',')];

    internships.forEach((internship: any) => {
      const locations = Array.isArray(internship.locations)
        ? internship.locations.join(' | ')
        : internship.locations || '';

      const row = savedOnly
        ? [
            escapeCsvField(internship.company),
            escapeCsvField(internship.role),
            escapeCsvField(internship.category),
            escapeCsvField(locations),
            escapeCsvField(internship.application_link || ''),
            escapeCsvField(internship.date_posted || ''),
            escapeCsvField(internship.application_status || 'saved'),
            escapeCsvField(internship.notes || ''),
            escapeCsvField(internship.saved_at || '')
          ]
        : [
            escapeCsvField(internship.company),
            escapeCsvField(internship.role),
            escapeCsvField(internship.category),
            escapeCsvField(locations),
            escapeCsvField(internship.application_link || ''),
            escapeCsvField(internship.date_posted || ''),
            internship.requires_citizenship ? 'Yes' : 'No',
            internship.no_sponsorship ? 'Yes' : 'No',
            internship.is_freshman_friendly ? 'Yes' : 'No'
          ];

      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Return CSV with proper headers
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="internships_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV export' },
      { status: 500 }
    );
  }
}

// Helper function to escape CSV fields
function escapeCsvField(field: string): string {
  if (!field) return '';
  const stringField = String(field);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}
