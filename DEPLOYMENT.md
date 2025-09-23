# Deployment Guide

## Prerequisites
- Vercel account
- GitHub account  
- Supabase project

## Step 1: Environment Variables

Add these to your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_URL=your_supabase_url
CRON_SECRET=generate_random_string
```

## Step 2: GitHub Secrets

Add these to your GitHub repository secrets:

```
VERCEL_URL=your_vercel_deployment_url
CRON_SECRET=same_as_vercel_cron_secret
```

## Step 3: Database Schema

Run `schema_update.sql` in your Supabase SQL Editor

## Step 4: Deploy to Vercel

```bash
vercel --prod
```

## Step 5: Enable GitHub Actions

The scraper will run every 30 minutes automatically via GitHub Actions

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets committed to repository
- [ ] CRON_SECRET is strong and random
- [ ] Supabase RLS policies are enabled
- [ ] GitHub Actions secrets are configured