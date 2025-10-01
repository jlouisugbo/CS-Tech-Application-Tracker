import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { logger } from '../../../lib/logger';

// Initialize Resend with API key or dummy key for build
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = logger.request('POST', '/api/notifications/weekly');

  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logger.warn('Unauthorized cron attempt', { requestId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Starting weekly digest job', { requestId });

    if (!supabaseAdmin) {
      logger.error('Supabase admin not available', {
        error: new Error('Supabase admin client not initialized'),
        requestId
      });
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Get all users with email digest enabled
    const { data: preferences, error: prefsError } = await supabaseAdmin
      .from('user_notification_preferences')
      .select(`
        *,
        users:user_id (email)
      `)
      .eq('email_digest_enabled', true)
      .eq('digest_frequency', 'weekly');

    if (prefsError) {
      logger.error('Failed to fetch notification preferences', {
        error: prefsError,
        requestId
      });
      throw prefsError;
    }

    logger.info(`Found ${preferences?.length || 0} users to notify`, { requestId });

    // Get internships from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const emailsSent = [];
    const errors = [];

    for (const pref of preferences || []) {
      try {
        // Build query based on user preferences
        let query = supabaseAdmin
          .from('internships')
          .select('*')
          .eq('is_active', true)
          .gte('created_at', sevenDaysAgo.toISOString());

        // Apply user's preferred filters
        if (pref.preferred_categories && pref.preferred_categories.length > 0) {
          query = query.in('category', pref.preferred_categories);
        }
        if (pref.requires_citizenship !== null) {
          query = query.eq('requires_citizenship', pref.requires_citizenship);
        }
        if (pref.no_sponsorship !== null) {
          query = query.eq('no_sponsorship', pref.no_sponsorship);
        }
        if (pref.freshman_friendly_only) {
          query = query.eq('is_freshman_friendly', true);
        }

        const { data: internships, error: internshipsError } = await query
          .order('days_ago', { ascending: true })
          .limit(50);

        if (internshipsError) throw internshipsError;

        // Skip if no new internships match preferences
        if (!internships || internships.length === 0) {
          logger.info(`No new internships for user ${pref.user_id}`, { requestId });
          continue;
        }

        // Filter by location if preferences set (client-side for array matching)
        let filteredInternships = internships;
        if (pref.preferred_locations && pref.preferred_locations.length > 0) {
          filteredInternships = internships.filter(int =>
            int.locations.some((loc: string) =>
              pref.preferred_locations.some((prefLoc: string) =>
                loc.toLowerCase().includes(prefLoc.toLowerCase())
              )
            )
          );
        }

        if (filteredInternships.length === 0) continue;

        // Send email using Resend
        const { data: emailResult, error: emailError } = await resend.emails.send({
          from: 'GT Internships <onboarding@resend.dev>', // Using Resend's test domain
          to: [(pref as any).users.email],
          subject: `${filteredInternships.length} New Internship${filteredInternships.length > 1 ? 's' : ''} This Week`,
          html: generateEmailHtml(filteredInternships, pref)
        });

        if (emailError) throw emailError;

        // Update last_digest_sent_at
        await supabaseAdmin
          .from('user_notification_preferences')
          .update({ last_digest_sent_at: new Date().toISOString() })
          .eq('user_id', pref.user_id);

        emailsSent.push({
          userId: pref.user_id,
          email: (pref as any).users.email,
          internshipCount: filteredInternships.length,
          emailId: emailResult?.id
        });

        logger.info(`Sent digest to ${(pref as any).users.email}`, {
          requestId,
          metadata: { internshipCount: filteredInternships.length }
        });

      } catch (error) {
        logger.error(`Failed to send digest to user ${pref.user_id}`, {
          error,
          requestId
        });
        errors.push({
          userId: pref.user_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const duration = Date.now() - startTime;
    logger.info('Weekly digest job completed', {
      requestId,
      metadata: {
        duration,
        emailsSent: emailsSent.length,
        errors: errors.length
      }
    });

    return NextResponse.json({
      success: true,
      emailsSent: emailsSent.length,
      errors: errors.length,
      duration,
      details: { emailsSent, errors }
    });

  } catch (error) {
    logger.error('Weekly digest job failed', { error, requestId });
    return NextResponse.json(
      { error: 'Failed to send weekly digests' },
      { status: 500 }
    );
  }
}

// Generate HTML email content
function generateEmailHtml(internships: any[], preferences: any): string {
  const categoryText = preferences.preferred_categories?.length > 0
    ? preferences.preferred_categories.join(', ')
    : 'all categories';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #FCD34D, #F59E0B); padding: 20px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 20px; }
          .internship { border-left: 4px solid #F59E0B; padding: 15px; margin: 15px 0; background: #f9fafb; }
          .internship h3 { margin: 0 0 10px 0; color: #1f2937; }
          .internship .company { font-weight: bold; color: #F59E0B; }
          .internship .details { font-size: 14px; color: #6b7280; margin: 5px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #F59E0B; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Your Weekly Internship Digest</h1>
          <p style="color: white; margin: 10px 0 0 0;">${internships.length} new ${categoryText} internship${internships.length > 1 ? 's' : ''} this week</p>
        </div>

        <div class="content">
          <p>Hi there,</p>
          <p>Here are the latest internship opportunities matching your preferences:</p>

          ${internships.slice(0, 10).map(int => `
            <div class="internship">
              <h3><span class="company">${int.company}</span> - ${int.role}</h3>
              <div class="details">📍 ${int.locations.join(', ')}</div>
              <div class="details">🏷️ ${int.category}</div>
              ${int.is_freshman_friendly ? '<div class="details">✨ Freshman Friendly</div>' : ''}
              ${int.application_link ? `<a href="${int.application_link}" class="button">Apply Now</a>` : ''}
            </div>
          `).join('')}

          ${internships.length > 10 ? `<p style="text-align: center; color: #6b7280;">... and ${internships.length - 10} more!</p>` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.vercel.app'}" class="button">View All Internships</a>
          </div>
        </div>

        <div class="footer">
          <p>You're receiving this email because you opted in to weekly internship digests.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #F59E0B;">Manage notification preferences</a></p>
        </div>
      </body>
    </html>
  `;
}
