import os
from supabase import create_client, Client
import hashlib
from datetime import datetime
from typing import List, Dict, Any
from pathlib import Path

# Load environment variables from .env file
def load_env_file():
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("SUPABASE_URL:", SUPABASE_URL)
print("SUPABASE_KEY length:", len(SUPABASE_KEY))

# Load environment variables
load_env_file()

class DatabaseManager:
    def __init__(self):
        # Debug environment variables
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        print(f"Debug - SUPABASE_URL: {supabase_url}")
        print(f"Debug - SUPABASE_KEY: {supabase_key[:20]}..." if supabase_key else "Debug - SUPABASE_KEY: None")
        
        if not supabase_url or not supabase_key:
            raise Exception("Missing SUPABASE_URL or SUPABASE_KEY environment variables")
        
        # Initialize Supabase client
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
    def generate_record_hash(self, internship: Dict) -> str:
        """Generate unique hash for each internship record"""
        # Create hash from company + role + locations
        unique_string = f"{internship['company']}-{internship['role']}-{'-'.join(internship['locations'])}"
        return hashlib.md5(unique_string.encode()).hexdigest()
    
    def prepare_records(self, internships: List[Dict]) -> List[Dict]:
        """Prepare records with hashes and timestamps"""
        prepared = []
        current_time = datetime.now().isoformat()
        
        for internship in internships:
            record = {
                'id': self.generate_record_hash(internship),
                'company': internship['company'],
                'role': internship['role'],
                'category': internship['category'],
                'locations': internship['locations'],  # JSON array
                'application_link': internship['application_link'],
                'date_posted': internship['date_posted'],
                'requires_citizenship': internship['requires_citizenship'],
                'no_sponsorship': internship['no_sponsorship'],
                'is_subsidiary': internship['is_subsidiary'],
                'is_freshman_friendly': internship.get('is_freshman_friendly', False),  # New field
                'last_seen': current_time,
                'is_active': True
            }
            prepared.append(record)
        
        return prepared
    
    def bulk_upsert_internships(self, internships: List[Dict]) -> bool:
        """
        Efficient bulk upsert using Supabase's upsert functionality
        This is MUCH more efficient than individual requests
        """
        try:
            prepared_records = self.prepare_records(internships)
            
            # Single bulk upsert operation - handles insert/update automatically
            result = self.supabase.table('internships').upsert(
                prepared_records,
                on_conflict='id'  # Use our hash as primary key
            ).execute()
            
            print(f"Bulk upserted {len(prepared_records)} records")
            return True
            
        except Exception as e:
            print(f"Bulk upsert error: {e}")
            return False
    
    def mark_stale_records(self, current_batch_hashes: List[str]) -> bool:
        """Mark records not in current scrape as inactive (efficient batch update)"""
        try:
            # Single query to mark all non-current records as inactive
            result = self.supabase.table('internships').update({
                'is_active': False,
                'marked_inactive_at': datetime.now().isoformat()
            }).not_.in_('id', current_batch_hashes).execute()
            
            print(f"Marked stale records as inactive")
            return True
            
        except Exception as e:
            print(f"Error marking stale records: {e}")
            return False
    
    def get_active_internships(self, filters: Dict = None) -> List[Dict]:
        """Get active internships with optional filters (single query)"""
        try:
            query = self.supabase.table('internships').select('*').eq('is_active', True)
            
            # Apply filters efficiently in single query
            if filters:
                if filters.get('category') and filters['category'] != 'All':
                    query = query.eq('category', filters['category'])
                
                if filters.get('no_citizenship_required'):
                    query = query.eq('requires_citizenship', False)
                
                if filters.get('sponsorship_available'):
                    query = query.eq('no_sponsorship', False)
                
                if filters.get('freshman_friendly'):
                    query = query.eq('is_freshman_friendly', True)
                
                if filters.get('location'):
                    # Use PostgreSQL JSON operators for location search
                    query = query.contains('locations', [filters['location']])
            
            result = query.execute()
            return result.data
            
        except Exception as e:
            print(f"Error fetching internships: {e}")
            return []
    
    def get_stats(self) -> Dict:
        """Get aggregated stats with efficient SQL"""
        try:
            # Single query for total count
            total_result = self.supabase.table('internships').select('id', count='exact').eq('is_active', True).execute()
            
            # Get freshman-friendly count
            freshman_result = self.supabase.table('internships').select('id', count='exact').eq('is_active', True).eq('is_freshman_friendly', True).execute()
            
            # Single query for category breakdown
            category_result = self.supabase.rpc('get_category_counts').execute()
            
            return {
                'total_active': total_result.count,
                'freshman_friendly_count': freshman_result.count,
                'categories': category_result.data,
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting stats: {e}")
            return {}
    
    def log_scrape_start(self) -> str:
        """Log start of scraping session"""
        try:
            # Match your actual scrape_logs schema
            result = self.supabase.table('scrape_logs').insert({
                'scrape_date': datetime.now().isoformat(),
                'success': False,  # Will update on completion
                'total_found': 0,
                'new_internships': 0,
                'updated_internships': 0,
                'removed_internships': 0,
                'scrape_duration_seconds': 0
            }).execute()
            
            return result.data[0]['id'] if result.data else None
        except Exception as e:
            print(f"Error logging scrape start: {e}")
            return None
    
    def log_scrape_completion(self, log_id: str, stats: Dict, success: bool = True) -> bool:
        """Log completion of scraping session"""
        try:
            # Match your actual scrape_logs schema
            update_data = {
                'success': success,
                'total_found': stats.get('total_found', 0),
                'new_internships': stats.get('new_added', 0),
                'updated_internships': stats.get('updated', 0),
                'removed_internships': stats.get('marked_inactive', 0),
                'scrape_duration_seconds': stats.get('duration_seconds', 0)
            }
            
            if not success and stats.get('error'):
                update_data['error_message'] = str(stats['error'])
            
            result = self.supabase.table('scrape_logs').update(update_data).eq('id', log_id).execute()
            return True
            
        except Exception as e:
            print(f"Error logging scrape completion: {e}")
            return False


# Enhanced scraper with database integration
from internship_scraper import OptimizedInternshipScraper

class InternshipScraperWithDB(OptimizedInternshipScraper):
    """Enhanced scraper with efficient database integration"""
    
    def __init__(self):
        super().__init__()
        self.db = DatabaseManager()
    
    def sync_to_database(self, internships: List[Dict]) -> bool:
        """Efficiently sync scraped data to database"""
        if not internships:
            return False
        
        print(f"Syncing {len(internships)} internships to database...")
        
        # 1. Bulk upsert all current records (single operation)
        success = self.db.bulk_upsert_internships(internships)
        
        if success:
            # 2. Mark records not in current batch as inactive (single operation)
            current_hashes = [self.db.generate_record_hash(i) for i in internships]
            self.db.mark_stale_records(current_hashes)
        
        return success
    
    def scrape_and_sync(self):
        """Main method: scrape and sync to database efficiently"""
        log_id = None
        try:
            # Start logging
            log_id = self.db.log_scrape_start()
            
            # Scrape data
            internships = self.scrape()
            
            if internships:
                # Sync to database with bulk operations
                success = self.sync_to_database(internships)
                
                if success:
                    # Export JSON backup
                    self.export_json()
                    
                    # Log stats
                    stats = self.db.get_stats()
                    print(f"Database sync complete. Total active: {stats.get('total_active', 'unknown')}")
                    print(f"Freshman-friendly: {stats.get('freshman_friendly_count', 0)}")
                    
                    # Log completion
                    if log_id:
                        self.db.log_scrape_completion(log_id, {
                            'total_found': len(internships),
                            'new_added': len(internships),  # Simplified for now
                            'updated': 0,
                            'marked_inactive': 0
                        })
                    
                return success
            else:
                print("No internships found to sync")
                if log_id:
                    self.db.log_scrape_completion(log_id, {'total_found': 0}, success=False)
                return False
                
        except Exception as e:
            print(f"Scrape and sync error: {e}")
            if log_id:
                self.db.log_scrape_completion(log_id, {'error': str(e)}, success=False)
            return False

# Usage for production
if __name__ == "__main__":
    # Set environment variables:
    # export SUPABASE_URL="your-supabase-url"
    # export SUPABASE_KEY="your-supabase-anon-key"
    
    scraper = InternshipScraperWithDB()
    
    # One-time sync
    scraper.scrape_and_sync()
    
    # Get filtered data from database
    ai_jobs = scraper.db.get_active_internships({'category': 'AI/ML'})
    print(f"Found {len(ai_jobs)} AI/ML internships")
    
    # Get freshman-friendly jobs
    freshman_jobs = scraper.db.get_active_internships({'freshman_friendly': True})
    print(f"Found {len(freshman_jobs)} freshman-friendly internships")