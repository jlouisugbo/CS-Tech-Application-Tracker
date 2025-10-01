// Server-side scraper logic for API routes
import { supabaseAdmin } from './supabaseAdmin';

// Location alias map for normalization and deduplication
const LOCATION_ALIASES: Record<string, string> = {
  // New York variations
  'nyc': 'New York, NY',
  'new york': 'New York, NY',
  'new york city': 'New York, NY',
  'new york, ny': 'New York, NY',
  'new york city, ny': 'New York, NY',
  'manhattan': 'New York, NY',
  'manhattan, ny': 'New York, NY',
  'brooklyn': 'New York, NY',
  'brooklyn, ny': 'New York, NY',

  // San Francisco variations
  'sf': 'San Francisco, CA',
  'san francisco': 'San Francisco, CA',
  'san francisco, ca': 'San Francisco, CA',
  'san fran': 'San Francisco, CA',

  // Bay Area
  'bay area': 'San Francisco Bay Area, CA',
  'silicon valley': 'San Francisco Bay Area, CA',
  'palo alto': 'Palo Alto, CA',
  'palo alto, ca': 'Palo Alto, CA',
  'mountain view': 'Mountain View, CA',
  'mountain view, ca': 'Mountain View, CA',
  'sunnyvale': 'Sunnyvale, CA',
  'sunnyvale, ca': 'Sunnyvale, CA',
  'san jose': 'San Jose, CA',
  'san jose, ca': 'San Jose, CA',
  'cupertino': 'Cupertino, CA',
  'cupertino, ca': 'Cupertino, CA',
  'menlo park': 'Menlo Park, CA',
  'menlo park, ca': 'Menlo Park, CA',
  'redwood city': 'Redwood City, CA',
  'redwood city, ca': 'Redwood City, CA',

  // Los Angeles variations
  'la': 'Los Angeles, CA',
  'los angeles': 'Los Angeles, CA',
  'los angeles, ca': 'Los Angeles, CA',

  // Seattle variations
  'seattle': 'Seattle, WA',
  'seattle, wa': 'Seattle, WA',
  'bellevue': 'Bellevue, WA',
  'bellevue, wa': 'Bellevue, WA',
  'redmond': 'Redmond, WA',
  'redmond, wa': 'Redmond, WA',

  // Boston variations
  'boston': 'Boston, MA',
  'boston, ma': 'Boston, MA',
  'cambridge': 'Cambridge, MA',
  'cambridge, ma': 'Cambridge, MA',

  // Chicago variations
  'chicago': 'Chicago, IL',
  'chicago, il': 'Chicago, IL',

  // Austin variations
  'austin': 'Austin, TX',
  'austin, tx': 'Austin, TX',

  // Dallas variations
  'dallas': 'Dallas, TX',
  'dallas, tx': 'Dallas, TX',

  // Houston variations
  'houston': 'Houston, TX',
  'houston, tx': 'Houston, TX',

  // Washington DC variations
  'dc': 'Washington, DC',
  'washington dc': 'Washington, DC',
  'washington, dc': 'Washington, DC',
  'washington d.c.': 'Washington, DC',
  'arlington': 'Arlington, VA',
  'arlington, va': 'Arlington, VA',

  // Atlanta variations
  'atlanta': 'Atlanta, GA',
  'atlanta, ga': 'Atlanta, GA',

  // Denver variations
  'denver': 'Denver, CO',
  'denver, co': 'Denver, CO',

  // Remote variations
  'remote': 'Remote',
  'remote in usa': 'Remote',
  'remote us': 'Remote',
  'remote usa': 'Remote',
  'work from home': 'Remote',
  'wfh': 'Remote',

  // International
  'london': 'London, UK',
  'london, uk': 'London, UK',
  'toronto': 'Toronto, ON',
  'toronto, on': 'Toronto, ON',
  'vancouver': 'Vancouver, BC',
  'vancouver, bc': 'Vancouver, BC',
};

/**
 * Normalize location strings to prevent duplicates and enable smart matching
 * Examples: "NYC" → "New York, NY", "SF" → "San Francisco, CA"
 */
function normalizeLocation(location: string): string {
  if (!location) return 'Remote';

  const normalized = location.toLowerCase().trim();

  // Check if we have an exact alias match
  if (LOCATION_ALIASES[normalized]) {
    return LOCATION_ALIASES[normalized];
  }

  // If no alias found, return original with proper trim
  return location.trim();
}

interface ScraperResult {
  success: boolean;
  internshipsFound?: number;
  updated?: number;
  added?: number;
  error?: string;
  sources?: SourceResult[];
}

interface SourceResult {
  name: string;
  success: boolean;
  internshipsFound: number;
  error?: string;
}

interface InternshipSource {
  name: string;
  url: string;
  priority: number;
  parser: (content: string) => any[];
}

// Define our sources - using only SimplifyJobs as the authoritative source
const INTERNSHIP_SOURCES: InternshipSource[] = [
  {
    name: 'simplify-jobs',
    url: 'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/refs/heads/dev/README.md',
    priority: 1,
    parser: parseSimplifyJobsMarkdown
  }
];

