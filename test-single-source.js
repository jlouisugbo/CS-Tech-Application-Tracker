// Test the single-source SimplifyJobs scraper
async function testSingleSourceScraper() {
  console.log('🔍 Testing single-source SimplifyJobs scraper...');
  
  const simplifyUrl = 'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/refs/heads/dev/README.md';
  const response = await fetch(simplifyUrl);
  const content = await response.text();
  
  console.log('📊 SimplifyJobs Analysis:');
  console.log('Content length:', content.length);
  
  // Parse HTML table rows like our actual scraper does
  const lines = content.split('\n');
  const internships = [];
  
  for (const line of lines) {
    if (line.includes('<tr>')) {
      // Skip header rows
      if (line.includes('<th>') || line.includes('Company</th>')) {
        continue;
      }
      
      // Extract table data
      const tdMatches = line.match(/<td[^>]*>(.*?)<\/td>/g);
      if (tdMatches && tdMatches.length >= 4) {
        try {
          const company = tdMatches[0].replace(/<[^>]*>/g, '').trim();
          const role = tdMatches[1].replace(/<[^>]*>/g, '').trim();
          const location = tdMatches[2].replace(/<[^>]*>/g, '').trim();
          const link = tdMatches[3];
          
          if (company && role && company !== 'Company') {
            internships.push({
              company: company.replace(/[🔥🎯⚡🌟💼🚀⭐]/g, '').trim(),
              role,
              location,
              link
            });
          }
        } catch (e) {
          // Skip malformed rows
        }
      }
    }
  }
  
  console.log('✅ Successfully parsed internships:', internships.length);
  console.log('📝 Sample internships:');
  internships.slice(0, 5).forEach((internship, i) => {
    console.log(`${i + 1}. ${internship.company} - ${internship.role}`);
  });
  
  return internships.length;
}

testSingleSourceScraper().catch(console.error);