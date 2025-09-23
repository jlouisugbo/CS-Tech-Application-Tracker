import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    console.log('🗑️ Starting database wipe...');

    const { error: internshipsError, count: internshipsCount } = await supabaseAdmin
      .from('internships')
      .delete()
      .not('id', 'is', null);

    if (internshipsError) {
      console.error('Error wiping internships:', internshipsError);
      return NextResponse.json({ error: 'Failed to wipe internships' }, { status: 500 });
    }

    const { error: logsError, count: logsCount } = await supabaseAdmin
      .from('scrape_logs')
      .delete()
      .not('id', 'is', null);

    if (logsError) {
      console.error('Error wiping scrape_logs:', logsError);
      return NextResponse.json({ error: 'Failed to wipe scrape_logs' }, { status: 500 });
    }

    console.log(`✅ Database wiped successfully`);
    console.log(`   - Deleted ${internshipsCount || 0} internships`);
    console.log(`   - Deleted ${logsCount || 0} scrape logs`);

    return NextResponse.json({
      success: true,
      deleted: {
        internships: internshipsCount || 0,
        scrape_logs: logsCount || 0
      }
    });

  } catch (error) {
    console.error('Wipe API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}