export async function runScraperAPI(): Promise<ScraperResult> {
  const startTime = new Date();
  const runId = `multi_${Date.now()}`;
  const sources: SourceResult[] = [];
  let allInternships: any[] = [];
  
  try {
    console.log('🔄 Starting multi-source internship scraping...');
    
    // Fetch from all sources in parallel
    const sourceResults = await Promise.allSettled(
      INTERNSHIP_SOURCES.map(async (source) => {
        console.log(`📡 Fetching from ${source.name}...`);
        
        try {
          const response = await fetch(source.url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const content = await response.text();
          console.log(`📖 Parsing content from ${source.name}...`);
          
          const internships = source.parser(content);
          console.log(`✅ Found ${internships.length} internships from ${source.name}`);
          
          // Add source metadata to each internship
          const sourceInternships = internships.map((internship: any, index: number) => ({
            ...internship,
            source: source.name,
            source_priority: source.priority,
            source_index: index
          }));
          
          sources.push({
            name: source.name,
            success: true,
            internshipsFound: internships.length
          });
          
          return sourceInternships;
          
        } catch (error) {
          console.error(`❌ Error fetching ${source.name}:`, error);
          sources.push({
            name: source.name,
            success: false,
            internshipsFound: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          return [];
        }
      })
    );
    
    // Combine successful results
    sourceResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        allInternships.push(...result.value);
      }
    });
    
    if (allInternships.length === 0) {
      throw new Error('No internships found from any source');
    }
    
    console.log(`📊 Total internships from SimplifyJobs: ${allInternships.length}`);
    
    // Simple exact duplicate removal - only remove if company + role + link are identical
    const deduplicatedInternships = allInternships.filter((internship, index, self) => {
      return self.findIndex(i => 
        i.company === internship.company && 
        i.role === internship.role &&
        i.application_link === internship.application_link
      ) === index;
    });
    console.log(`📊 After removing exact duplicates: ${deduplicatedInternships.length}`);
    
    // Check application links for closed internships
    console.log('🔗 Checking application links for closed internships...');
    const checkedInternships = await checkApplicationLinks(deduplicatedInternships);

    // Use Supabase admin client for server-side operations
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    // Fetch existing internships to determine what to update vs insert
    console.log('📥 Fetching existing internships...');
    const { data: existingInternships, error: fetchError } = await supabaseAdmin
      .from('internships')
      .select('id, company, role, locations, created_at');
    
    if (fetchError) {
      console.warn('Warning: Could not fetch existing data:', fetchError.message);
    }
    
    // Create lookup map: unique_key -> existing record
    const existingMap = new Map<string, any>();
    const existingIdMap = new Map<string, any>();
    (existingInternships || []).forEach(record => {
      const uniqueKey = generateUniqueKey(record.company, record.role, record.locations?.[0]);
      existingMap.set(uniqueKey, record);
      existingIdMap.set(record.id, record);
    });
    
    // Prepare internships for upsert with stable IDs
    const now = new Date().toISOString();
    const idCounts = new Map<string, number>(); // Track duplicate IDs
    
    const finalInternships = checkedInternships.map((internship: any) => {
      const baseKey = generateUniqueKey(internship.company, internship.role, internship.locations?.[0]);
      
      // Check if this exact combination already exists in this batch
      const count = idCounts.get(baseKey) || 0;
      const uniqueKey = count > 0 ? `${baseKey}_${count}` : baseKey;
      idCounts.set(baseKey, count + 1);
      
      const existing = existingMap.get(uniqueKey);
      
      return {
        id: existing?.id || uniqueKey, // Use existing ID or create stable one
        company: internship.company,
        role: internship.role,
        category: internship.category,
        locations: internship.locations,
        application_link: internship.application_link,
        date_posted: internship.date_posted,
        days_ago: internship.days_ago,
        requires_citizenship: internship.requires_citizenship || false,
        no_sponsorship: internship.no_sponsorship || false,
        is_subsidiary: internship.is_subsidiary || false,
        is_freshman_friendly: internship.is_freshman_friendly || false,
        is_closed: internship.is_closed || false,
        is_active: !internship.is_closed,
        source: internship.source,
        last_seen: now,
        created_at: existing?.created_at || now // Preserve original creation time
      };
    });
    
    // Track scraped unique keys for marking inactive
    const scrapedKeys = new Set(finalInternships.map(i => i.id));
    
    // Mark positions no longer on GitHub as inactive
    const toMarkInactive = (existingInternships || [])
      .filter(record => !scrapedKeys.has(record.id))
      .map(record => record.id);
    
    if (toMarkInactive.length > 0) {
      console.log(`🔴 Marking ${toMarkInactive.length} positions as inactive...`);
      const { error: inactiveError } = await supabaseAdmin
        .from('internships')
        .update({ is_active: false })
        .in('id', toMarkInactive);
      
      if (inactiveError) {
        console.warn('Warning: Could not mark inactive:', inactiveError.message);
      }
    }
    
    // Upsert internships (insert new, update existing)
    console.log(`💾 Upserting ${finalInternships.length} internships...`);
    const { error } = await supabaseAdmin
      .from('internships')
      .upsert(finalInternships, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      throw new Error(`Database upsert failed: ${error.message}`);
    }
    
    // Calculate stats
    const added = finalInternships.filter(i => !existingMap.has(i.id)).length;
    const updated = finalInternships.length - added;
    
    // Log the scrape run
    try {
      const { error: logError } = await supabaseAdmin.from('scrape_logs').insert({
        run_id: runId,
        status: 'success',
        internships_found: finalInternships.length,
        internships_added: added,
        internships_updated: updated,
        completed_at: new Date().toISOString(),
        source: 'multi-source',
        duration_ms: Date.now() - startTime.getTime(),
        sources_data: JSON.stringify(sources)
      });
      
      if (logError) {
        console.warn('Failed to log scrape run:', logError.message);
      } else {
        console.log('✅ Scrape run logged successfully');
      }
    } catch (logErr) {
      console.warn('Error logging scrape run:', logErr);
    }
    
    console.log(`✅ Scraper completed successfully!`);
    console.log(`   📊 Total: ${finalInternships.length} internships`);
    console.log(`   ✨ New: ${added}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   🔴 Marked inactive: ${toMarkInactive.length}`);
    
    return {
      success: true,
      internshipsFound: finalInternships.length,
      updated: 0,
      added: finalInternships.length,
      sources: sources
    };
    
  } catch (error) {
    console.error('Scraper error:', error);
    
    // Log the failed run
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('scrape_logs').insert({
          run_id: runId,
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
          source: 'multi-source',
          duration_ms: Date.now() - startTime.getTime(),
          sources_data: JSON.stringify(sources)
        });
      } catch (logErr) {
        console.warn('Failed to log error:', logErr);
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      sources
    };
  }
}

