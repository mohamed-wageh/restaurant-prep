# GitHub Pages Deployment Guide

This guide will help you deploy the Restaurant Prep Manager to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Node.js and npm installed

## Step-by-Step Deployment

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `Restaurant-Prep-Manager` (or any name you prefer)
3. Make it **public** (required for free GitHub Pages)
4. **Don't** initialize with README, .gitignore, or license (we already have these)

### 2. Update Repository Name in Config

If your repository name is **different** from `Restaurant-Prep-Manager`, update `vite.config.js`:

```js
base: process.env.GITHUB_PAGES === 'true' ? '/your-repo-name/' : '/',
```

Replace `your-repo-name` with your actual repository name.

### 3. Initialize Git and Push Code

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/your-repo-name.git

# Push to main branch
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select **GitHub Actions**
5. Save the settings

### 5. Automatic Deployment

Once you've enabled GitHub Actions for Pages:

- Every time you push to the `main` branch, GitHub will automatically:
  1. Build your application
  2. Deploy it to GitHub Pages
  3. Make it available at `https://yourusername.github.io/your-repo-name/`

### 6. Check Deployment Status

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You'll see the deployment workflow running
4. Wait for it to complete (usually 2-3 minutes)
5. Once complete, visit your site URL

### 7. Update Live Site URL

After deployment, update the README.md with your actual GitHub Pages URL:

```markdown
## 🚀 Live Demo

Visit the live application: [https://yourusername.github.io/your-repo-name/](https://yourusername.github.io/your-repo-name/)
```

## Troubleshooting

### Build Fails

- Check the **Actions** tab for error messages
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### 404 Errors

- Make sure the `base` path in `vite.config.js` matches your repository name
- Ensure GitHub Pages is set to use **GitHub Actions** as the source
- Wait a few minutes after deployment for DNS propagation

### Assets Not Loading

- Clear your browser cache
- Check that the `base` path is correct
- Verify the build completed successfully

### Firebase Not Working

- Make sure your Firebase config is correct
- Check browser console for errors
- Verify Firestore rules allow read/write access

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Build for GitHub Pages
npm run build:gh-pages

# The dist folder will contain your built files
# You can manually upload these to GitHub Pages
```

## Updating Your Site

Simply push changes to the `main` branch:

```bash
git add .
git commit -m "Update description"
git push
```

GitHub Actions will automatically rebuild and redeploy your site.

## Custom Domain (Optional)

If you have a custom domain:

1. Go to repository **Settings** → **Pages**
2. Enter your custom domain
3. Follow GitHub's instructions for DNS configuration

---

**Need Help?** Check the [GitHub Pages documentation](https://docs.github.com/en/pages) or open an issue in the repository.

