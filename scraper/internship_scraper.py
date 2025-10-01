import requests
import re
import json
import schedule
import time
from datetime import datetime

class OptimizedInternshipScraper:
    def __init__(self):
        self.base_url = "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/refs/heads/dev/README.md"
        self.internships = []
        
        # Role categorization keywords (PRIORITY ORDER: specific → generic)
        self.role_categories = {
            'Quant/Trading': ['quant', 'quantitative', 'trading', 'algorithmic trading', 'financial engineering', 'prop trading'],
            'Hardware Engineering': ['hardware engineer', 'hardware', 'electrical engineer', 'electrical', 'embedded', 'firmware', 'semiconductor', 'asic', 'vlsi', 'circuit design', 'chip design', 'pcb', 'fpga', 'rtl', 'verilog', 'equipment engineering'],
            'AI/ML': ['artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'computer vision', 'generative ai', 'llm', 'ai', 'ml', 'nlp', 'data science', 'data scientist'],
            'Full Stack': ['full stack', 'fullstack', 'full-stack'],
            'Mobile': ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
            'DevOps': ['devops', 'infrastructure', 'ci/cd', 'docker', 'kubernetes', 'terraform', 'cloud ops', 'sre', 'site reliability'],
            'Data Engineering': ['data engineer', 'data pipeline', 'data warehouse', 'etl', 'data platform'],
            'Security': ['security', 'cybersecurity', 'cyber', 'infosec', 'penetration test', 'appsec'],
            'Product Management': ['product manager', 'product management', 'product owner', 'product strategist', 'pm'],
            'Cloud Engineering': ['cloud engineer', 'cloud architect', 'aws', 'azure', 'gcp'],
            'Front End': ['frontend', 'front-end', 'front end', 'react', 'vue', 'angular', 'web developer'],
            'Back End': ['backend', 'back-end', 'back end', 'server', 'api', 'microservices'],
            'Quality Assurance': ['quality assurance', 'automation test', 'sdet', 'qa', 'test'],
            'UX/UI Design': ['ux design', 'ui design', 'user experience', 'interaction design', 'product design'],
            'Research': ['research scientist', 'research engineer', 'research', 'researcher'],
            'Information Technology': ['information technology', 'it support', 'systems admin', 'it intern', 'network'],
            'Software Engineering': ['software engineer', 'software development', 'software dev', 'programmer', 'coding', 'developer', 'engineer', 'swe']
        }
        
        # Keywords that indicate freshman-friendly positions
        self.freshman_keywords = [
            'freshman', 'first-year', '1st year', 'entry level', 'new grad',
            'no experience required', 'all levels', 'undergrad', 'undergraduate',
            'early career', 'junior', 'intern program', 'diversity', 'inclusion',
            'rising sophomore', 'rising junior'
        ]
        
        # Graduation dates that indicate freshman-friendly (2027-2028 for current freshmen/sophomores)
        self.freshman_graduation_years = ['2027', '2028']
    
    def clean_text(self, text):
        """Clean text by handling unicode and special characters"""
        if not text:
            return text
        
        import re
        
        # First, handle the specific unicode escape sequences
        unicode_replacements = {
            '\\ud83d\\udec2': '🛂',  # No sponsorship emoji  
            '\\ud83c\\uddfa\\ud83c\\uddf8': '🇺🇸',  # US flag emoji
            '\\ud83d\\udd12': '🔒',  # Lock emoji
            '\\ud83d\\udd25': '🔥',  # Fire emoji (FAANG+)
            '\\ud83c\\udf93': '🎓',  # Graduation cap emoji (Advanced degree)
            '\ud83d\udec2': '🛂',  # No sponsorship emoji (direct)
            '\ud83c\uddfa\ud83c\uddf8': '🇺🇸',  # US flag emoji (direct)
            '\ud83d\udd12': '🔒',  # Lock emoji (direct)
            '\ud83d\udd25': '🔥',  # Fire emoji (direct)
            '\ud83c\udf93': '🎓',  # Graduation cap emoji (direct)
        }
        
        for old, new in unicode_replacements.items():
            text = text.replace(old, new)
        
        # Try to decode unicode escape sequences more thoroughly
        try:
            # Handle \uXXXX patterns by decoding them
            import codecs
            text = codecs.decode(text, 'unicode_escape')
        except (UnicodeDecodeError, UnicodeError):
            # If decoding fails, remove the escape sequences
            text = re.sub(r'\\u[0-9a-fA-F]{4}', '', text)
        
        # Clean up extra spaces and trim
        text = ' '.join(text.split())
        
        return text.strip()
    
    def fetch_readme(self):
        """Fetch README content"""
        try:
            response = requests.get(self.base_url)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            print(f"Error fetching README: {e}")
            return None
    
    def find_table_start(self, lines):
        """Find the exact table start line for HTML table"""
        for i, line in enumerate(lines):
            if "<tbody>" in line:
                return i + 1  # Start from next line after <tbody>
        return -1
    
    def extract_application_link(self, cell):
        """Extract href from HTML anchor tag"""
        href_match = re.search(r'href=["\']([^"\']+)["\']', cell)
        return href_match.group(1) if href_match else None
    
    def parse_location(self, location_text):
        """Parse location handling <br> tags and details"""
        if not location_text:
            return ['Remote']

        # Handle details/summary for multiple locations
        if '<details>' in location_text:
            # Try to find content between </summary> and </details>
            content_match = re.search(r'</summary>(.*?)(?:</details>|$)', location_text, re.DOTALL)

            if content_match:
                location_content = content_match.group(1)
                print(f"Raw location content: '{location_content}'")

                # Split by various br tag formats and clean up
                locations = re.split(r'</?br\s*/?>', location_content, flags=re.IGNORECASE)
                cleaned_locations = []

                for loc in locations:
                    # Clean HTML entities and tags
                    cleaned = (loc.replace('&nbsp;', ' ')
                                 .replace('&amp;', '&')
                                 .replace('&lt;', '<')
                                 .replace('&gt;', '>')
                                 .replace('&quot;', '"')
                                 .strip())

                    # Remove any remaining HTML tags
                    cleaned = re.sub(r'<[^>]*>', '', cleaned).strip()

                    # Filter out summary text like "**5 locations**" or "5 locations"
                    if cleaned and not re.match(r'^\*?\*?\d+\s+locations?\*?\*?$', cleaned, re.IGNORECASE):
                        cleaned_locations.append(cleaned)

                print(f"Parsed locations from details: {cleaned_locations}")
                return cleaned_locations if cleaned_locations else ['Multiple Locations']
            else:
                # If details tag is malformed, try fallback parsing
                fallback_match = re.search(r'\d+\s+locations.*?>(.*?)(?:<|$)', location_text, re.DOTALL)
                if fallback_match:
                    fallback_content = fallback_match.group(1)
                    locations = re.split(r'</?br\s*/?>', fallback_content, flags=re.IGNORECASE)
                    cleaned_locations = []

                    for loc in locations:
                        cleaned = re.sub(r'<[^>]*>', '', loc).strip()
                        if cleaned and not re.match(r'^\d+\s+locations?$', cleaned, re.IGNORECASE):
                            cleaned_locations.append(cleaned)

                    if cleaned_locations:
                        print(f"Parsed locations from malformed details: {cleaned_locations}")
                        return cleaned_locations

        # Handle regular location text - check for <br> tags
        if re.search(r'</?br\s*/?>', location_text, re.IGNORECASE):
            locations = re.split(r'</?br\s*/?>', location_text, flags=re.IGNORECASE)
            cleaned_locations = []

            for loc in locations:
                cleaned = re.sub(r'<[^>]*>', '', loc).strip()
                # Clean HTML entities
                cleaned = (cleaned.replace('&nbsp;', ' ')
                                 .replace('&amp;', '&')
                                 .replace('&lt;', '<')
                                 .replace('&gt;', '>')
                                 .replace('&quot;', '"')
                                 .strip())

                # Filter out location count text
                if cleaned and not re.match(r'^\*?\*?\d+\s+locations?\*?\*?$', cleaned, re.IGNORECASE):
                    cleaned_locations.append(cleaned)

            if cleaned_locations:
                print(f"Parsed locations from br tags: {cleaned_locations}")
                return cleaned_locations

        # Otherwise clean and parse as single location
        cleaned = re.sub(r'<[^>]*>', '', location_text).strip()
        # Clean HTML entities
        cleaned = (cleaned.replace('&nbsp;', ' ')
                          .replace('&amp;', '&')
                          .replace('&lt;', '<')
                          .replace('&gt;', '>')
                          .replace('&quot;', '"')
                          .strip())

        # Skip if it contains location count pattern (parsing failed)
        if re.match(r'^\*?\*?\d+\s+locations?\*?\*?', cleaned, re.IGNORECASE) or 'location' in cleaned.lower():
            print(f"Failed to parse location: {cleaned}")
            return ['Multiple Locations']

        return [cleaned] if cleaned else ['Remote']
    
    def categorize_role(self, role):
        """Categorize role using word boundary matching to prevent false positives"""
        import re
        role_lower = role.lower()

        # Use word boundary matching to prevent false positives
        # Example: "equipment" contains "ui" but shouldn't match "Front End"
        for category, keywords in self.role_categories.items():
            for keyword in keywords:
                # Use word boundaries \b for exact word matching
                pattern = r'\b' + re.escape(keyword) + r'\b'
                if re.search(pattern, role_lower, re.IGNORECASE):
                    return category

        return 'Other'
    
    def is_freshman_friendly(self, role_text, company_text):
        """Determine if internship is freshman-friendly based on keywords and graduation dates"""
        combined_text = f"{role_text} {company_text}".lower()
        
        # Check for explicit freshman-friendly keywords
        if any(keyword in combined_text for keyword in self.freshman_keywords):
            return True
        
        # Check for graduation date patterns
        import re
        
        # Look for patterns like "graduating by Dec 2027", "Spring 2028", "class of 2027"
        graduation_patterns = [
            r'graduating\s+by\s+\w*\s*20(27|28)',
            r'graduation\s+date.*20(27|28)',
            r'class\s+of\s+20(27|28)',
            r'(spring|fall|summer|winter)\s+20(27|28)',
            r'dec\w*\s+20(27|28)',
            r'may\s+20(27|28)',
            r'20(27|28)\s+grad'
        ]
        
        for pattern in graduation_patterns:
            if re.search(pattern, combined_text, re.IGNORECASE):
                return True
        
        # Check for exclusions that indicate NOT freshman-friendly
        exclusion_keywords = [
            'senior', 'senior year', 'final year', 'graduating senior',
            'masters', 'phd', 'graduate student', 'returning intern',
            'previous internship experience', 'prior experience required'
        ]
        
        # If it has exclusion keywords, it's NOT freshman-friendly
        if any(keyword in combined_text for keyword in exclusion_keywords):
            return False
        
        return False
    
    def parse_requirements(self, role_text, application_text, company_html=""):
        """Parse citizenship and sponsorship requirements"""
        combined_text = f"{role_text} {application_text} {company_html}"

        # Enhanced fire emoji detection - check original HTML too
        is_faang = ('🔥' in combined_text or
                   '\\ud83d\\udd25' in combined_text or
                   '\ud83d\udd25' in combined_text)

        return {
            'requires_citizenship': '🇺🇸' in combined_text,
            'no_sponsorship': '🛂' in combined_text,
            'is_closed': '🔒' in combined_text,
            'is_faang': is_faang,
            'requires_advanced_degree': '🎓' in combined_text
        }
    
    def extract_company_from_html(self, html):
        """Enhanced company extraction that handles <strong> tags and <a> tags properly"""
        import re

        # First, check if there's a <strong> tag and extract its content
        strong_match = re.search(r'<strong>(.*?)</strong>', html)
        if strong_match:
            # Extract the company name from within <strong> tags
            company = strong_match.group(1).strip()

            # Strip any <a> tags from within the <strong> content, keeping only the text
            company = re.sub(r'<a[^>]*>(.*?)</a>', r'\1', company)

            # Clean any remaining HTML entities
            company = (company.replace('&nbsp;', ' ')
                             .replace('&amp;', '&')
                             .replace('&lt;', '<')
                             .replace('&gt;', '>')
                             .replace('&quot;', '"')
                             .strip())
            return company

        # Check for <a> tags at the top level (outside of <strong>)
        a_tag_match = re.search(r'<a[^>]*>(.*?)</a>', html)
        if a_tag_match:
            company = a_tag_match.group(1).strip()
            # Clean any remaining HTML entities
            company = (company.replace('&nbsp;', ' ')
                             .replace('&amp;', '&')
                             .replace('&lt;', '<')
                             .replace('&gt;', '>')
                             .replace('&quot;', '"')
                             .strip())
            return company

        # If no <strong> or <a> tags, use standard extraction
        return re.sub(r'<[^>]+>', '', html).strip()

    def parse_html_table_row(self, line):
        """Parse HTML table row to extract cell contents"""
        # Extract content between <td> tags
        cells = re.findall(r'<td[^>]*>(.*?)</td>', line, re.DOTALL)
        if len(cells) < 5:
            return None

        # Extract text content from HTML
        company_html, role_html, location_html, application_html, age_html = cells

        # Clean company name using enhanced function for <strong> tags
        company = self.extract_company_from_html(company_html)

        # Clean role (preserve emojis)
        role = re.sub(r'<[^>]+>', '', role_html).strip()

        # Clean location
        location = location_html.strip()

        # Application stays as HTML to extract links
        application = application_html.strip()

        # Age becomes date_posted
        date_posted = re.sub(r'<[^>]+>', '', age_html).strip()

        return company, role, location, application, date_posted
    
    def parse_internships(self, content):
        """Main parsing logic for HTML table format"""
        # Use regex to find all complete table rows
        table_rows = re.findall(r'<tr>\s*(.*?)\s*</tr>', content, re.DOTALL)
        
        if not table_rows:
            print("No table rows found")
            return []
        
        current_company = None
        self.internships = []
        
        # Process each table row
        for row in table_rows:
            # First extract the raw cells to get company HTML
            raw_cells = re.findall(r'<td[^>]*>(.*?)</td>', f'<tr>{row}</tr>', re.DOTALL)
            if len(raw_cells) < 5:
                continue

            company_html = raw_cells[0]  # Raw company cell HTML

            # Parse HTML table row
            row_data = self.parse_html_table_row(f'<tr>{row}</tr>')
            if not row_data:
                continue

            company, role, location, application, date_posted = row_data

            # Extract company from HTML properly (handles <strong> tags)
            company = self.extract_company_from_html(company_html)
            role = self.clean_text(role)

            # Skip if company is empty (likely header row)
            if not company:
                continue

            # Handle subsidiary companies (↳)
            is_subsidiary = company.startswith('↳')
            if is_subsidiary:
                company = current_company
            else:
                current_company = company

            # Parse location
            locations = self.parse_location(location)

            # Extract application link
            app_link = self.extract_application_link(application)

            # Parse requirements (pass raw company HTML for better emoji detection)
            requirements = self.parse_requirements(role, application, company_html)
            
            # Skip if closed (optional - you might want to keep for tracking)
            if requirements['is_closed']:
                continue
            
            # Check if freshman-friendly
            is_frosh_friendly = self.is_freshman_friendly(role, company)
            
            internship = {
                'company': company,
                'role': role,
                'category': self.categorize_role(role),
                'locations': locations,
                'application_link': app_link,
                'date_posted': date_posted,
                'requires_citizenship': requirements['requires_citizenship'],
                'no_sponsorship': requirements['no_sponsorship'],
                'is_subsidiary': is_subsidiary,
                'is_freshman_friendly': is_frosh_friendly,
                'is_faang': requirements['is_faang'],
                'requires_advanced_degree': requirements['requires_advanced_degree']
            }
            
            self.internships.append(internship)
        
        return self.internships
    
    def scrape(self):
        """Main scraping method"""
        print(f"[{datetime.now()}] Scraping Summer 2026 internships...")
        
        content = self.fetch_readme()
        if not content:
            return []
        
        internships = self.parse_internships(content)
        print(f"Parsed {len(internships)} active internships")
        
        # Log freshman-friendly count
        freshman_count = sum(1 for i in internships if i.get('is_freshman_friendly', False))
        print(f"Found {freshman_count} freshman-friendly internships")
        
        return internships
    
    def export_json(self, filename='internships.json'):
        """Export to JSON"""
        data = {
            'last_updated': datetime.now().isoformat(),
            'total_count': len(self.internships),
            'freshman_friendly_count': sum(1 for i in self.internships if i.get('is_freshman_friendly', False)),
            'internships': self.internships
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Exported to {filename}")
    
    def get_filtered_data(self, category=None, location=None, sponsorship_ok=None, freshman_friendly=None):
        """Get filtered internships for frontend"""
        filtered = self.internships
        
        if category and category != 'All':
            filtered = [i for i in filtered if i['category'] == category]
        
        if location and location != 'All':
            filtered = [i for i in filtered if any(location.lower() in loc.lower() 
                       for loc in i['locations'])]
        
        if sponsorship_ok is not None:
            if sponsorship_ok:
                filtered = [i for i in filtered if not i['no_sponsorship']]
        
        if freshman_friendly is not None:
            filtered = [i for i in filtered if i.get('is_freshman_friendly', False) == freshman_friendly]
        
        return filtered
    
    def auto_scrape(self):
        """Automated scraping with error handling"""
        try:
            internships = self.scrape()
            if internships:
                self.export_json()
                
                # Log stats
                categories = {}
                for i in internships:
                    cat = i['category']
                    categories[cat] = categories.get(cat, 0) + 1
                
                print(f"Categories: {categories}")
        except Exception as e:
            print(f"Scraping error: {e}")
    
   

    def start_scheduler(self):
        """Start 30-minute scheduled scraping"""
        print("Starting scheduler - every 30 minutes")
        
        # Run immediately
        self.auto_scrape()
        
        # Schedule
        schedule.every(30).minutes.do(self.auto_scrape)
        
        while True:
            schedule.run_pending()
            time.sleep(60)

# Usage
if __name__ == "__main__":
    def deduplicate_internships(internships):
        unique = {}
        for i in internships:
            link_or_loc = i['application_link'] or (i['locations'][0] if i['locations'] else "")
            key = (i['company'].strip().lower(), i['role'].strip().lower(), link_or_loc.strip().lower())
            if key not in unique:
                unique[key] = i
        return list(unique.values())
    
    scraper = OptimizedInternshipScraper()
    
    # One-time run
    internships = scraper.scrape()
    internships = deduplicate_internships(internships)
    scraper.export_json()
    freshman_jobs = scraper.get_filtered_data(freshman_friendly=True)
    print(f"After deduplication: {len(internships)} total internships")
    # Get filtered data examples
    # ai_jobs = scraper.get_filtered_data(category='AI/ML')
    # sf_jobs = scraper.get_filtered_data(location='San Francisco')
    # sponsorship_friendly = scraper.get_filtered_data(sponsorship_ok=True)
    # freshman_jobs = scraper.get_filtered_data(freshman_friendly=True)