// Server-side scraper logic for API routes
import { supabaseAdmin } from './supabaseAdmin';

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

// Define our sources
const INTERNSHIP_SOURCES: InternshipSource[] = [
  {
    name: 'github-primary',
    url: 'https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/main/README.md',
    priority: 1,
    parser: parseInternshipsFromMarkdown
  },
  {
    name: 'simplify-jobs',
    url: 'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/refs/heads/dev/README.md',
    priority: 2,
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
    
    console.log(`📊 Total internships before deduplication: ${allInternships.length}`);
    
    // Deduplicate internships (primary source wins)
    const deduplicatedInternships = deduplicateInternships(allInternships);
    console.log(`📊 Total internships after deduplication: ${deduplicatedInternships.length}`);
    
    // Check application links for closed internships
    console.log('🔗 Checking application links for closed internships...');
    const checkedInternships = await checkApplicationLinks(deduplicatedInternships);
    
    // Format for database insertion
    const finalInternships = checkedInternships.map((internship: any, index: number) => {
      const now = new Date().toISOString();
      return {
        id: `${internship.company.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${internship.role.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${index}`,
        company: internship.company,
        role: internship.role,
        category: internship.category,
        locations: internship.locations,
        application_link: internship.application_link,
        date_posted: internship.date_posted,
        requires_citizenship: internship.requires_citizenship || false,
        no_sponsorship: internship.no_sponsorship || false,
        is_subsidiary: internship.is_subsidiary || false,
        is_freshman_friendly: internship.is_freshman_friendly || false,
        is_closed: internship.is_closed || false,
        is_active: true,
        source: internship.source,
        last_seen: now,
        created_at: now
      };
    });
    
    // Use Supabase admin client for server-side operations
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    // Clear existing internships for fresh data
    console.log('🗑️ Clearing existing internship data...');
    const { error: deleteError } = await supabaseAdmin
      .from('internships')
      .delete()
      .neq('id', '');
    
    if (deleteError) {
      console.warn('Warning: Could not clear existing data:', deleteError.message);
    } else {
      console.log('✅ Existing data cleared successfully');
    }
    
    // Insert fresh internships
    const { error } = await supabaseAdmin
      .from('internships')
      .insert(finalInternships);
    
    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }
    
    // Log the scrape run
    try {
      const { error: logError } = await supabaseAdmin.from('scrape_logs').insert({
        run_id: runId,
        status: 'success',
        internships_found: finalInternships.length,
        internships_added: finalInternships.length,
        internships_updated: 0,
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
    
    console.log(`✅ Scraper completed successfully! Found ${finalInternships.length} internships from ${sources.length} sources`);
    
    return {
      success: true,
      internshipsFound: finalInternships.length,
      updated: 0,
      added: finalInternships.length,
      sources
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
  
  // Parse each table row
  for (let i = tableStart; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines or non-table lines
    if (!line || !line.startsWith('|') || line === '---') {
      continue;
    }
    
    const parts = line.split('|').map(p => p.trim()).filter(p => p);
    
    if (parts.length < 4) continue;
    
    let company = cleanText(parts[0]);
    const role = cleanText(parts[1]);
    const locationRaw = parts[2];
    const applicationRaw = parts[3];
    const datePosted = parts[4] ? cleanText(parts[4]) : 'Unknown';
    
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

function parseLocations(locationText: string): string[] {
  if (!locationText) return ['Remote'];
  
  // Handle details/summary format like: <details><summary>**5 locations**</summary>Southlake, TX</br>Austin, TX</br>Westlake, TX</br>Ann Arbor, MI</br>Indianapolis, IN</details>
  if (locationText.includes('<details>')) {
    const contentMatch = locationText.match(/<\/summary>(.*?)<\/details>/s);
    
    if (contentMatch) {
      const locationContent = contentMatch[1];
      console.log(`Raw location content: "${locationContent}"`);
      
      // Split by </br> or <br> tags and clean up
      const locations = locationContent
        .split(/<\/?br\/?>/i)
        .map(loc => loc.trim())
        .filter(loc => loc.length > 0)
        .map(loc => {
          // Clean up any remaining HTML entities or tags
          return loc.replace(/&[a-zA-Z0-9#]+;/g, '').replace(/<[^>]*>/g, '').trim();
        });
      
      console.log(`Parsed locations from details: [${locations.map(l => `"${l}"`).join(', ')}]`);
      return locations.length > 0 ? locations : ['Multiple Locations'];
    }
  }
  
  // Handle regular location text
  const cleaned = cleanText(locationText);
  
  // Skip if it still contains "locations" (means parsing failed)
  if (cleaned.includes('locations') || cleaned.includes('location')) {
    console.warn(`Failed to parse location: ${cleaned}`);
    return ['Multiple Locations'];
  }
  
  // Split by common separators and ensure proper spacing
  const locations = cleaned
    .split(/[,;\/\n]/)
    .map(loc => {
      // Fix concatenated locations like "Mountain View, CAAnn Arbor, MI"
      let fixed = loc.trim();
      // Add space before state abbreviations that are concatenated
      fixed = fixed.replace(/([a-z])([A-Z][A-Z])([A-Z][a-z])/g, '$1, $2$3');
      // Add space before city names that are concatenated  
      fixed = fixed.replace(/([A-Z]{2})([A-Z][a-z])/g, '$1, $2');
      return fixed;
    })
    .filter(loc => loc.length > 0);
  
  return locations.length > 0 ? locations : ['Remote'];
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
  
  // Check for freshman friendly
  if (text.toLowerCase().includes('freshman') || text.includes('👨‍🎓') || text.includes('🎓')) {
    isFreshmanFriendly = true;
  }

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

function categorizeRole(role: string): string {
  if (!role) return 'Other';
  
  const lowerRole = role.toLowerCase();
  
  // Comprehensive categorization
  const categories = {
    'Software Engineering': ['software engineer', 'swe', 'software development', 'software dev', 'programmer', 'coding'],
    'Full Stack': ['full stack', 'fullstack', 'full-stack'],
    'Front End': ['frontend', 'front-end', 'front end', 'ui', 'user interface', 'react', 'vue', 'angular'],
    'Back End': ['backend', 'back-end', 'back end', 'server', 'api', 'database', 'microservices'],
    'AI/ML': ['ai', 'artificial intelligence', 'ml', 'machine learning', 'deep learning', 'neural network', 'nlp', 'computer vision'],
    'Data Science': ['data science', 'data scientist', 'predictive analytics', 'statistical analysis'],
    'Data Engineering': ['data engineer', 'data pipeline', 'data warehouse', 'etl', 'data platform'],
    'DevOps': ['devops', 'infrastructure', 'ci/cd', 'docker', 'kubernetes', 'terraform', 'cloud ops'],
    'Mobile': ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
    'Security': ['security', 'cybersecurity', 'cyber', 'infosec', 'penetration test'],
    'Product Management': ['product manager', 'product management', 'pm', 'product owner'],
    'Quant/Trading': ['quant', 'quantitative', 'trading', 'algorithmic trading', 'financial engineering'],
    'Research': ['research', 'researcher', 'research scientist', 'r&d', 'research engineer'],
    'Hardware Engineering': ['hardware', 'hardware engineer', 'electrical', 'embedded', 'firmware'],
    'Cloud Engineering': ['cloud', 'aws', 'azure', 'gcp', 'cloud engineer', 'cloud architect'],
    'Information Technology': ['information technology', 'it', 'it support', 'systems admin'],
    'Quality Assurance': ['qa', 'quality assurance', 'test', 'testing', 'automation test', 'sdet'],
    'UX/UI Design': ['ux', 'ui', 'user experience', 'design', 'interaction design']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerRole.includes(keyword))) {
      return category;
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
        if (response.status === 404 || response.status >= 400) {
          internship.is_closed = true;
          console.log(`❌ ${internship.company} - HTTP ${response.status}`);
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
          console.log(`❌ ${internship.company} - HTTP ${response.status}`);
        }
        
      } catch (error) {
        // Keep existing status on network errors, but log for debugging
        console.log(`⏭️ ${internship.company} - Network error, skipping`);
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
  
  // Sort by source priority (lower number = higher priority)
  const sortedInternships = allInternships.sort((a, b) => a.source_priority - b.source_priority);
  
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
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if we're entering the main table
    if (line.includes('<tbody>')) {
      inTable = true;
      headerPassed = true;
      continue;
    }
    
    // Check if we're leaving the table
    if (line.includes('</tbody>')) {
      inTable = false;
      continue;
    }
    
    // Skip if not in table or header not passed
    if (!inTable || !headerPassed) continue;
    
    // Look for table rows
    if (line.startsWith('<tr>')) {
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
        if (internship.company && internship.company !== '↳') {
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
    
    // Extract company name
    let company = extractTextFromHtml(cells[0]);
    let isSubsidiary = false;
    
    // Handle subsidiary companies (↳ symbol)
    if (company === '↳' || company.includes('↳')) {
      company = lastMainCompany;
      isSubsidiary = true;
    }
    
    // Extract role
    const role = extractTextFromHtml(cells[1]);
    
    // Extract location(s) - handle multiple locations separated by <br>
    let locationText = cells[2];
    const locations = locationText
      .split(/<br\s*\/?>/i)
      .map(loc => extractTextFromHtml(loc).trim())
      .filter(loc => loc.length > 0);
    
    // Extract application link - get the first non-simplify link
    const applicationCell = cells[3];
    const linkMatch = applicationCell.match(/href="([^"]*)"[^>]*><img[^>]*alt="Apply"/i);
    let applicationLink = linkMatch ? linkMatch[1] : null;
    
    // Skip simplify.jobs links, get direct application links
    if (applicationLink && applicationLink.includes('simplify.jobs')) {
      applicationLink = null;
    }
    
    // Extract age/date posted
    const ageText = cells[4] ? extractTextFromHtml(cells[4]).replace('d', ' days ago') : 'Unknown';
    
    // Determine categories and requirements from emojis and text
    const fullRowText = rowHtml.toLowerCase();
    const requiresCitizenship = fullRowText.includes('🇺🇸') || fullRowText.includes('requires u.s. citizenship');
    const noSponsorship = fullRowText.includes('🛂') || fullRowText.includes('does not offer sponsorship');
    const isClosed = fullRowText.includes('🔒') || fullRowText.includes('application is closed');
    const isFaang = fullRowText.includes('🔥');
    const requiresAdvancedDegree = fullRowText.includes('🎓');
    
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
      requires_citizenship: requiresCitizenship,
      no_sponsorship: noSponsorship,
      is_subsidiary: isSubsidiary,
      is_freshman_friendly: !requiresAdvancedDegree, // Assume freshman friendly unless advanced degree required
      is_closed: isClosed,
      is_faang: isFaang
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
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // Remove all emojis
    .replace(/🔥|🎓|🇺🇸|🛂|🔒/g, '') // Remove specific emojis used in SimplifyJobs
    .trim();
}