function parseInternshipsFromMarkdown(content: string): any[] {
  const lines = content.split('\n');
  const internships: any[] = [];
  let lastMainCompany = '';
  
  // Find the table start - look for the exact header you specified
  let tableStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('| Company | Role | Location | Application/Link | Date Posted |')) {
      tableStart = i + 2; // Skip header and separator line
      break;
    }
  }
  
  if (tableStart === -1) {
    console.warn('Table header not found in markdown');
    return [];
  }
  
  console.log(`Found table at line ${tableStart - 2}, parsing internships...`);
  console.log(`Processing lines ${tableStart} to end of file (${lines.length} total lines)`);
  
  // Parse each table row
  for (let i = tableStart; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Stop parsing when we hit an empty line or non-table content (end of table)
    if (!line || (!line.startsWith('|') && line !== '')) {
      console.log(`Table ended at line ${i}, found ${internships.length} internships`);
      break;
    }
    
    // Skip separator lines
    if (line.includes('---')) {
      continue;
    }
    
    const parts = line.split('|').map(p => p.trim()).filter(p => p);
    
    if (parts.length < 4) continue;
    
    let company = cleanText(parts[0]);
    const role = cleanText(parts[1]);
    const locationRaw = parts[2];
    const applicationRaw = parts[3];
    const datePosted = parts[4] ? cleanText(parts[4]) : 'Unknown';
    const daysAgo = parseDaysAgo(datePosted);
    
    // Handle subsidiary companies (↳ character)
    let isSubsidiary = false;
    if (company.includes('↳')) {
      isSubsidiary = true;
      // Use the last main company for subsidiaries
      company = lastMainCompany;
    } else if (company && company !== '↳') {
      // Update the last main company when we encounter a new one
      lastMainCompany = company;
    }
    
    if (!company || !role) continue;
    
    // Parse locations (handle details/summary format)
    const locations = parseLocations(locationRaw);
    
    // Extract application link
    const applicationLink = extractLink(applicationRaw);
    
    // Detect requirements from emoji/text patterns
    const requirements = detectRequirements(role + ' ' + company);
    
    const internship = {
      company: company,
      role: requirements.cleanRole,
      category: categorizeRole(requirements.cleanRole),
      locations: locations,
      application_link: applicationLink,
      date_posted: datePosted,
      days_ago: daysAgo,
      requires_citizenship: requirements.requiresCitizenship,
      no_sponsorship: requirements.noSponsorship,
      is_subsidiary: isSubsidiary,
      is_freshman_friendly: requirements.isFreshmanFriendly,
      is_closed: requirements.isClosed
    };
    
    internships.push(internship);
  }
  
  console.log(`Parsed ${internships.length} internships from GitHub`);
  return internships;
}

