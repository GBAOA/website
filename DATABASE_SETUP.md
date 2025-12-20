# Database Setup Guide for Netlify

This guide will help you set up a free-tier Supabase database and integrate it with your Next.js application on Netlify.

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up using GitHub, Google, or email
4. Verify your email if required

## Step 2: Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in the project details:
   - **Name**: `golden-blossom-db` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Select **"Free"** tier
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be provisioned

## Step 3: Get Your Database Credentials

1. In your Supabase project dashboard, click on **"Settings"** (gear icon)
2. Go to **"API"** section
3. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (starts with `eyJ`)
   - **service_role key**: `eyJhbGc...` (keep this secret!)

4. Go to **"Database"** section
5. Copy the **Connection string** (URI format):
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
   - Or use the connection parameters shown

## Step 4: Install Supabase Client

In your project directory, install the Supabase JavaScript client:

```bash
cd website
npm install @supabase/supabase-js
```

## Step 5: Set Up Environment Variables

1. Create a `.env.local` file in the `website` directory (if it doesn't exist)
2. Add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

3. **For Netlify deployment**, add these as environment variables:
   - Go to your Netlify dashboard
   - Select your site
   - Go to **Site settings** → **Environment variables**
   - Add each variable:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (mark as sensitive)
     - `DATABASE_URL` (mark as sensitive)

## Step 6: Create Database Schema

1. In Supabase dashboard, go to **"SQL Editor"**
2. Click **"New query"**
3. Run this SQL to create tables for your application:

```sql
-- Table for storing Adda.io login sessions
CREATE TABLE IF NOT EXISTS adda_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL,
    cookies JSONB,
    headers JSONB,
    tokens JSONB,
    network_requests JSONB,
    endpoints JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing synced residents data
CREATE TABLE IF NOT EXISTS residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adda_id TEXT UNIQUE,
    name TEXT NOT NULL,
    flat TEXT,
    email TEXT,
    phone TEXT,
    type TEXT,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing synced flats data
CREATE TABLE IF NOT EXISTS flats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adda_id TEXT UNIQUE,
    block TEXT,
    number TEXT,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing network requests captured during login
CREATE TABLE IF NOT EXISTS network_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    url TEXT NOT NULL,
    method TEXT,
    headers JSONB,
    post_data TEXT,
    response_status INTEGER,
    response_headers JSONB,
    response_body TEXT,
    request_type TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (session_id) REFERENCES adda_sessions(session_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_adda_sessions_session_id ON adda_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_adda_sessions_expires_at ON adda_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_residents_adda_id ON residents(adda_id);
CREATE INDEX IF NOT EXISTS idx_flats_adda_id ON flats(adda_id);
CREATE INDEX IF NOT EXISTS idx_network_requests_session_id ON network_requests(session_id);
```

4. Click **"Run"** to execute the SQL

## Step 7: Set Up Row Level Security (RLS)

For security, enable RLS on your tables:

```sql
-- Enable RLS on all tables
ALTER TABLE adda_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_requests ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
-- For now, we'll allow service role to do everything
-- In production, create more restrictive policies
```

## Step 8: Install Dependencies

Run this command in your `website` directory:

```bash
npm install @supabase/supabase-js
```

## Step 9: Update Your Code

The following files have been created/updated in your codebase:

1. **`src/lib/supabase.ts`** - Supabase client initialization
2. **`src/lib/adda-session-store-db.ts`** - Database-backed session store
3. **`src/lib/db-residents.ts`** - Database functions for residents/flats
4. **`src/app/api/admin/sync/route.ts`** - Updated to save to database

## Step 10: Test Locally

1. Make sure your `.env.local` has all the Supabase variables
2. Start your dev server:
   ```bash
   npm run dev
   ```
3. Test the login flow - sessions should now persist in the database
4. Test the sync functionality - residents and flats should be saved

## Step 11: Deploy to Netlify

1. **Push your code to GitHub** (if not already done)
2. **Connect to Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
3. **Add Environment Variables**:
   - In Netlify site settings → Environment variables
   - Add all the Supabase variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (mark as sensitive)
     - `DATABASE_URL` (mark as sensitive)
4. **Deploy**:
   - Netlify will automatically build and deploy
   - Check the deploy logs for any errors

## Step 12: Verify Database Connection

1. After deployment, test your application
2. Check Supabase dashboard → Table Editor to see if data is being saved
3. Monitor the Logs section in Supabase for any connection issues

## Troubleshooting

### Connection Issues
- Verify all environment variables are set correctly in Netlify
- Check that your Supabase project is active (not paused)
- Ensure the database password matches in your connection string

### RLS (Row Level Security) Issues
- If you get permission errors, check your RLS policies
- For development, you can temporarily disable RLS (not recommended for production)

### Build Errors
- Make sure `@supabase/supabase-js` is in `dependencies`, not `devDependencies`
- Check that all environment variables are available during build

## Free Tier Limits

Supabase Free Tier includes:
- **500 MB database storage**
- **2 GB bandwidth**
- **50,000 monthly active users**
- **Unlimited API requests**

This should be sufficient for development and small production deployments.

## Next Steps

1. Set up proper RLS policies for production
2. Add database backups (available in paid tiers)
3. Monitor usage in Supabase dashboard
4. Consider adding indexes for frequently queried fields
5. Set up database migrations for schema changes

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

