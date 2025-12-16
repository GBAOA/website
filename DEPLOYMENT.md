# Netlify Deployment Guide - Golden Blossom Apartments

## Prerequisites
✅ You have a Netlify account  
✅ You have created a project called `golden-blossom.com` on Netlify  
✅ Your code is in `d:/dev/code/antigravity/GoldenBlossom_1/website`

---

## Step 1: Initialize Git Repository (if not done)

```bash
cd d:/dev/code/antigravity/GoldenBlossom_1/website
git init
git add .
git commit -m "Initial commit - Golden Blossom website"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `golden-blossom-apartments`
3. **Do NOT** initialize with README, .gitignore, or license
4. Copy the repository URL (e.g., `https://github.com/yourusername/golden-blossom-apartments.git`)

## Step 3: Push Code to GitHub

```bash
git remote add origin https://github.com/yourusername/golden-blossom-apartments.git
git branch -M main
git push -u origin main
```

## Step 4: Configure Netlify Build Settings

### Option A: Using Netlify UI

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click on your `golden-blossom.com` project
3. Go to **Site configuration** → **Build & deploy** → **Build settings**
4. Set the following:
   - **Base directory**: `website` (or leave blank if repo root is the website folder)
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

### Option B: Using `netlify.toml` (Recommended)

Create a `netlify.toml` file in your repository root with the configuration below.

## Step 5: Set Environment Variables

1. In Netlify Dashboard → **Site configuration** → **Environment variables**
2. Add the following variable:
   - **Key**: `AUTH_SECRET`
   - **Value**: `` (or generate a new one)

## Step 6: Deploy

### Via Netlify UI:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

### Via Netlify CLI (Alternative):
```bash
npm install -g netlify-cli
netlify login
netlify link
netlify deploy --prod
```

---

## Important Notes

⚠️ **Next.js on Netlify**: Netlify has special support for Next.js. The publish directory should be `.next` and Netlify will automatically detect and use the Next.js runtime.

⚠️ **Environment Variables**: Make sure `AUTH_SECRET` is set in Netlify's environment variables, not just in `.env.local`.

⚠️ **Build Time**: First build may take 3-5 minutes.

---

## Troubleshooting

**Build fails?**
- Check build logs in Netlify Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

**Auth not working?**
- Verify `AUTH_SECRET` is set in Netlify environment variables
- Check that the secret is not wrapped in quotes in Netlify UI

**Images not loading?**
- Ensure images are in the `public` folder
- Check image paths are correct (use `/images/...` not `./images/...`)
