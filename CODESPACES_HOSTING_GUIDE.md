# GitHub Codespaces Hosting Guide

This guide explains how to host the Ultra-Premium Portfolio Platform for **free** using GitHub Codespaces, and how to verify it is production-ready.

## 🧱 1. Repository Setup

1.  **Fork/Clone:** Ensure the code is in a GitHub repository.
2.  **Visibility:** Can be Public or Private.
    *   *Note:* Private repos require authentication to view Codespaces previews unless port visibility is changed.

## 🚀 2. Launching in Codespaces

1.  Go to your GitHub Repository.
2.  Click the likely green **Code** button.
3.  Select the **Codespaces** tab.
4.  Click **Create codespace on main**.
5.  Wait for the environment to build.
    *   *First run:* Installs Node.js v20, dependencies, seeds database.
    *   *Time:* ~2-4 minutes.

## 📤 3. File Transfer: Uploading from Laptop to Codespaces

There are two primary ways to move your images, data, or code from your local machine to the Codespace.

### Method A: Drag & Drop (Fastest for Media/Assets)

**Best for:** Uploading images, PDFs, or updating `projects.json` quickly.

1.  **Open Explorer:** in the Codespace browser window, open the **Explorer** sidebar (Icon: Files, or `Ctrl+Shift+E`).
2.  **Navigate:** Click to expand folders to reach your destination (e.g., `public/uploads/images`).
3.  **Drag & Drop:**
    *   Open folder on your *local laptop*.
    *   Select the files you want to upload.
    *   Drag them directly into the **Explorer Sidebar** in your browser.
    *   *Tip:* Hover over the destination folder name until it highlights to ensure they go inside.
4.  **Verify:** You should see the files appear in the sidebar list immediately.

### Method B: Git (Best for Bulk Code/Projects)

**Best for:** Migrating an entire existing project or large datasets.

1.  **On your Laptop:**
    *   Initialize git if needed: `git init`
    *   Add remote: `git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git`
    *   Commit files: `git add . && git commit -m "Initial upload"`
    *   Push: `git push origin main`
2.  **In Codespaces:**
    *   Open Terminal (`Ctrl+` `).
    *   Run: `git pull`
    *   All files will download instantly.

## 🌍 4. Hosting & Public Access

Once the Codespace is running, the application starts automatically on port 3000.

### 4.1 Accessing the URL
1.  In VS Code (Browser or Desktop), go to the **PORTS** tab (bottom panel).
2.  Look for **Port 3000**.
3.  **Local Address:** `http://localhost:3000` (Click the globe icon to open).
4.  **Visibility:** Ensure it is set to **Public** (right-click -> Port Visibility -> Public).
    *   *Default:* Configured to Public in `.devcontainer.json`.

### 4.2 URL Persistence
*   **Format:** `https://{codespace-name}-3000.app.github.dev`
*   **Lifespan:** The URL is active as long as the Codespace is running.
*   **Timeouts:** Codespaces stop after 30 mins of inactivity (configurable in GitHub Settings).
*   **Use Case:** Perfect for client demos, testing, or temporary portfolio hosting.

## 🧪 5. Verification Checklist

Run these tests to confirm the "Hosted" version is working correctly.

### 5.1 Public Visitor View
1.  Open the **Public URL** in an Incognito window.
2.  **Verify:**
    *   Homepage loads.
    *   "Published Projects" matches your seed data (e.g., 3).
    *   *Security Check:* Navigate to `/admin`. It should redirect to Login.

### 5.2 Security & Data Leak Check
1.  **Draft Privacy:**
    *   Log in as Admin.
    *   Set a project to **Draft**.
    *   Refresh the Public URL (Incognito).
    *   **Result:** The project must **NOT** be visible.
    *   *Technical:* The API `/api/projects` filters drafts for non-admins.
2.  **Upload Security:**
    *   Try to upload a `.exe` or `.html` file in the Admin panel.
    *   **Result:** Application should reject it.
    *   *Technical:* `nosniff` headers prevent executing uploaded scripts.

### 5.3 Persistence Verification
1.  **Stop Codespace:** (Command Palette -> Stop Current Codespace).
2.  **Restart Codespace.**
3.  **Verify:**
    *   Created projects exist.
    *   **Warning:** Uploaded images in `public/uploads` *may* be lost if the container was fully rebuilt (deleted).
    *   *Best Practice:* Commit any permanent sample images to Git.

## 🔮 6. Future: Custom Domain Hosting

Codespaces is for dev/demo. To host on a custom domain (e.g., `yourname.com`) later:

1.  **Deployment Target:** Use **Vercel** or **Railway**.
    *   *Ready:* The project is already configured (`next.config.mjs`, `standalone` output).
2.  **Data Persistence:**
    *   **Current:** JSON file (resets on deployment).
    *   **Required Change:** Switch `db.js` to use Postgres or MongoDB (e.g., Supabase/Neon).
3.  **Auth:**
    *   **Current:** Hardcoded credentials in `.env`.
    *   **Required Change:** Keep using `.env` or upgrade to NextAuth.js.

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| **Port 3000 not open** | Run `npm run dev` in terminal. |
| **"Private" URL** | Right-click Port 3000 -> Port Visibility -> Public. |
| **Admin Login Fails** | Check `.env.local` or run `npm run predev` to reset. |
| **Images Missing** | Did you rebuild the container? Commit images to Git to save them. |
| **"Permission denied"** | Run `chmod +x node_modules/.bin/next` or `rm -rf node_modules && npm install`. |

---
*Ultra-Premium Portfolio Platform - Codespaces Hosting Edition*
