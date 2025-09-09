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
    console.log('🔄 Fetching internships from GitHub...');
    
    // Fetch the README from GitHub
    const response = await fetch('https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/main/README.md');
    
    if (!response.ok) {
      throw new Error(`GitHub fetch failed: ${response.status}`);
    }
    
    const content = await response.text();
    const internships = parseInternshipsFromMarkdown(content);
    
    if (internships.length === 0) {
      return { success: false, error: 'No internships found in GitHub README' };
    }
    
    console.log(`📊 Found ${internships.length} internships, updating database...`);
    
    // Use Supabase admin client for server-side operations
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    // Bulk upsert internships
    const { data, error } = await supabaseAdmin
      .from('internships')
      .upsert(internships, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
    
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
  // Simplified parser - you can move your Python parsing logic here
  // or call a more comprehensive parser
  
  const lines = content.split('\n');
  const internships: any[] = [];
  
  // Find the table start
  let tableStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('| Company | Role | Location |')) {
      tableStart = i + 2; // Skip header and separator
      break;
    }
  }
  
  if (tableStart === -1) {
    console.warn('Table not found in markdown');
    return [];
  }
  
  // Parse table rows
  for (let i = tableStart; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line || !line.startsWith('|') || line === '---') {
      continue;
    }
    
    const parts = line.split('|').map(p => p.trim()).filter(p => p);
    
    if (parts.length < 4) continue;
    
    const company = cleanText(parts[0]);
    const role = cleanText(parts[1]);
    const location = cleanText(parts[2]);
    const link = extractLink(parts[3]);
    const datePosted = parts[4] ? cleanText(parts[4]) : 'Unknown';
    
    if (company && role && location) {
      // Detect requirements from role and company text
      const requirements = detectSponsorshipRequirements(`${company} ${role}`);
      
      const internship = {
        id: generateId(company, role, location),
        company,
        role,
        category: categorizeRole(role),
        locations: [location],
        application_link: link,
        date_posted: datePosted,
        requires_citizenship: requirements.requiresCitizenship,
        no_sponsorship: requirements.noSponsorship,
        is_subsidiary: company.includes('↳'),
        is_freshman_friendly: false, // Simplified
        is_closed: requirements.isClosed,
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      internships.push(internship);
    }
  }
  
  return internships;
}

function extractEmojiInfo(text: string): { requiresCitizenship: boolean, noSponsorship: boolean, isClosed: boolean, cleanedText: string } {
  if (!text) return { requiresCitizenship: false, noSponsorship: false, isClosed: false, cleanedText: text };

  let workingText = text;
  let requiresCitizenship = false;
  let noSponsorship = false;
  let isClosed = false;

  // Check for patterns and flags BEFORE removing them
  // 1. Check for corrupted US flag patterns
  if (workingText.includes('ðºð¸') || workingText.includes('🇺🇸') || 
      workingText.includes('\ud83c\uddfa\ud83c\uddf8') || 
      workingText.includes('\\ud83c\\uddfa\\ud83c\\uddf8')) {
    requiresCitizenship = true;
  }
  
  // 2. Check for corrupted no sponsorship patterns
  if (workingText.includes('ð') || workingText.includes('🛂') || 
      workingText.includes('\ud83d\udec2') || 
      workingText.includes('\\ud83d\\udec2')) {
    noSponsorship = true;
  }
  
  // 3. Check for closed/lock patterns
  if (workingText.includes('🔒') || workingText.includes('\ud83d\udd12') || 
      workingText.includes('\\ud83d\\udd12')) {
    isClosed = true;
  }

  // Now truncate at emoji characters - remove everything from the emoji onwards
  let cleanedText = workingText;
  
  // Define truncation patterns - find the FIRST occurrence and cut there
  const truncationPatterns = [
    'ðºð¸',   // Corrupted US flag
    'ð',      // Corrupted no sponsorship (but NOT ↳)
    '🇺🇸',    // Proper US flag
    '🛂',      // Proper no sponsorship
    '🔒',      // Proper lock
    '\\ud83d\\udec2',    // Escaped no sponsorship
    '\\ud83c\\uddfa\\ud83c\\uddf8',  // Escaped US flag
    '\\ud83d\\udd12',    // Escaped lock
    '\ud83d\udec2',      // Direct no sponsorship
    '\ud83c\uddfa\ud83c\uddf8',  // Direct US flag
    '\ud83d\udd12',      // Direct lock
  ];
  
  // Find the earliest emoji position to truncate
  let earliestPosition = cleanedText.length;
  let foundPattern = '';
  
  for (const pattern of truncationPatterns) {
    const position = cleanedText.indexOf(pattern);
    if (position !== -1 && position < earliestPosition) {
      earliestPosition = position;
      foundPattern = pattern;
    }
  }
  
  // Truncate at the emoji if found
  if (earliestPosition < cleanedText.length) {
    cleanedText = cleanedText.substring(0, earliestPosition);
  }
  
  // Handle subsidiary arrow separately (convert but don't truncate)
  cleanedText = cleanedText.replace(/â³/g, '↳');
  cleanedText = cleanedText.replace(/\\u21b3/g, '↳');
  
  // Clean up extra spaces and trim
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
  
  // Remove markdown links
  cleanedText = cleanedText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  return { requiresCitizenship, noSponsorship, isClosed, cleanedText };
}

