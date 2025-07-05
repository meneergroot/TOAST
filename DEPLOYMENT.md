# GitHub Pages Deployment Guide

## 🚀 Deploy TOAST to GitHub Pages

Your TOAST project is perfectly suited for GitHub Pages hosting! Here's how to deploy it:

### Prerequisites
- A GitHub account
- Your TOAST project pushed to a GitHub repository

### Step 1: Push to GitHub

If you haven't already, push your project to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial TOAST app"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. **Go to your repository** on GitHub
2. **Click Settings** (tab at the top)
3. **Scroll down to "Pages"** (in the left sidebar)
4. **Under "Source"**, select:
   - **Source**: "Deploy from a branch"
   - **Branch**: `main` (or `master`)
   - **Folder**: `/ (root)`
5. **Click "Save"**

### Step 3: Wait for Deployment

- GitHub will automatically build and deploy your site
- You'll see a green checkmark when deployment is complete
- Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

### Step 4: Custom Domain (Optional)

If you want a custom domain:

1. **In the Pages settings**, scroll down to "Custom domain"
2. **Enter your domain** (e.g., `toast.social`)
3. **Click "Save"**
4. **Add a CNAME file** to your repository root:
   ```
   toast.social
   ```

## ✅ Why GitHub Pages Works Perfectly

Your TOAST project is ideal for GitHub Pages because:

### ✅ **Static Files Only**
- HTML, CSS, JavaScript files
- No server-side processing required
- All dependencies are CDN-hosted

### ✅ **External Dependencies**
- Solana Web3.js: `https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js`
- Font Awesome: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css`
- Google Fonts: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap`

### ✅ **Client-Side Storage**
- Uses `localStorage` for data persistence
- No database required
- Works perfectly in static hosting

### ✅ **HTTPS by Default**
- GitHub Pages provides free SSL certificates
- Required for Phantom wallet connections
- Secure blockchain interactions

## 🔧 Configuration

### Environment Variables
GitHub Pages doesn't support server-side environment variables, but your app uses client-side constants in `js/utils/constants.js`:

```javascript
// These are already configured for production
SOLANA_CONFIG.MAINNET.endpoint: 'https://api.mainnet-beta.solana.com'
TRANSACTION_CONFIG.USDC_TOKEN.mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
```

### CORS Considerations
- All external APIs (Solana RPC, CDNs) support CORS
- No additional configuration needed

## 🚨 Important Notes

### Phantom Wallet
- Works perfectly on GitHub Pages
- Requires HTTPS (provided by GitHub Pages)
- Users need Phantom extension installed

### Local Storage
- Data is stored in user's browser
- Each user has their own data
- No cross-device synchronization

### Transaction Simulation
- Currently simulates transactions
- Real Solana integration requires smart contract deployment
- Perfect for demo and testing

## 🔄 Continuous Deployment

Once set up, GitHub Pages will automatically redeploy when you:

1. **Push changes** to the main branch
2. **Wait 1-2 minutes** for deployment
3. **Refresh your site** to see updates

## 📱 Mobile Compatibility

Your responsive design works perfectly on:
- Desktop browsers
- Mobile browsers
- Tablet browsers
- All modern devices

## 🎯 Next Steps

After deployment, consider:

1. **Custom Domain**: Add a professional domain
2. **Analytics**: Add Google Analytics or similar
3. **SEO**: Add meta tags and descriptions
4. **Smart Contracts**: Deploy real Solana programs
5. **Database**: Add persistent storage (Firebase, Supabase, etc.)

## 🆘 Troubleshooting

### Common Issues

**Site not loading:**
- Check if the repository is public
- Verify the branch name is correct
- Wait a few minutes for initial deployment

**Wallet not connecting:**
- Ensure you're using HTTPS
- Check if Phantom extension is installed
- Try refreshing the page

**Styling issues:**
- Clear browser cache
- Check if all CSS files are loading
- Verify file paths are correct

### Support
- GitHub Pages documentation: https://pages.github.com/
- GitHub support: https://support.github.com/

---

Your TOAST app is now live on the web! 🍞✨ 