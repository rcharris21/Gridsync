# GridSync Deployment Guide

## 🚀 Quick Deploy to Netlify

### Option 1: Automatic Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your GridSync repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

### Option 2: Manual Deployment

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Upload to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Your site will be live instantly

## 🔧 GitHub Actions Setup (Optional)

If you want automated deployments:

1. **Get Netlify Tokens**
   - Go to Netlify User Settings → Applications → Personal access tokens
   - Create a new token
   - Go to your site settings → Site information → Site ID

2. **Add GitHub Secrets**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `NETLIFY_AUTH_TOKEN`: Your Netlify auth token
     - `NETLIFY_SITE_ID`: Your Netlify site ID

3. **Enable Actions**
   - The workflow will run automatically on pushes to main/master

## 📋 Pre-Deployment Checklist

- [ ] All features working in development
- [ ] Build completes successfully (`npm run build`)
- [ ] No console errors
- [ ] All dependencies installed
- [ ] Environment variables configured (if needed)
- [ ] Custom domain configured (optional)

## 🛠️ Troubleshooting

### Build Fails
- Check Node.js version (18+ recommended)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for syntax errors: `npm run lint`

### Site Not Loading
- Check Netlify redirects (handled by `netlify.toml`)
- Verify build output in `dist` folder
- Check browser console for errors

### Performance Issues
- The app includes Plotly.js which is large (~1.5MB gzipped)
- Consider code splitting for future optimizations
- Monitor bundle size with `npm run build`

## 🔄 Updating the Site

### Automatic Updates
- Push changes to main/master branch
- Netlify will automatically rebuild and deploy

### Manual Updates
- Run `npm run build`
- Upload new `dist` folder to Netlify

## 📊 Monitoring

- Netlify provides built-in analytics
- Check deployment logs in Netlify dashboard
- Monitor performance with browser dev tools

## 🎯 Production Considerations

- The app is client-side only (no backend required)
- All data is stored locally in the browser
- No API keys or sensitive data to configure
- Works offline after initial load 