function cleanText(text: string): string {
  const { cleanedText } = extractEmojiInfo(text);
  return cleanedText;
}

function detectSponsorshipRequirements(text: string): { requiresCitizenship: boolean, noSponsorship: boolean, isClosed: boolean } {
  const { requiresCitizenship, noSponsorship, isClosed } = extractEmojiInfo(text);
  return { requiresCitizenship, noSponsorship, isClosed };
}

function extractLink(cell: string): string | null {
  const match = cell.match(/\(([^)]+)\)/);
  return match ? match[1] : null;
}

function generateId(company: string, role: string, location: string): string {
  const crypto = require('crypto');
  const unique = `${company}-${role}-${location}`;
  return crypto.createHash('md5').update(unique).digest('hex');
}

function categorizeRole(role: string): string {
  const roleMap: Record<string, string[]> = {
    'Software Engineering': ['software engineer', 'swe', 'software development', 'software dev', 'programmer', 'coding', 'programming'],
    'Full Stack': ['full stack', 'fullstack', 'full-stack'],
    'Front End': ['frontend', 'front-end', 'front end', 'ui', 'user interface', 'react', 'vue', 'angular'],
    'Back End': ['backend', 'back-end', 'back end', 'server', 'api', 'database', 'microservices'],
    'AI/ML': ['ai', 'artificial intelligence', 'ml', 'machine learning', 'deep learning', 'neural network', 'nlp', 'computer vision'],
    'Data Science': ['data science', 'data scientist', 'predictive analytics', 'statistical analysis', 'big data'],
    'Data Engineering': ['data engineer', 'data pipeline', 'data warehouse', 'etl', 'data platform'],
    'DevOps': ['devops', 'infrastructure', 'ci/cd', 'docker', 'kubernetes', 'terraform', 'cloud ops'],
    'Mobile': ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
    'Security': ['security', 'cybersecurity', 'cyber', 'infosec', 'penetration test', 'vulnerability'],
    'Product Management': ['product manager', 'product management', 'pm', 'product owner', 'product strategy'],
    'Quant/Trading': ['quant', 'quantitative', 'trading', 'algorithmic trading', 'financial engineering', 'derivatives', 'risk management', 'portfolio', 'hedge fund', 'prop trading'],
    'Research': ['research', 'researcher', 'research scientist', 'r&d', 'research engineer', 'applied research'],
    'Business Analyst': ['business analyst', 'business intelligence', 'requirements analyst', 'process analyst'],
    'Data Analyst': ['data analyst', 'business analyst', 'reporting analyst', 'analytics', 'tableau', 'power bi'],
    'Hardware Engineering': ['hardware', 'hardware engineer', 'electrical', 'embedded', 'firmware', 'vlsi', 'asic', 'fpga'],
    'Systems Engineering': ['systems engineer', 'systems', 'distributed systems', 'platform engineer'],
    'Cloud Engineering': ['cloud', 'aws', 'azure', 'gcp', 'cloud engineer', 'cloud architect'],
    'Site Reliability Engineering': ['sre', 'site reliability', 'reliability engineer', 'production engineer'],
    'Information Technology': ['information technology', 'it', 'it support', 'systems admin', 'network admin'],
    'Quality Assurance': ['qa', 'quality assurance', 'test', 'testing', 'automation test', 'sdet'],
    'UX/UI Design': ['ux', 'ui', 'user experience', 'user interface', 'design', 'interaction design', 'visual design'],
    'Sales Engineering': ['sales engineer', 'solutions engineer', 'technical sales', 'pre-sales'],
    'Technical Program Management': ['technical program manager', 'tpm', 'program manager', 'project manager']
  };
  
  const lowerRole = role.toLowerCase();
  
  for (const [category, keywords] of Object.entries(roleMap)) {
    if (keywords.some(keyword => lowerRole.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
}