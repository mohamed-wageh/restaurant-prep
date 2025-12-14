# Restaurant Prep Manager

A web application for managing restaurant prep lists based on catering orders.

## 🚀 Live Demo

Visit the live application: [https://mohamed-wageh.github.io/restaurant-prep/](https://mohamed-wageh.github.io/restaurant-prep/)

## 📦 Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Copy your Firebase config and add it to `src/firebase.js` (or create a `.env` file with `VITE_FIREBASE_*` variables)

3. Run the development server:
```bash
npm run dev
```

## 🌐 Deploy to GitHub Pages

### Automatic Deployment (Recommended)

1. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

2. **Repository Name:**
   - The repository name is `restaurant-prep` and is already configured in `vite.config.js`

3. **Push to Main Branch:**
   - The GitHub Actions workflow will automatically build and deploy your site
   - Every push to the `main` branch will trigger a new deployment

### Manual Deployment

If you prefer to deploy manually:

```bash
npm run build:gh-pages
```

Then upload the `dist` folder to GitHub Pages.

## 📁 Project Structure

- `src/` - React application source code
- `functions/` - Firebase Cloud Functions (optional, not used - prep list calculation is done in frontend)
- `public/` - Static assets
- `.github/workflows/` - GitHub Actions deployment workflow

## 🔧 How It Works

The application calculates prep lists directly in the frontend using Firestore queries. All calculations are performed client-side using standard CRUD operations - no Firebase Functions required.

## 📝 Features

- ✅ Dashboard-style interface with sidebar navigation
- ✅ Tabbed setup page for managing departments, ingredients, and menu items
- ✅ Recipe builder for defining menu item recipes
- ✅ Order calculator with prep list generation
- ✅ Copy individual departments or all departments
- ✅ Export prep lists as PDF or Excel
- ✅ Fully responsive design
- ✅ Search and filter functionality
- ✅ Pagination for large lists

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 License

This project is open source and available under the MIT License.

