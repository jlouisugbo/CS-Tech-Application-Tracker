// Lightweight cron service that can be deployed anywhere
const fetch = require('node-fetch');
const cron = require('node-cron');

const SCRAPER_URL = process.env.SCRAPER_URL || 'https://your-app.vercel.app/api/scrape';
const CRON_SECRET = process.env.CRON_SECRET || 'your_secure_cron_secret_12345';

// Run every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log(`🕐 Running scraper at ${new Date().toISOString()}`);
  
  try {
    const response = await fetch(SCRAPER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Scraper success: ${result.internships} internships found`);
    } else {
      console.error(`❌ Scraper failed: ${result.error}`);
    }
  } catch (error) {
    console.error(`💥 Network error: ${error.message}`);
  }
});

// Health check endpoint
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'internship-scraper-cron',
    nextRun: 'Every 30 minutes',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Cron service running on port ${PORT}`);
  console.log(`📅 Scraper scheduled to run every 30 minutes`);
});