function generateUniqueKey(company: string, role: string, location?: string): string {
  const loc = location || 'remote';
  return `${company}_${role}_${loc}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 200); // Limit length for database
}

function parseDaysAgo(dateText: string): number {
  if (!dateText) return 9999;
  
  const match = dateText.match(/(\d+)\s*days?\s*ago/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  if (dateText.toLowerCase().includes('today')) return 0;
  if (dateText.toLowerCase().includes('yesterday')) return 1;
  
  return 9999;
}

function parseLocations(locationText: string): string[] {
  if (!locationText) return ['Remote'];

  // Handle details/summary format like: <details><summary>**5 locations**</summary>Southlake, TX</br>Austin, TX</br>Westlake, TX</br>Ann Arbor, MI</br>Indianapolis, IN</details>
  if (locationText.includes('<details>')) {
    // Try to find content between </summary> and </details>
    const contentMatch = locationText.match(/<\/summary>(.*?)(<\/details>|$)/s);

    if (contentMatch) {
      const locationContent = contentMatch[1];
      console.log(`Raw location content: "${locationContent}"`);

      // Split by various br tag formats and clean up
      const locations = locationContent
        .split(/<\/?br\s*\/?>/i)
        .map(loc => {
          // Clean HTML entities first
          let cleaned = loc
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
            .trim();
          return cleaned;
        })
        .filter(loc => loc.length > 0 && !loc.match(/^\*?\*?\d+\s+locations?\*?\*?$/i)); // Filter out summary text like "**5 locations**"

      console.log(`Parsed locations from details: [${locations.map(l => `"${l}"`).join(', ')}]`);
      return locations.length > 0 ? locations : ['Multiple Locations'];
    } else {
      // If details tag is malformed or incomplete, try to extract any text after "locations"
      const fallbackMatch = locationText.match(/\d+\s+locations.*?>(.*?)(<|$)/s);
      if (fallbackMatch) {
        const fallbackContent = fallbackMatch[1];
        const locations = fallbackContent
          .split(/<\/?br\s*\/?>/i)
          .map(loc => cleanText(loc))
          .filter(loc => loc.length > 0 && !loc.match(/^\d+\s+locations?$/i));

        if (locations.length > 0) {
          console.log(`Parsed locations from malformed details: [${locations.map(l => `"${l}"`).join(', ')}]`);
          return locations;
        }
      }
    }
  }

  // Handle regular location text - check for <br> tags first
  let processedText = locationText;

  // If there are <br> tags, split by them first
  if (processedText.match(/<\/?br\s*\/?>/i)) {
    const locations = processedText
      .split(/<\/?br\s*\/?>/i)
      .map(loc => cleanText(loc))
      .filter(loc => loc.length > 0 && !loc.match(/^\*?\*?\d+\s+locations?\*?\*?$/i));

    if (locations.length > 0) {
      console.log(`Parsed locations from br tags: [${locations.map(l => `"${l}"`).join(', ')}]`);
      return locations;
    }
  }

  // Otherwise clean and parse normally
  const cleaned = cleanText(processedText);

  // Skip if it still contains "locations" pattern (means parsing failed)
  if (cleaned.match(/^\*?\*?\d+\s+locations?\*?\*?/i) || cleaned.toLowerCase().includes('location')) {
    console.warn(`Failed to parse location: ${cleaned}`);
    return ['Multiple Locations'];
  }

  // For single locations or simple comma-separated, just return as-is
  const locations = [cleaned].filter(loc => loc.length > 0);

  return locations.length > 0 ? locations : ['Remote'];
}

function detectFreshmanFriendly(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Graduation requirement triggers
  const gradTriggers = [
    'graduation date', 'graduating by', 'graduate by', 'completion date',
    'expected graduation', 'anticipated graduation', 'graduation between',
    'rising junior', 'rising senior', 'must graduate', 'will graduate',
    'graduation year', 'class of', 'expected to graduate'
  ];
  
  // Temporal modifiers
  const temporalModifiers = [
    'before', 'after', 'earlier than', 'later than', 'by', 'in', 
    'between', 'prior to', 'must have', 'only'
  ];
  
  // Check for explicit freshman indicators (always freshman-friendly)
  if (lowerText.includes('freshman') || text.includes('👨‍🎓') || text.includes('🎓')) {
    return true;
  }
  
  // Check for graduation requirement patterns
  let hasGradRequirement = false;
  let gradContext = '';
  
  for (const trigger of gradTriggers) {
    const triggerIndex = lowerText.indexOf(trigger);
    if (triggerIndex !== -1) {
      hasGradRequirement = true;
      // Extract context window around the trigger (100 chars before and after)
      const start = Math.max(0, triggerIndex - 100);
      const end = Math.min(lowerText.length, triggerIndex + trigger.length + 100);
      gradContext = lowerText.substring(start, end);
      break;
    }
  }
  
  // If no graduation requirement found, assume freshman-friendly
  if (!hasGradRequirement) {
    return true;
  }
  
  // Parse graduation context for year requirements
  // Current freshmen graduate in 2029 or later
  // NOT freshman-friendly if:
  // - "before 2029" or earlier years (excludes freshmen)
  // - "by 2028" or earlier years (excludes freshmen)  
  // - "graduating 2028" or earlier (excludes freshmen)
  // - "class of 2028" or earlier (excludes freshmen)
  // - "Rising Junior" or "Rising Senior" only
  
  // Check for Rising Junior/Senior only (NOT freshman-friendly)
  if (lowerText.includes('rising junior') || lowerText.includes('rising senior')) {
    if (!lowerText.includes('freshman') && !lowerText.includes('sophomore')) {
      return false;
    }
  }
  
  // Extract years from context
  const yearMatches = gradContext.match(/20\d{2}/g);
  if (yearMatches) {
    for (const year of yearMatches) {
      const yearNum = parseInt(year, 10);
      
      // Check for restrictive temporal patterns (freshmen graduate 2029+)
      if (gradContext.includes(`before ${year}`) && yearNum <= 2029) {
        return false;
      }
      if (gradContext.includes(`by ${year}`) && yearNum <= 2028) {
        return false;
      }
      if (gradContext.includes(`graduating ${year}`) && yearNum <= 2028) {
        return false;
      }
      if (gradContext.includes(`graduate ${year}`) && yearNum <= 2028) {
        return false;
      }
      if (gradContext.includes(`class of ${year}`) && yearNum <= 2028) {
        return false;
      }
    }
  }
  
  // Check for season + year patterns (e.g., "Winter 2026", "Spring 2028")
  const seasonYearPattern = /(winter|spring|summer|fall)\s+20\d{2}/gi;
  const seasonMatches = gradContext.match(seasonYearPattern);
  if (seasonMatches) {
    for (const match of seasonMatches) {
      const yearMatch = match.match(/20\d{2}/);
      if (yearMatch) {
        const yearNum = parseInt(yearMatch[0], 10);
        // If requirement is "between Winter 2026 - Spring 2028" format
        // This excludes freshmen (who graduate 2029+)
        if (gradContext.includes('between') && yearNum >= 2026 && gradContext.includes('2028')) {
          return false;
        }
      }
    }
  }
  
  // Default to freshman-friendly if no restrictive patterns found
  return true;
}

function detectRequirements(text: string): {
  requiresCitizenship: boolean;
  noSponsorship: boolean;
  isClosed: boolean;
  isFreshmanFriendly: boolean;
  cleanRole: string;
} {
  if (!text) return { 
    requiresCitizenship: false, 
    noSponsorship: false, 
    isClosed: false, 
    isFreshmanFriendly: false, 
    cleanRole: text 
  };

  let cleanRole = text;
  let requiresCitizenship = false;
  let noSponsorship = false;
  let isClosed = false;
  let isFreshmanFriendly = false;

  // Check for citizenship requirements (US flag emojis and encoded versions)
  if (text.includes('🇺🇸') || text.includes('ðºð¸') || text.includes('\\ud83c\\uddfa\\ud83c\\uddf8') || 
      text.includes('\ud83c\uddfa\ud83c\uddf8') || text.includes('U.S. Citizenship')) {
    requiresCitizenship = true;
  }
  
  // Check for no sponsorship (passport emoji and encoded versions)  
  if (text.includes('🛂') || text.includes('ð') || text.includes('\\ud83d\\udec2') ||
      text.includes('\ud83d\udec2') || text.includes('Does NOT offer Sponsorship') ||
      text.includes('No Sponsorship')) {
    noSponsorship = true;
  }
  
  // Check for closed applications (lock emoji and encoded versions)
  if (text.includes('🔒') || text.includes('\\ud83d\\udd12') || text.includes('\ud83d\udd12') ||
      text.includes('application is closed') || text.includes('Internship application is closed')) {
    isClosed = true;
  }
  
  // Check for freshman friendly with comprehensive pattern matching
  isFreshmanFriendly = detectFreshmanFriendly(text);

  // Clean the role by removing emojis, encoded emojis, and text indicators
  const emojiPatterns = [
    /🇺🇸/g, /ðºð¸/g, /🛂/g, /ð(?![\w])/g, /🔒/g, /👨‍🎓/g, /🎓/g,
    /\\ud83c\\uddfa\\ud83c\\uddf8/g, /\\ud83d\\udec2/g, /\\ud83d\\udd12/g,
    /\ud83c\uddfa\ud83c\uddf8/g, /\ud83d\udec2/g, /\ud83d\udd12/g,
    /- 🛂 - Does NOT offer Sponsorship/g,
    /- 🇺🇸 - Requires U\.S\. Citizenship/g,
    /- 🔒 - Internship application is closed/g,
    /Does NOT offer Sponsorship/g,
    /Requires U\.S\. Citizenship/g,
    /Internship application is closed/g
  ];
  
  for (const pattern of emojiPatterns) {
    cleanRole = cleanRole.replace(pattern, '');
  }
  
  // Clean up extra spaces and trim
  cleanRole = cleanRole.replace(/\s+/g, ' ').trim();
  
  return { requiresCitizenship, noSponsorship, isClosed, isFreshmanFriendly, cleanRole };
}

function cleanText(text: string): string {
  if (!text) return '';

  // Remove markdown links but keep the text
  let cleaned = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // Clean HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // Clean up extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

function extractLink(cell: string): string | null {
  if (!cell) return null;
  
  // Extract URL from markdown link format [text](url)
  const markdownMatch = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (markdownMatch) {
    let url = markdownMatch[2];
    // Clean up URL - remove any HTML fragments or extra characters
    url = url.replace(/">.*$/, ''); // Remove anything after "> (HTML fragments)
    url = url.replace(/\\$/, ''); // Remove trailing backslash
    return url;
  }
  
  // Extract direct URL
  const urlMatch = cell.match(/(https?:\/\/[^\s"<>]+)/);
  if (urlMatch) {
    let url = urlMatch[1];
    // Clean up URL - remove any HTML fragments
    url = url.replace(/">.*$/, ''); // Remove anything after "> (HTML fragments)
    url = url.replace(/\\$/, ''); // Remove trailing backslash
    return url;
  }
  
  return null;
}

/**
 * Categorize role using word boundary matching to prevent false positives
 * Example: "equipment" contains "ui" but shouldn't match "Front End"
 */
function categorizeRole(role: string): string {
  if (!role) return 'Other';

  const lowerRole = role.toLowerCase();

  // PRIORITY ORDER: Most specific categories first to prevent false matches
  const categories = {
    // VERY SPECIFIC CATEGORIES (check these first)
    'Quant/Trading': ['quant', 'quantitative', 'trading', 'algorithmic trading', 'financial engineering', 'prop trading', 'proprietary trading'],
    'Hardware Engineering': ['hardware engineer', 'hardware', 'electrical engineer', 'electrical', 'embedded', 'firmware', 'semiconductor', 'asic', 'vlsi', 'circuit design', 'chip design', 'pcb', 'fpga', 'rtl', 'verilog', 'equipment engineering', 'test engineer'],
    'AI/ML': ['artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'computer vision', 'generative ai', 'llm', 'ai', 'ml', 'nlp'],

    // MODERATELY SPECIFIC
    'Full Stack': ['full stack', 'fullstack', 'full-stack'],
    'Mobile': ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
    'DevOps': ['devops', 'infrastructure', 'ci/cd', 'docker', 'kubernetes', 'terraform', 'cloud ops', 'sre', 'site reliability'],
    'Data Science': ['data science', 'data scientist', 'predictive analytics', 'statistical analysis'],
    'Data Engineering': ['data engineer', 'data pipeline', 'data warehouse', 'etl', 'data platform'],
    'Security': ['security', 'cybersecurity', 'cyber', 'infosec', 'penetration test', 'appsec', 'application security'],
    'Product Management': ['product manager', 'product management', 'product owner', 'product strategist'],
    'Cloud Engineering': ['cloud engineer', 'cloud architect', 'aws', 'azure', 'gcp'],

    // SPECIFIC BUT COMMON
    'Front End': ['frontend', 'front-end', 'front end', 'react', 'vue', 'angular', 'web developer'],
    'Back End': ['backend', 'back-end', 'back end', 'server', 'api', 'microservices'],
    'Quality Assurance': ['quality assurance', 'automation test', 'sdet', 'qa', 'test'],
    'UX/UI Design': ['ux design', 'ui design', 'user experience', 'interaction design', 'product design'],
    'Research': ['research scientist', 'research engineer', 'research', 'researcher'],
    'Information Technology': ['information technology', 'it support', 'systems admin'],

    // MOST GENERIC (check last)
    'Software Engineering': ['software engineer', 'software development', 'software dev', 'programmer', 'coding', 'developer', 'engineer', 'swe']
  };

  // Use WORD BOUNDARY matching to prevent false positives
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      // Escape special regex characters and use word boundaries
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`\\b${escapedKeyword}\\b`, 'i');

      if (pattern.test(lowerRole)) {
        return category;
      }
    }
  }

  return 'Other';
}

// Check application links to detect closed internships
async function checkApplicationLinks(internships: any[]): Promise<any[]> {
  const batchSize = 20;
  const delay = 100;
  console.log(`🔍 Checking all ${internships.length} application links for status...`);
  
  // Common phrases that indicate a job is closed/unavailable
  const closedJobIndicators = [
    "sorry, the job you're looking for isn't available",
    "this job is no longer available",
    "position has been filled",
    "job posting has expired",
    "application deadline has passed",
    "no longer accepting applications",
    "position is no longer open",
    "job has been removed",
    "posting has been closed",
    "opportunity is no longer available",
    "role has been filled",
    "applications are now closed",
    "job opening has closed",
    "position has closed",
    "we're no longer hiring for this role",
    "this position is closed",
    "job is closed",
    "expired job posting",
    "job not found",
    "position not available"
  ];
  
  // Process in batches to avoid overwhelming servers
  for (let i = 0; i < internships.length; i += batchSize) {
    const batch = internships.slice(i, i + batchSize);
    const promises = batch.map(async (internship, batchIndex) => {
      if (!internship.application_link) return;
      
      try {
        await new Promise(resolve => setTimeout(resolve, batchIndex * delay));
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout for content checking
        
        // First try HEAD request for quick status check
        let response = await fetch(internship.application_link, {
          method: 'HEAD',
          signal: controller.signal,
          headers: { 'User-Agent': 'GT-CS-Internship-Portal/1.0 (Educational Purpose)' }
        });
        
        // If HEAD request fails or returns error, mark as closed
        if (response.status >= 400) {
          internship.is_closed = true;
          console.log(`❌ ${internship.company} - HTTP ${response.status} (marked as closed)`);
          clearTimeout(timeoutId);
          return;
        }
        
        // If HEAD request succeeds, do a GET request to check content
        response = await fetch(internship.application_link, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'User-Agent': 'GT-CS-Internship-Portal/1.0 (Educational Purpose)' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.status === 200) {
          // Get the page content and check for closure indicators
          const content = await response.text();
          const contentLower = content.toLowerCase();
          
          // Check if any closure indicators are present
          const isClosed = closedJobIndicators.some(indicator => 
            contentLower.includes(indicator.toLowerCase())
          );
          
          if (isClosed) {
            internship.is_closed = true;
            console.log(`❌ ${internship.company} - Content indicates job closed`);
          } else {
            internship.is_closed = false;
          }
        } else {
          internship.is_closed = true;
          console.log(`❌ ${internship.company} - HTTP ${response.status} (marked as closed)`);
        }
        
      } catch (error) {
        // For network errors, mark as potentially closed but log differently
        // This helps identify problematic URLs vs definitely closed ones
        internship.is_closed = true;
        console.log(`⚠️ ${internship.company} - Network error, marked as closed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
    
    await Promise.all(promises);
    console.log(`✓ Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(internships.length/batchSize)} completed`);
  }
  
  return internships;
}

