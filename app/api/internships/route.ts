import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Fetch all active internships using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('internships')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching internships:', error);
      return NextResponse.json({ error: 'Failed to fetch internships' }, { status: 500 });
    }

    console.log(`API: Returning ${data?.length || 0} internships`);
    return NextResponse.json({ internships: data || [] });

  } catch (error) {
    console.error('Internships API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}