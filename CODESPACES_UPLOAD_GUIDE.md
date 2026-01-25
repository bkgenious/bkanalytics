# Complete Guide: Upload Portfolio to GitHub Codespaces

## Overview

This guide will walk you through uploading your entire Portfolio project from your local machine to GitHub, then launching it in GitHub Codespaces for testing.

---

## Step 1: Install GitHub Desktop (If Not Installed)

1. Download GitHub Desktop from: https://desktop.github.com/
2. Install and launch it
3. Sign in with your GitHub account

---

## Step 2: Create a New Repository on GitHub

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `Portfolio` (or your preferred name)
   - **Description**: `Data Analytics Portfolio Platform`
   - **Visibility**: Choose Public or Private
   - **DO NOT** check "Add a README file" (we have one)
   - **DO NOT** add .gitignore (we have one)
3. Click **Create repository**
4. Leave this page open - you'll need the repository URL

---

## Step 3: Add Your Project to GitHub Desktop

### Option A: If the folder is NOT a git repository yet

1. Open GitHub Desktop
2. Click **File → Add Local Repository**
3. Navigate to: `C:\Users\user\Documents\personal projects\Portfolio`
4. If it says "This directory does not appear to be a Git repository", click **Create a repository**
5. Fill in:
   - **Name**: Portfolio
   - **Local path**: (should be auto-filled)
   - **Initialize with README**: Uncheck
   - **Git ignore**: None
6. Click **Create Repository**

### Option B: If it shows as a repository

1. Open GitHub Desktop
2. Click **File → Add Local Repository**
3. Browse to `C:\Users\user\Documents\personal projects\Portfolio`
4. Click **Add Repository**

---

## Step 4: Commit All Files

1. In GitHub Desktop, you should see all files listed under "Changes"
2. At the bottom left, enter:
   - **Summary**: `Initial commit - Portfolio Platform with all features`
   - **Description** (optional): `Includes auth, APIs, admin panel, CMS features`
3. Click **Commit to main**

---

## Step 5: Publish to GitHub

1. Click **Publish repository** (top right)
2. Uncheck "Keep this code private" if you want it public
3. Click **Publish Repository**

OR if you already created the repo on GitHub:

1. Click **Repository → Repository Settings**
2. Under "Remote", click **Add** and paste your GitHub repo URL:
   ```
   https://github.com/YOUR_USERNAME/Portfolio.git
   ```
3. Click **Save**
4. Click **Push origin** (top bar)

---

## Step 6: Launch GitHub Codespaces

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/Portfolio`
2. Click the green **Code** button
3. Click the **Codespaces** tab
4. Click **Create codespace on main**
5. Wait for the Codespace to initialize (2-3 minutes)

---

## Step 7: Set Up Environment in Codespaces

Once Codespaces opens, run these commands in the terminal:

### 7.1 Install Dependencies
```bash
npm install
```

### 7.2 Create Environment File
```bash
cp .env.example .env.local
```

### 7.3 Generate Password Hash (Optional but Recommended)
```bash
node -e "const crypto = require('crypto'); const salt = crypto.randomBytes(16).toString('hex'); crypto.scrypt('your-password', salt, 64, (err, key) => console.log(salt + ':' + key.toString('hex')));"
```
Copy the output and update `.env.local`:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=paste_the_hash_here
SESSION_SECRET=any-random-32-char-string-here
```

### 7.4 Start the Development Server
```bash
npm run dev
```

### 7.5 Open the Preview
- Codespaces will show a popup "Your application is running on port 3000"
- Click **Open in Browser** to view your portfolio

---

## Step 8: Test Everything

1. **Homepage**: Should load with hero, metrics, and project cards
2. **Admin Panel**: Navigate to `/admin`
3. **Login**: Use the credentials from your `.env.local`
4. **Create Project**: Test creating a new project
5. **Edit Project**: Test editing and saving
6. **Delete Project**: Test deletion

---

## Important Files to Verify After Upload

| File | Purpose |
|------|---------|
| `src/lib/db.js` | Database with fixed `saveVersion` |
| `src/app/admin/page.jsx` | Dashboard with `ArrowPathIcon` import |
| `src/components/admin/ProjectForm.jsx` | Form with all handlers |
| `src/app/api/projects/route.js` | API with fixed filters |
| `.env.example` | Environment template |
| `.devcontainer/devcontainer.json` | Codespaces config |

---

## Troubleshooting

### "npm install" fails
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 not forwarding
1. Click "Ports" tab in Codespaces
2. Find port 3000
3. Click the globe icon to open in browser

### Authentication not working
- Ensure `ADMIN_PASSWORD_HASH` is set correctly in `.env.local`
- Or use plain password (less secure): `ADMIN_PASSWORD=your-password`

---

## Quick Reference Commands

```bash
# Start server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Generate password hash
node -e "const crypto = require('crypto'); const salt = crypto.randomBytes(16).toString('hex'); crypto.scrypt('PASSWORD', salt, 64, (err, key) => console.log(salt + ':' + key.toString('hex')));"
```