// Helper function to normalize role names for better matching
function normalizeRoleName(role: string): string {
  return role
    .toLowerCase()
    .trim()
    // Remove common prefixes
    .replace(/^(campus\s*-?\s*|entry\s*level\s*|junior\s*|graduate\s*|new\s*grad\s*)/i, '')
    // Remove common suffixes and variations
    .replace(/\s*(intern|internship|co-op|coop|rotation|program)\s*$/i, '')
    // Normalize whitespace and special characters
    .replace(/[-_\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to extract domain from application link
function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

// Helper function to normalize company name
function normalizeCompanyName(company: string): string {
  return company
    .toLowerCase()
    .trim()
    // Remove common suffixes
    .replace(/\s*(inc\.?|incorporated|corp\.?|corporation|llc|ltd\.?|limited|co\.?|company)\s*$/i, '')
    // Normalize whitespace and special characters
    .replace(/[-_\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Enhanced deduplication function with multiple matching strategies
function deduplicateInternships(allInternships: any[]): any[] {
  const dedupeMap = new Map<string, any>();
  const domainMap = new Map<string, any>(); // Additional tracking by domain
  
  // Sort by source priority (lower number = higher priority), default to 1 if missing
  const sortedInternships = allInternships.sort((a, b) => (a.source_priority || 1) - (b.source_priority || 1));
  
  for (const internship of sortedInternships) {
    const normalizedCompany = normalizeCompanyName(internship.company);
    const normalizedRole = normalizeRoleName(internship.role);
    const primaryLocation = internship.locations?.[0] || 'remote';
    const normalizedLocation = primaryLocation.toLowerCase().trim();
    const applicationDomain = extractDomain(internship.application_link);
    
    // Strategy 1: Exact normalized match (company + role + location)
    const exactKey = `${normalizedCompany}_${normalizedRole}_${normalizedLocation}`;
    
    // Strategy 2: Company + role match (more lenient for locations)
    const roleKey = `${normalizedCompany}_${normalizedRole}`;
    
    // Strategy 3: Domain-based matching for additional validation
    const domainKey = applicationDomain ? `${applicationDomain}_${normalizedRole}` : null;
    
    let isDuplicate = false;
    let duplicateReason = '';
    
    // Check exact match first
    if (dedupeMap.has(exactKey)) {
      isDuplicate = true;
      duplicateReason = 'exact match';
    }
    // Check role-based match (same company + role, different locations)
    else if (dedupeMap.has(roleKey)) {
      const existing = dedupeMap.get(roleKey);
      // If locations are very similar or one is subset of other, consider duplicate
      const existingLocation = (existing.locations?.[0] || 'remote').toLowerCase();
      if (normalizedLocation === existingLocation || 
          normalizedLocation.includes('remote') && existingLocation.includes('remote') ||
          Math.abs(normalizedLocation.length - existingLocation.length) <= 3) {
        isDuplicate = true;
        duplicateReason = 'role match with similar location';
      }
    }
    // Check domain-based match if we have application domains
    else if (domainKey && domainMap.has(domainKey)) {
      const existing = domainMap.get(domainKey);
      const existingCompany = normalizeCompanyName(existing.company);
      // If companies are similar and roles match, likely duplicate
      if (normalizedCompany === existingCompany || 
          normalizedCompany.includes(existingCompany) || 
          existingCompany.includes(normalizedCompany)) {
        isDuplicate = true;
        duplicateReason = 'domain + role match';
      }
    }
    
    if (!isDuplicate) {
      // Store with both keys for future matching
      dedupeMap.set(exactKey, internship);
      dedupeMap.set(roleKey, internship);
      if (domainKey) {
        domainMap.set(domainKey, internship);
      }
    } else {
      console.log(`🔄 Duplicate found (${duplicateReason}): ${internship.company} - ${internship.role} (source: ${internship.source})`);
      console.log(`   Original: "${normalizeCompanyName(internship.company)}" - "${normalizeRoleName(internship.role)}"`);
    }
  }
  
  // Return unique internships (use exactKey pattern to get unique entries)
  const uniqueInternships: any[] = [];
  const seenCompanies = new Set<string>();
  
  for (const [key, internship] of dedupeMap.entries()) {
    // Only add if this is the first time we see this exact internship
    const companyRoleKey = `${normalizeCompanyName(internship.company)}_${normalizeRoleName(internship.role)}_${(internship.locations?.[0] || 'remote').toLowerCase().trim()}`;
    if (!seenCompanies.has(companyRoleKey)) {
      uniqueInternships.push(internship);
      seenCompanies.add(companyRoleKey);
    }
  }
  
  return uniqueInternships;
}

// Parser for SimplifyJobs format
function parseSimplifyJobsMarkdown(content: string): any[] {
  const lines = content.split('\n');
  const internships: any[] = [];
  let lastMainCompany = '';
  let inTable = false;
  let headerPassed = false;
  
  console.log(`SimplifyJobs: Processing ${lines.length} lines, looking for <tbody> tag...`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if we're entering the main table
    if (line.includes('<tbody>')) {
      inTable = true;
      headerPassed = true;
      console.log(`SimplifyJobs: Found <tbody> at line ${i}, starting to parse table rows...`);
      continue;
    }
    
    // Check if we're leaving the table
    if (line.includes('</tbody>')) {
      inTable = false;
      console.log(`SimplifyJobs: Found </tbody> at line ${i}, parsed ${internships.length} internships so far`);
      break; // Exit the loop when table ends
    }
    
    // Skip if not in table or header not passed
    if (!inTable || !headerPassed) continue;
    
    // Look for table rows - be more flexible with whitespace
    if (line.includes('<tr>') && !line.includes('<th>')) {
      // Extract the full row content including subsequent lines
      let rowContent = '';
      let j = i;
      while (j < lines.length && !lines[j].includes('</tr>')) {
        rowContent += lines[j] + '\n';
        j++;
      }
      if (j < lines.length) {
        rowContent += lines[j]; // Add the closing </tr>
      }
      i = j; // Skip the processed lines
      
      // Parse the row
      const internship = parseSimplifyJobRow(rowContent, lastMainCompany);
      if (internship) {
        // Only update lastMainCompany if this is NOT a subsidiary and has valid company
        if (!internship.is_subsidiary && internship.company && internship.company.trim() !== '') {
          lastMainCompany = internship.company;
        }
        internships.push(internship);
      }
    }
  }
  
  console.log(`Parsed ${internships.length} internships from SimplifyJobs`);
  return internships;
}

function parseSimplifyJobRow(rowHtml: string, lastMainCompany: string): any | null {
  try {
    // Extract table cells using regex
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
    const cells: string[] = [];
    let match;
    
    while ((match = cellRegex.exec(rowHtml)) !== null) {
      cells.push(match[1].trim());
    }
    
    if (cells.length < 4) {
      return null; // Need at least Company, Role, Location, Application
    }
    
    // Extract company name using enhanced function for <strong> tags
    let company = extractCompanyFromHtml(cells[0]);
    let isSubsidiary = false;

    // Handle subsidiary companies (↳ symbol) with validation
    // Check for ↳ symbol OR empty string OR whitespace-only after emoji stripping
    if (!company || company === '↳' || company.includes('↳') || company.trim() === '') {
      if (lastMainCompany && lastMainCompany.trim() !== '') {
        company = lastMainCompany;
        isSubsidiary = true;
      } else {
        // No valid parent company available, skip this row
        console.warn('⚠️ Subsidiary company found but no parent company available, skipping row');
        return null;
      }
    }
    
    // Extract role
    const role = extractTextFromHtml(cells[1]);
    
    // Extract location(s) - handle multiple locations separated by <br>
    let locationText = cells[2];
    let locations: string[] = [];
    let expectedLocationCount: number | null = null;

    // Handle <details> tags - extract count and content
    if (locationText.includes('<details>')) {
      // Step 1: Extract expected count from <summary><strong>X locations</strong></summary>
      const summaryMatch = locationText.match(/<summary>.*?<strong>\s*(\d+)\s+locations?\s*<\/strong>.*?<\/summary>/i);
      if (summaryMatch) {
        expectedLocationCount = parseInt(summaryMatch[1], 10);
      }

      // Step 2: Extract content after </summary> tag
      const summaryEndMatch = locationText.match(/<\/summary>([\s\S]*?)<\/details>/i);
      if (summaryEndMatch) {
        locationText = summaryEndMatch[1].trim();
      }
    }

    // Step 3: Split by ALL br tag variations: <br>, <br/>, </br>, <br />
    locations = locationText
      .split(/<\/?br\s*\/?>/i)  // ✅ Now matches </br> too!
      .map(loc => extractTextFromHtml(loc).trim())
      .filter(loc => loc.length > 0 && !loc.toLowerCase().includes('locations'));

    // If no locations found after splitting, try extracting plain text
    if (locations.length === 0) {
      const plainLocation = extractTextFromHtml(locationText).trim();
      if (plainLocation && plainLocation.length > 0) {
        locations = [plainLocation];
      }
    }

    // Step 4: Normalize locations to prevent duplicates (NYC → New York, NY)
    locations = locations.map(loc => normalizeLocation(loc));

    // Step 5: Remove duplicates after normalization
    locations = [...new Set(locations)];

    // Step 6: Validate parsed count matches expected count
    if (expectedLocationCount !== null) {
      if (locations.length !== expectedLocationCount) {
        console.warn(`⚠️ Location count mismatch for ${company}: Expected ${expectedLocationCount}, got ${locations.length}`);
        console.warn(`   Locations parsed: [${locations.join(', ')}]`);
      } else {
        console.log(`✅ Validated ${locations.length} locations for ${company}`);
      }
    }
    
    // Extract application link - get the first non-simplify link
    const applicationCell = cells[3];
    const linkMatch = applicationCell.match(/href="([^"]*)"[^>]*><img[^>]*alt="Apply"/i);
    let applicationLink = linkMatch ? linkMatch[1] : null;

    // Try to get direct application link, but keep Simplify as fallback
    // Look for the first href that isn't a Simplify tracking link
    const allLinks = applicationCell.match(/href="([^"]*)"/g);
    if (allLinks && allLinks.length > 0) {
      for (const link of allLinks) {
        const url = link.match(/href="([^"]*)"/)?.[1];
        if (url && !url.includes('simplify.jobs/p/') && !url.includes('utm_source')) {
          applicationLink = url;
          break;
        }
      }
    }

    // Extract age/date posted and calculate days_ago
    const ageText = cells[4] ? extractTextFromHtml(cells[4]) : 'Unknown';
    const daysAgo = ageText.match(/(\d+)d/) ? parseInt(ageText.match(/(\d+)d/)![1], 10) : 9999;
    
    // Determine categories and requirements from emojis and text
    // Search the full row HTML for emojis (including company cell and role cell)
    const fullRowText = rowHtml;
    const companyCell = cells[0]; // Raw company cell HTML for better emoji detection
    const roleCell = cells[1]; // Raw role cell HTML for emoji detection

    // Check for citizenship requirements (🇺🇸 emoji or text) - can be in company or role cell
    const requiresCitizenship = fullRowText.includes('🇺🇸') || fullRowText.includes('requires u.s. citizenship') ||
                               fullRowText.includes('\\ud83c\\uddfa\\ud83c\\uddf8') || fullRowText.includes('\ud83c\uddfa\ud83c\uddf8') ||
                               companyCell.includes('🇺🇸') || roleCell.includes('🇺🇸');

    // Check for no sponsorship (🛂 emoji or text) - usually in role cell
    const noSponsorship = fullRowText.includes('🛂') || fullRowText.includes('does not offer sponsorship') ||
                         fullRowText.includes('\\ud83d\\udec2') || fullRowText.includes('\ud83d\udec2') ||
                         roleCell.includes('🛂') || companyCell.includes('🛂');

    // Check for closed applications (🔒 emoji or text)
    const isClosed = fullRowText.includes('🔒') || fullRowText.includes('application is closed') ||
                    fullRowText.includes('\\ud83d\\udd12') || fullRowText.includes('\ud83d\udd12');

    // Enhanced fire emoji detection (🔥) - usually in company cell for FAANG
    const isFaang = companyCell.includes('🔥') || fullRowText.includes('🔥') ||
                   fullRowText.includes('\\ud83d\\udd25') || fullRowText.includes('\ud83d\udd25') ||
                   companyCell.includes('\\ud83d\\udd25') || companyCell.includes('\ud83d\udd25');

    // Check for advanced degree requirement (🎓 emoji) - usually in role cell
    const requiresAdvancedDegree = fullRowText.includes('🎓') || fullRowText.includes('\\ud83c\\udf93') || fullRowText.includes('\ud83c\udf93') ||
                                  roleCell.includes('🎓');
    
    // Categorize the role
    const category = categorizeRole(role);
    
    if (!company || !role || company.trim() === '' || role.trim() === '') {
      return null;
    }
    
    return {
      company: company.trim(),
      role: role.trim(),
      category,
      locations: locations.length > 0 ? locations : ['Remote'],
      application_link: applicationLink,
      date_posted: ageText,
      days_ago: daysAgo,
      requires_citizenship: requiresCitizenship,
      no_sponsorship: noSponsorship,
      is_subsidiary: isSubsidiary,
      is_freshman_friendly: !requiresAdvancedDegree, // Assume freshman friendly unless advanced degree required
      is_closed: isClosed,
      is_faang: isFaang,
      requires_advanced_degree: requiresAdvancedDegree
    };
  } catch (error) {
    console.warn('Error parsing SimplifyJobs row:', error);
    return null;
  }
}

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    // Remove specific emojis used in SimplifyJobs legend (but keep them in the raw HTML for detection)
    .replace(/🔥|🎓|🇺🇸|🛂|🔒/g, '')
    // Remove other common emojis
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .trim();
}

// Enhanced function specifically for extracting company names that handles <strong> tags, <a> tags and emojis properly
// Handles all these patterns:
// 1. <strong>Slack</strong>
// 2. <strong><a>TikTok</a></strong>
// 3. 🔥 <strong>Slack</strong>
// 4. 🔥 <strong><a>TikTok</a></strong>
// 5. <a>Company</a> (no strong)
// 6. 🔥 <a>Company</a> (emoji + anchor, no strong)
function extractCompanyFromHtml(html: string): string {
  let company = '';

  // Strategy: Extract content from innermost tag, then strip emojis from the result

  // First, try to find <strong> tag content
  const strongMatch = html.match(/<strong>(.*?)<\/strong>/);
  if (strongMatch) {
    company = strongMatch[1].trim();

    // If there's an <a> tag inside <strong>, extract from that
    const innerAnchor = company.match(/<a[^>]*>(.*?)<\/a>/);
    if (innerAnchor) {
      company = innerAnchor[1].trim();
    } else {
      // Remove any remaining HTML tags
      company = company.replace(/<[^>]*>/g, '').trim();
    }
  } else {
    // No <strong> tag, look for <a> tag directly
    const anchorMatch = html.match(/<a[^>]*>(.*?)<\/a>/);
    if (anchorMatch) {
      company = anchorMatch[1].trim();
    } else {
      // No structured tags, extract all text
      company = extractTextFromHtml(html);
    }
  }

  // Clean HTML entities
  company = company
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // Remove ALL emojis (including fire, graduation cap, flags, etc.)
  // This handles emojis that were before/after/inside the tags
  company = company
    .replace(/🔥|🎓|🇺🇸|🛂|🔒|↳/g, '')
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .trim();

  return company;
}