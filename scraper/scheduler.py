import schedule
import time
import logging
from datetime import datetime
from internship_scraper import OptimizedInternshipScraper

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper_schedule.log'),
        logging.StreamHandler()
    ]
)

def run_scraper():
    """Run the scraper and log results"""
    try:
        logging.info("=" * 50)
        logging.info("Starting scheduled scraper run...")
        
        scraper = OptimizedInternshipScraper()
        success = scraper.run_scraper()
        
        if success:
            logging.info(f"✅ Scraper completed successfully at {datetime.now()}")
        else:
            logging.error(f"❌ Scraper failed at {datetime.now()}")
            
    except Exception as e:
        logging.error(f"💥 Scraper crashed: {str(e)}")
        
    logging.info("=" * 50)

def main():
    """Main scheduler loop"""
    logging.info("🚀 Starting GT CS Internship Scraper Scheduler")
    logging.info("⏰ Will run every 30 minutes")
    logging.info("🛑 Press Ctrl+C to stop")
    
    # Schedule the scraper to run every 30 minutes
    schedule.every(30).minutes.do(run_scraper)
    
    # Run once immediately on startup
    logging.info("🏃 Running initial scrape...")
    run_scraper()
    
    # Keep the scheduler running
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        logging.info("🛑 Scheduler stopped by user")

if __name__ == "__main__":
    main()