# GT Technology Internship Portal

A comprehensive web application for Georgia Tech students to discover, track, and apply to technology internships.

## 🚀 Features

### 📋 **Internship Discovery**
- **623+ Technology Internships** from Summer 2026 opportunities
- **Advanced Filtering** by category, location, sponsorship requirements, freshman-friendly status
- **25+ Categories** including Software Engineering, AI/ML, Quant/Trading, Data Science, etc.
- **Real-time Search** across companies, roles, and categories
- **Multiple View Modes**: List, Grid, and Company Grouped views

### 🎯 **Application Tracking System**
- **Complete Application Workflow**: Saved → Interested → Applied → Interviewing → Offer → Accepted
- **Personal Dashboard** with 3 tabs (Overview, Application Tracker, Analytics)
- **Status Management** with visual indicators and progress tracking
- **Notes System** for personal reminders and interview prep
- **Interview Round Tracking** with scheduling and results
- **Application Analytics** with success rates and insights

### 🔐 **User Authentication**
- **Secure Supabase Auth** with email/password
- **Profile Management** with GT-specific fields (username, graduation year, major, GPA)
- **Protected Routes** for dashboard and tracking features

### 🤖 **Automated Data Collection**
- **Python Web Scraper** that processes GitHub internship repositories
- **Unicode/Emoji Processing** to extract sponsorship and citizenship requirements
- **Automatic Categorization** of roles using keyword matching
- **30-minute Automated Updates** via Vercel cron jobs or local scheduler

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Row Level Security
- **Authentication**: Supabase Auth
- **Data Processing**: Python with requests and re libraries  
- **Deployment**: Vercel with serverless functions
- **UI Components**: Lucide React icons, responsive design

## 📂 Project Structure

```
├── app/
│   ├── components/           # React components
│   │   ├── CompactFilterBar.tsx    # Advanced filtering system
│   │   ├── CompactInternshipCard.tsx  # Internship display cards
│   │   ├── CompanyGroupView.tsx    # Company-grouped view with sorting
│   │   ├── ApplicationTracker.tsx  # Complete application tracking
│   │   └── ...
│   ├── dashboard/           # Student dashboard pages
│   ├── lib/                 # Utilities and hooks
│   │   ├── hooks.ts         # Custom React hooks
│   │   ├── scraper-api.ts   # Server-side scraping logic
│   │   └── supabase*.ts     # Database clients
│   └── api/scrape/          # Serverless scraping endpoint
├── scraper/                 # Python scraping system
│   └── internship_scraper.py
├── database-schema.sql      # Database structure
└── vercel.json             # Deployment config with cron
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account

### 1. Setup Database
```sql
-- Run database-schema.sql in your Supabase SQL editor
```

### 2. Environment Variables
```bash
# Copy and fill .env.example
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

### 3. Install Dependencies
```bash
npm install
cd scraper && pip install -r requirements.txt
```

### 4. Populate Database
```bash
# Run Python scraper to get initial data
cd scraper && python internship_scraper.py

# Or use the API endpoint after deployment
curl -X POST https://your-app.vercel.app/api/scrape \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 5. Start Development
```bash
npm run dev
```

## 📊 Database Schema

### Core Tables
- **`internships`** - Main internship data with 623+ entries
- **`users`** - Student profiles with GT-specific fields  
- **`user_saved_internships`** - Application tracking with status workflow
- **`scrape_logs`** - Automated scraping audit trail

### Key Features
- **Row Level Security** for user data protection
- **Real-time subscriptions** for live updates
- **Bulk upsert operations** for efficient data updates
- **Comprehensive indexing** for fast queries

## 🎨 UI/UX Features

### **Responsive Design**
- Mobile-first approach with Tailwind CSS
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

### **Visual Indicators**
- 🛂 Does NOT offer Sponsorship
- 🇺🇸 Requires U.S. Citizenship  
- 🔒 Application Closed
- 👨‍🎓 Freshman Friendly

### **Advanced Interactions**
- **Searchable Dropdowns** with real-time filtering
- **Location Modals** for full location viewing
- **Stylized Company Icons** with unique color gradients
- **Status Badges** with color-coded application states

## 🔄 Automated Updates

### **Vercel Deployment**
```json
{
  "crons": [
    {
      "path": "/api/scrape",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

### **Local Scheduling** (Windows)
```bash
# Task Scheduler integration for continuous updates
schtasks /create /tn "InternshipScraper" /tr "python scraper.py" /sc minute /mo 30
```

## 🛡 Security Features

- **Environment Variable Protection**
- **CRON_SECRET Authentication** for API endpoints
- **Row Level Security** policies in Supabase
- **Input Validation** and sanitization
- **HTTPS Enforcement** in production

## 📈 Analytics & Insights

- **Application Success Rates** tracking
- **Response Rate Calculations** for interview conversion
- **Category Distribution** analysis
- **Timeline Event** logging for complete audit trail

## 🤝 Contributing

This is a Georgia Tech student project. For issues or feature requests, please check the codebase or reach out to the development team.

## 📄 License

Built for Georgia Tech Office of Student Achievement. Internal use only.# Single-source scraper deployed
