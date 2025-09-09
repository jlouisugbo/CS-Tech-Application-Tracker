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
        
        # Role categorization keywords - Updated with comprehensive categories
        self.role_categories = {
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
    
    def extract_emoji_info_and_clean(self, text):
        """Extract emoji information for flags and truncate text at emoji characters"""
        if not text:
            return {'requires_citizenship': False, 'no_sponsorship': False, 'is_closed': False, 'cleaned_text': text}
        
        working_text = text
        requires_citizenship = False
        no_sponsorship = False
        is_closed = False
        
        # Check for patterns BEFORE truncating
        # 1. Check for corrupted/proper US flag patterns
        if any(pattern in working_text for pattern in ['ðºð¸', '🇺🇸', '\\ud83c\\uddfa\\ud83c\\uddf8']):
            requires_citizenship = True
            
        # 2. Check for corrupted/proper no sponsorship patterns  
        if any(pattern in working_text for pattern in ['ð', '🛂', '\\ud83d\\udec2']):
            no_sponsorship = True
            
        # 3. Check for closed/lock patterns
        if any(pattern in working_text for pattern in ['🔒', '\\ud83d\\udd12']):
            is_closed = True
        
        # Now truncate at emoji characters - remove everything from the emoji onwards
        cleaned_text = working_text
        
        # Define truncation patterns - find the FIRST occurrence and cut there
        truncation_patterns = [
            'ðºð¸',   # Corrupted US flag
            'ð',      # Corrupted no sponsorship
            '🇺🇸',    # Proper US flag
            '🛂',      # Proper no sponsorship
            '🔒',      # Proper lock
            '\\ud83d\\udec2',    # Escaped no sponsorship
            '\\ud83c\\uddfa\\ud83c\\uddf8',  # Escaped US flag
            '\\ud83d\\udd12',    # Escaped lock
            '\ud83d\udec2',      # Direct no sponsorship
            '\ud83c\uddfa\ud83c\uddf8',  # Direct US flag
            '\ud83d\udd12',      # Direct lock
        ]
        
        # Find the earliest emoji position to truncate
        earliest_position = len(cleaned_text)
        
        for pattern in truncation_patterns:
            position = cleaned_text.find(pattern)
            if position != -1 and position < earliest_position:
                earliest_position = position
        
        # Truncate at the emoji if found
        if earliest_position < len(cleaned_text):
            cleaned_text = cleaned_text[:earliest_position]
        
        # Handle subsidiary arrow separately (convert but don't truncate)
        cleaned_text = cleaned_text.replace('â³', '↳')
        cleaned_text = cleaned_text.replace('\\u21b3', '↳')
        
        # Clean up extra spaces and trim
        cleaned_text = ' '.join(cleaned_text.split()).strip()
        
        return {
            'requires_citizenship': requires_citizenship,
            'no_sponsorship': no_sponsorship, 
            'is_closed': is_closed,
            'cleaned_text': cleaned_text
        }
    
    def clean_text(self, text):
        """Clean text by truncating at emoji characters"""
        result = self.extract_emoji_info_and_clean(text)
        return result['cleaned_text']
    
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
        
        # Extract emoji info and flags
        result = self.extract_emoji_info_and_clean(combined_text)
        
        return {
            'requires_citizenship': result['requires_citizenship'],
            'no_sponsorship': result['no_sponsorship'],
            'is_closed': result['is_closed']
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
            
            # Handle subsidiary companies (↳) - check BEFORE cleaning text
            raw_company = company.strip()
            is_subsidiary = (raw_company.startswith('↳') or 
                           raw_company.startswith('\u21b3') or 
                           raw_company == '↳' or 
                           raw_company == '\u21b3')
            
            if is_subsidiary:
                company = current_company if current_company else "Unknown Company"
            else:
                # Clean and update current_company if this is a real company name
                company = self.clean_text(company)
                if company and company.strip():
                    current_company = company
            
            # Clean other text fields
            role = self.clean_text(role)
            
            # Parse location
            locations = self.parse_location(location)
            
            # Extract application link
            app_link = self.extract_application_link(application)
            
            # Parse requirements
            requirements = self.parse_requirements(role, application)
            
            # Don't skip closed internships - include them but mark as closed
            # This allows users to see all internships and filter them if needed
            
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
                'is_closed': requirements['is_closed']  # New field for locked/closed internships
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
        
        # Log subsidiary count
        subsidiary_count = sum(1 for i in internships if i.get('is_subsidiary', False))
        print(f"Found {subsidiary_count} subsidiary internships")
        
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
    
    def run_scraper(self):
        """Run scraper and save to database - returns success status"""
        try:
            print(f"[{datetime.now()}] Starting scraper run...")
            
            # Scrape internships
            internships = self.scrape()
            if not internships:
                print("❌ No internships found")
                return False
                
            print(f"✅ Scraped {len(internships)} internships")
            
            # Save to database
            try:
                from database_manager import DatabaseManager
                db = DatabaseManager()
                result = db.bulk_upsert_internships(internships)
                
                if result['success']:
                    print(f"✅ Database updated: {result['inserted']} new, {result['updated']} updated")
                    
                    # Also save JSON backup
                    self.export_json()
                    return True
                else:
                    print(f"❌ Database update failed: {result.get('error', 'Unknown error')}")
                    return False
                    
            except ImportError:
                print("⚠️  Database manager not available, saving to JSON only")
                self.export_json()
                return True
                
        except Exception as e:
            print(f"💥 Scraper error: {e}")
            return False
    
    def start_scheduler(self):
        """Start 30-minute scheduled scraping"""
        print("Starting scheduler - every 30 minutes")
        
        # Run immediately
        self.run_scraper()
        
        # Schedule
        schedule.every(30).minutes.do(self.run_scraper)
        
        while True:
            schedule.run_pending()
            time.sleep(60)

# Usage
if __name__ == "__main__":
    scraper = OptimizedInternshipScraper()
    
    # One-time run
    internships = scraper.scrape()
    scraper.export_json()
    
    # Get filtered data examples
    # ai_jobs = scraper.get_filtered_data(category='AI/ML')
    # sf_jobs = scraper.get_filtered_data(location='San Francisco')
    # sponsorship_friendly = scraper.get_filtered_data(sponsorship_ok=True)
    # freshman_jobs = scraper.get_filtered_data(freshman_friendly=True)