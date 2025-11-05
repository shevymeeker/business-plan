# GitHub Pages Setup Instructions

## Deploying Your Business Plan Builder to GitHub Pages

This guide will help you deploy the Business Plan Builder as a Progressive Web App (PWA) on GitHub Pages, making it accessible to contractors anywhere with full offline capabilities.

## Step 1: Enable GitHub Pages

1. Go to your GitHub repository: `https://github.com/shevymeeker/business-plan`

2. Click on **Settings** (in the repository menu)

3. Scroll down to the **Pages** section (in the left sidebar under "Code and automation")

4. Under **Source**, select:
   - **Source**: Deploy from a branch
   - **Branch**: Select your main branch (e.g., `main` or `master`)
   - **Folder**: Select `/docs`
   - Click **Save**

5. GitHub will begin deploying your site. It may take a few minutes.

6. Once deployed, your site will be available at:
   ```
   https://shevymeeker.github.io/business-plan/
   ```

## Step 2: Verify Deployment

1. Wait 2-5 minutes for GitHub Pages to build and deploy

2. Visit your site at the URL above

3. You should see the Business Plan Builder interface

4. Check the browser console (F12) to verify the Service Worker is registered:
   - Look for: "ServiceWorker registered: ..."

## Step 3: Test Offline Functionality

### On Desktop/Laptop:

1. Visit the site in Chrome, Edge, or other Chromium-based browser
2. You'll see a purple banner at the top: **"📱 Install this app for offline access"**
3. Click **Install** to add it as a desktop app
4. Once installed, you can use it completely offline!

### Testing Offline Mode:

1. Open the app (in browser or installed version)
2. Open DevTools (F12)
3. Go to the **Network** tab
4. Check the **Offline** checkbox at the top
5. Refresh the page - it should still work!
6. You'll see "🔴 Offline - Using cached version" in the header

### On Mobile (Android):

1. Visit the site in Chrome
2. You'll see "Install app" or "Add to Home Screen" prompt
3. Tap to install
4. The app will appear on your home screen like a native app
5. Works completely offline after first visit!

### On Mobile (iOS):

1. Visit the site in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Name it and tap "Add"
5. Works offline after first visit!

## How It Works for Contractors

### First Visit (Requires Internet):
- Contractor visits the GitHub Pages URL
- All files are downloaded and cached automatically
- Service Worker is installed in the background
- Online status shows "🟢 Online"

### After First Visit (No Internet Needed):
- Contractor can work completely offline
- All data is saved in browser's localStorage
- Business plans can be exported as JSON files
- PDFs can be generated and saved locally
- Online status shows "🔴 Offline - Using cached version"

### Data Persistence:
- All form data is automatically saved to localStorage
- Data persists even if browser is closed
- Contractors can export/import data as JSON for backup
- No server or database needed!

## Features

✅ **Fully Offline** - Works without internet after first visit
✅ **Auto-Save** - All changes saved automatically to localStorage
✅ **PWA Installable** - Can be installed like a native app
✅ **Mobile Friendly** - Responsive design for phones and tablets
✅ **PDF Export** - Generate professional PDFs directly in browser
✅ **Data Export/Import** - Backup and restore your business plans
✅ **No Database Needed** - Everything runs client-side
✅ **Secure** - Data never leaves the contractor's device

## Updating the App

When you push updates to the `/docs` folder:

1. GitHub Pages automatically rebuilds (takes 2-5 minutes)
2. Contractors will see: **"🔄 New version available!"**
3. They click **"Update Now"** to get the latest version
4. The Service Worker updates and the page refreshes

## Troubleshooting

### Site Not Loading:
- Wait 5 minutes after enabling GitHub Pages
- Check GitHub Actions tab for deployment status
- Ensure `/docs` folder contains all necessary files

### Service Worker Not Working:
- GitHub Pages requires HTTPS (automatic)
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check browser console for errors

### Offline Mode Not Working:
- Ensure the page was fully loaded at least once online
- Check that Service Worker is registered (console)
- Some browsers block Service Workers in private/incognito mode

### Install Button Not Showing:
- PWA install prompt only shows on certain browsers (Chrome, Edge)
- Some browsers require HTTPS (GitHub Pages has this)
- On mobile, look for "Add to Home Screen" in browser menu

## Browser Compatibility

✅ Chrome (Desktop & Android) - Full PWA support
✅ Edge (Desktop & Android) - Full PWA support
✅ Safari (iOS) - Offline support, manual "Add to Home Screen"
✅ Firefox - Offline support, limited PWA features
⚠️ Internet Explorer - Not supported (use Edge)

## Sharing with Contractors

Simply share this URL:
```
https://shevymeeker.github.io/business-plan/
```

Optionally, create a short URL using:
- bit.ly
- tinyurl.com
- Your custom domain

## Custom Domain (Optional)

To use a custom domain (e.g., `businessplan.yourcompany.com`):

1. In repository settings → Pages
2. Add your custom domain
3. Update your DNS records as instructed by GitHub
4. Wait for SSL certificate to provision (automatic)

## Questions?

- Check GitHub Pages documentation: https://docs.github.com/pages
- Progressive Web Apps guide: https://web.dev/progressive-web-apps/
- Service Workers: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
