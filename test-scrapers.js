// Test script to debug scraper inflation
async function testParsers() {
  console.log('🔍 Testing scraper parsers...');
  
  // Test primary source (vanshb)
  const primaryUrl = 'https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/main/README.md';
  const primaryResponse = await fetch(primaryUrl);
  const primaryContent = await primaryResponse.text();
  
  console.log('\n📊 Primary Source (vanshb) Analysis:');
  console.log('Content length:', primaryContent.length);
  
  // Count actual markdown table rows properly
  const lines = primaryContent.split('\n');
  let tableRows = 0;
  let inTable = false;
  let foundHeader = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('| Company | Role | Location | Application/Link | Date Posted |')) {
      foundHeader = true;
      // Skip header and separator line
      i++; // Skip separator line
      inTable = true;
      continue;
    }
    
    if (inTable && line.startsWith('|') && !line.includes('---') && line.length > 10) {
      tableRows++;
    }
    
    // Stop when we hit an empty line or non-table content
    if (inTable && (!line.startsWith('|') || line === '')) {
      break;
    }
  }
  
  console.log('Header found:', foundHeader);
  console.log('Actual markdown table rows:', tableRows);
  
  // Test SimplifyJobs source  
  const simplifyUrl = 'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/refs/heads/dev/README.md';
  const simplifyResponse = await fetch(simplifyUrl);
  const simplifyContent = await simplifyResponse.text();
  
  console.log('\n📊 SimplifyJobs Source Analysis:');
  console.log('Content length:', simplifyContent.length);
  
  // Count actual <tr> tags with internship data
  const trMatches = simplifyContent.match(/<tr>/g);
  const trCount = trMatches ? trMatches.length : 0;
  
  // More precise count - exclude header rows
  const trElements = simplifyContent.split('<tr>');
  let internshipRows = 0;
  let sampleRows = [];
  
  for (const tr of trElements) {
    // Skip if it's a header row or empty
    if (tr.includes('<th>') || tr.trim().length < 50) {
      continue;
    }
    // Count if it has actual internship data (company name, etc.)
    if (tr.includes('<td>') && !tr.includes('Company</th>')) {
      internshipRows++;
      if (sampleRows.length < 3) {
        sampleRows.push(tr.substring(0, 200) + '...');
      }
    }
  }
  
  console.log('Sample <tr> content:');
  sampleRows.forEach((sample, i) => {
    console.log(`Row ${i + 1}: ${sample}`);
  });
  
  console.log('Total <tr> tags:', trCount);
  console.log('Internship <tr> rows (excluding headers):', internshipRows);
  
  console.log('\n🔍 Expected vs Actual:');
  console.log('Expected total: ~287 internships (180 + 107)');
  console.log('Raw parsing found:', tableRows + internshipRows);
}

testParsers().catch(console.error);