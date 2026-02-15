# Deployment Guide

## Target Platform
- **Hosting**: Netlify
- **Domain**: omartag.com
- **Build Output**: `dist/` directory

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Google Sheets API Configuration
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
VITE_SHEET_ID=your_sheet_id_here
```

### Getting Environment Variables

1. **Google Sheets API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create credentials → API Key
   - Restrict key to HTTP referrers (your domain)

2. **Sheet ID**:
   - Open your Google Sheet
   - Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

## Deployment Steps

### Option 1: Netlify CLI (Recommended)

```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to existing site (or create new)
netlify link

# Deploy to production
npm run deploy
```

### Option 2: Netlify Git Integration

1. Push code to GitHub/GitLab/Bitbucket
2. Connect repo in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in Netlify dashboard

### Option 3: Manual Deploy

```bash
# Build the project
npm run build

# Deploy dist folder
netlify deploy --prod --dir=dist
```

## Build Configuration

The `netlify.toml` file contains:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect rules (catch-all to `index.html`)
- Security headers (CSP, X-Frame-Options, etc.)

## Post-Deploy Verification

After deployment, verify:

1. **Site loads**: Visit https://omartag.com
2. **Routes work**: Direct navigation to `/board/123` should work (SPA fallback)
3. **Security headers**: Check in browser DevTools → Network → Response Headers:
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Content-Security-Policy` present
4. **Environment variables**: Test features that use Google Sheets API
5. **Dark mode**: Site should default to dark theme

## Troubleshooting

### Build Failures
- Check Node version (requires v22+)
- Run `npm ci` to ensure clean dependencies
- Check `netlify.toml` syntax is valid

### Runtime Errors
- Verify environment variables are set in Netlify dashboard
- Check browser console for CSP violations
- Ensure Google Sheets API key has proper restrictions

### Routing Issues
- Verify `_redirects` file is in `public/` and copied to `dist/`
- Check Netlify deploy logs for redirect rule processing

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Deploy to Netlify production |
| `npm run build:types` | Run TypeScript type checking (separate) |

## Security Notes

- API keys in `VITE_` variables are exposed to the client
- Restrict Google API key to your domain only
- Never commit `.env` file (it's in `.gitignore`)
