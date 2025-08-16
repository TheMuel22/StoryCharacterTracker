# Deploy Updated Web App to Vercel

## Quick Deployment Steps

### Method 1: Using Vercel CLI (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. In the `web-app` folder, run: `vercel --prod`
3. Follow the prompts to deploy

### Method 2: Using Git + GitHub (Automatic)
1. Commit your changes:
   ```bash
   git add .
   git commit -m "Update web app with improved sync functionality"
   git push origin main
   ```
2. Vercel will automatically deploy the changes

### Method 3: Manual Upload via Vercel Dashboard
1. Go to vercel.com and log into your account
2. Find your "story-character-tracker" project
3. Go to the project settings
4. Upload the updated files:
   - `index.html`
   - `script.js`
   - `styles.css`

## What's New in This Version

✅ **Improved Sync Button**: "Sync with Character Tracker" button with better error handling
✅ **Quick Test Buttons**: "Test Local" and "Test Network" for easy connection testing
✅ **Better Error Messages**: More detailed error information when connection fails
✅ **Correct API Endpoints**: Now uses `/api/characters` instead of non-existent `/api/status`
✅ **Visual Feedback**: Success messages and connection status updates

## Usage After Deployment

1. Make sure your Character Tracker is running (shows green server status)
2. Go to https://story-character-tracker.vercel.app
3. Enter your server URL (usually `http://192.168.4.111:8000`)
4. Click "Sync with Character Tracker"
5. You should see: "✅ Successfully connected to Character Tracker! Found X characters and syncing data..."

## Troubleshooting

If sync still doesn't work after deployment:
1. Check Character Tracker is running locally
2. Look for green server status: "🟢 API: http://192.168.4.111:8000"
3. Test the URL in browser: http://192.168.4.111:8000/api/characters
4. Should show JSON with your character data

---
*Updated with improved sync functionality - August 16, 2025*
