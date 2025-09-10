// Server-side scraper logic for API routes
import { supabaseAdmin } from './supabaseAdmin';

interface ScraperResult {
  success: boolean;
  internshipsFound?: number;
  updated?: number;
  added?: number;
  error?: string;
}

export async function runScraperAPI(): Promise<ScraperResult> {
  try {
    console.log('🔄 Fetching latest internships from GitHub...');
    
    // Fetch the live README from GitHub
    const response = await fetch('https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/main/README.md');
    
    if (!response.ok) {
      throw new Error(`GitHub fetch failed: ${response.status}`);
    }
    
    const markdownContent = await response.text();
    console.log('📖 Parsing GitHub README...');
    
    // Parse internships from the markdown table
    let internships = parseInternshipsFromMarkdown(markdownContent);
    
    if (internships.length === 0) {
      return { success: false, error: 'No internships found in GitHub README' };
    }

    console.log('🔗 Checking application links for closed internships...');
    // Check application links to detect closed internships (sample a few)
    internships = await checkApplicationLinks(internships);

    // Add IDs and ensure database compatibility
    internships = internships.map((internship: any, index: number) => {
      const now = new Date().toISOString();
      // Only include fields that exist in database schema
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
        created_at: now,
        updated_at: now
      };
    });
    
    console.log(`📊 Found ${internships.length} internships, updating database...`);
    
    // Use Supabase admin client for server-side operations
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    // Clear existing internships for fresh data
    console.log('🗑️ Clearing existing internship data...');
    const { error: deleteError } = await supabaseAdmin
      .from('internships')
      .delete()
      .neq('id', ''); // Delete all records (neq with empty string matches all)
    
    if (deleteError) {
      console.warn('Warning: Could not clear existing data:', deleteError.message);
    } else {
      console.log('✅ Existing data cleared successfully');
    }
    
    // Insert fresh internships
    const { data, error } = await supabaseAdmin
      .from('internships')
      .insert(internships);
    
    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }
    
    // Log the scrape run
    await supabaseAdmin.from('scrape_logs').insert({
      run_id: `vercel_${Date.now()}`,
      status: 'success',
      internships_found: internships.length,
      internships_added: internships.length, // Simplified for now
      internships_updated: 0,
      completed_at: new Date().toISOString()
    });
    
    return {
      success: true,
      internshipsFound: internships.length,
      updated: 0,
      added: internships.length
    };
    
  } catch (error) {
    console.error('Scraper error:', error);
    
    // Log the failed run
    if (supabaseAdmin) {
      await supabaseAdmin.from('scrape_logs').insert({
        run_id: `vercel_${Date.now()}`,
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      });
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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