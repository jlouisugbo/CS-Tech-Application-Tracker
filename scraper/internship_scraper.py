import requests
import re
import json
import schedule
import time
from datetime import datetime

class OptimizedInternshipScraper:
    def __init__(self):
        self.base_url = "https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/main/README.md"
        self.internships = []
        
        # Role categorization keywords
        self.role_categories = {
            'Full Stack': ['full stack', 'fullstack'],
            'Front End': ['front end', 'frontend', 'ui', 'ux', 'user experience', 'user interface'],
            'Back End': ['back end', 'backend', 'server'],
            'AI/ML': ['ai', 'ml', 'machine learning', 'artificial intelligence', 'data science', 'data scientist'],
            'DevOps': ['devops', 'infrastructure', 'sre', 'site reliability', 'cloud'],
            'Mobile': ['mobile', 'ios', 'android', 'react native'],
            'Security': ['security', 'cybersecurity', 'cyber'],
            'Data': ['data engineer', 'data analyst', 'analytics'],
            'Product': ['product manager', 'product management', 'pm'],
            'Information Technology': ['information technology', 'it intern', 'it support', 'systems admin', 'network'],
            'Software Engineering': ['software engineer', 'swe', 'engineer', 'developer', 'programming', 'software']
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
            '\ud83d\udec2': '🛂',  # No sponsorship emoji (direct)
            '\ud83c\uddfa\ud83c\uddf8': '🇺🇸',  # US flag emoji (direct)
            '\ud83d\udd12': '🔒',  # Lock emoji (direct)
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
        """Find the exact table start line"""
        for i, line in enumerate(lines):
            if "| Company | Role | Location | Application/Link | Date Posted |" in line:
                return i + 2  # Skip header and separator line
        return -1
    
    def extract_application_link(self, cell):
        """Extract href from HTML anchor tag"""
        href_match = re.search(r'href=["\']([^"\']+)["\']', cell)
        return href_match.group(1) if href_match else None
    
    def parse_location(self, location_text):
        """Parse location handling <br> tags and details"""
        # Handle details/summary for multiple locations
        if '<details>' in location_text:
            summary_match = re.search(r'<summary>\*\*(\d+)\s+locations?\*\*</summary>', location_text)
            if summary_match:
                return [f"{summary_match.group(1)} locations"]
        
        # Split by <br> or </br>
        locations = re.split(r'</?br/?>', location_text)
        return [loc.strip() for loc in locations if loc.strip()]
    
    def categorize_role(self, role):
        """Categorize role based on keywords"""
        role_lower = role.lower()
        
        # Check each category
        for category, keywords in self.role_categories.items():
            if any(keyword in role_lower for keyword in keywords):
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
    
    def parse_requirements(self, role_text, application_text):
        """Parse citizenship and sponsorship requirements"""
        combined_text = f"{role_text} {application_text}"
        
        return {
            'requires_citizenship': '🇺🇸' in combined_text,
            'no_sponsorship': '🛂' in combined_text,
            'is_closed': '🔒' in combined_text
        }
    
    def parse_internships(self, content):
        """Main parsing logic - your optimized approach"""
        lines = content.split('\n')
        
        # Find guaranteed starting point
        table_start = self.find_table_start(lines)
        if table_start == -1:
            print("Table header not found")
            return []
        
        current_company = None
        self.internships = []
        
        # Process each line after table start
        for line in lines[table_start:]:
            line = line.strip()
            
            # Skip empty lines and non-table content
            if not line or not line.startswith('|'):
                continue
            
            # Split by | and remove first empty element
            parts = [part.strip() for part in line.split('|')]
            parts = parts[1:-1]  # Remove empty first and last elements
            
            if len(parts) < 5:
                continue
            
            company, role, location, application, date_posted = parts
            
            # Clean text fields
            company = self.clean_text(company)
            role = self.clean_text(role)
            
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
            
            # Parse requirements
            requirements = self.parse_requirements(role, application)
            
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
                'is_freshman_friendly': is_frosh_friendly  # New field
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