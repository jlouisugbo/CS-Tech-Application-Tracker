import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get the most recent scrape log
    const { data: recentLogs, error } = await supabaseAdmin
      .from('scrape_logs')
      .select('*')
      .eq('status', 'success')
      .order('completed_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching scrape logs:', error);
      return NextResponse.json({
        lastUpdated: null,
        status: 'unknown',
        internshipsFound: 0,
        nextUpdate: 'Unknown'
      });
    }

    // If no logs found, return default state
    if (!recentLogs || recentLogs.length === 0) {
      return NextResponse.json({
        lastUpdated: null,
        status: 'never_run',
        internshipsFound: 0,
        nextUpdate: 'Unknown'
      });
    }

    const recentLog = recentLogs[0];

    // Calculate next update time (30 minutes from last update)
    const lastUpdated = new Date(recentLog.completed_at);
    const nextUpdate = new Date(lastUpdated.getTime() + 30 * 60 * 1000);
    const now = new Date();
    const minutesUntilNext = Math.max(0, Math.floor((nextUpdate.getTime() - now.getTime()) / (1000 * 60)));

    return NextResponse.json({
      lastUpdated: recentLog.completed_at,
      status: recentLog.status,
      internshipsFound: recentLog.internships_found || 0,
      nextUpdate: minutesUntilNext > 0 ? `${minutesUntilNext} minutes` : 'Soon',
      isRecent: (now.getTime() - lastUpdated.getTime()) < (35 * 60 * 1000) // Less than 35 minutes ago
    });

  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}