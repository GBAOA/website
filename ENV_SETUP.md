# Environment Variables Setup

Copy this file to `.env.local` and fill in your actual values.

## Supabase Configuration

### Public Variables (Safe to expose in client-side code)
```bash
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key (public-facing, limited by RLS)
# ⚠️ This is SAFE to expose - it's designed to be public
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Private Variables (Server-side only, NEVER expose)
```bash
# Supabase Service Role Key (SENSITIVE - full database access)
# ⚠️ This must NEVER be exposed in client code or version control
# Only use in API routes and server-side code
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database URL (alternative connection method)
DATABASE_URL=postgresql://user:password@host:port/database
```

## Next.js Authentication
```bash
# NextAuth.js Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret_here

# NextAuth URL (your app's URL)
NEXTAUTH_URL=http://localhost:3000
```

## Adda.io Integration (if using headless browser login)
```bash
# Adda.io credentials for automated login
ADDA_EMAIL=your_email@example.com
ADDA_PASSWORD=your_password_here
ADDA_COMMUNITY_ID=your_community_id
```

## Important Notes

### About NEXT_PUBLIC_* Variables
- Variables prefixed with `NEXT_PUBLIC_` are **intentionally public**
- They are embedded in the client-side JavaScript bundle
- This is by design for values that need to be accessed in the browser
- The Supabase ANON_KEY is safe to expose - it's limited by Row Level Security (RLS)

### Security Best Practices
1. **Never commit** `.env.local` to version control
2. **Service Role Key** must stay server-side only (API routes, server components)
3. Use **Row Level Security (RLS)** policies in Supabase to protect data
4. Rotate keys regularly, especially if they may have been exposed

### Netlify Deployment
When deploying to Netlify:
1. Set environment variables in Netlify dashboard
2. Mark `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET`, and passwords as **secrets**
3. Do **NOT** mark `NEXT_PUBLIC_*` variables as secrets (they need to be public)
4. Netlify may warn about `NEXT_PUBLIC_SUNABASE_ANON_KEY` - this is a false positive, it's safe to expose
