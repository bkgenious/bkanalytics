# GitHub Codespaces Setup Guide

This guide ensures you can launch, demo, and share your portfolio entirely within GitHub Codespaces at **zero cost**.

---

## 🚀 Quick Launch (2 Minutes)

### Step 1: Create Codespace
1. Go to your repository on GitHub
2. Click the green **"Code"** button
3. Select **"Codespaces"** tab
4. Click **"Create codespace on main"**

### Step 2: Wait for Setup
The container will:
- ✅ Pull the Node.js 20 image
- ✅ Install npm dependencies automatically
- ✅ Create `.env.local` from template
- ✅ Forward port 3000

This takes about **2-3 minutes** on first launch.

### Step 3: Start the Dev Server
Once the terminal is ready, run:
```bash
npm run dev
```

### Step 4: Open Preview
When port 3000 appears in the **Ports** tab:
1. Click the **globe icon** to open in browser
2. Or right-click → **"Open in Browser"**

### Step 5: Make it Public (for Sharing)
1. Go to **Ports** tab (bottom panel)
2. Right-click on port 3000
3. Select **"Port Visibility"** → **"Public"**
4. Copy the URL to share with anyone!

---

## ✅ Launch Verification Checklist

Use this checklist to verify everything works:

### Environment Setup
- [ ] Codespace created successfully
- [ ] Terminal is accessible
- [ ] Dependencies installed (check for `node_modules/` folder)
- [ ] `.env.local` file exists

### Dev Server
- [ ] `npm run dev` starts without errors
- [ ] Terminal shows "Ready" message
- [ ] Port 3000 appears in Ports tab

### Public Site
- [ ] Preview URL opens the homepage
- [ ] Hero section displays correctly
- [ ] Dark mode toggle works
- [ ] Project filter pills work
- [ ] Scrolling is smooth

### Admin Panel
- [ ] `/admin` loads the login page
- [ ] Login works with `admin` / `Portfolio@2024`
- [ ] Dashboard shows project stats
- [ ] "New Project" page loads
- [ ] File drag & drop zone works

### File Uploads
- [ ] Can upload an image
- [ ] Image appears in project
- [ ] Warning banner is visible in admin

### Sharing
- [ ] Port visibility set to Public
- [ ] Preview URL works in incognito window
- [ ] Preview URL works on mobile device

### Persistence
- [ ] Restart Codespace: `Codespaces: Stop Current Codespace` → Reopen
- [ ] Dependencies still installed
- [ ] `.env.local` still exists
- [ ] `npm run dev` still works

---

## 🔧 Configuration Files

### `.devcontainer/devcontainer.json`

```json
{
    "name": "Portfolio Platform",
    "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
    "postCreateCommand": "npm install && cp -n .env.example .env.local 2>/dev/null || true",
    "forwardPorts": [3000],
    "portsAttributes": {
        "3000": {
            "label": "Portfolio App",
            "onAutoForward": "openPreview",
            "visibility": "public"
        }
    }
}
```

### Key Settings

| Setting | Purpose |
|---------|---------|
| `image` | Node.js 20 LTS container |
| `postCreateCommand` | Auto-install deps + copy env file |
| `forwardPorts` | Expose port 3000 |
| `visibility: public` | Allow shareable URLs |

---

## 📁 File Persistence

### Important Warning

> ⚠️ **Files uploaded via the admin panel exist ONLY in your Codespace.**

They will be **deleted** when:
- The Codespace is deleted
- The Codespace times out and is cleaned up
- You rebuild the container

### To Persist Uploads

```bash
# Add uploads to Git
git add public/uploads/

# Commit
git commit -m "Add project uploads"

# Push to repository
git push
```

### What Gets Persisted

| Item | Persisted? | Notes |
|------|------------|-------|
| `projects.json` | ⚠️ No | Commit changes to persist |
| `public/uploads/` | ⚠️ No | Commit files to persist |
| `.env.local` | ⚠️ No | Recreated from `.env.example` |
| Code changes | ✅ Yes | If committed and pushed |

---

## 🛠️ Troubleshooting

### "Port 3000 not appearing"

1. Make sure dev server is running:
   ```bash
   npm run dev
   ```
2. Check the **Ports** tab in VS Code
3. Manually add port: Click **"Add Port"** → enter `3000`

### "Preview URL shows error"

1. Wait 10 seconds after server starts
2. Check terminal for errors
3. Try hard refresh: `Ctrl+Shift+R`
4. Restart dev server:
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev
   ```

### "Can't share preview URL"

1. Go to **Ports** tab
2. Right-click port 3000
3. **Port Visibility** → **Public**
4. Copy the new URL

### "Module not found"

```bash
rm -rf node_modules
npm install
```

### "Admin login not working"

1. Check `.env.local` exists:
   ```bash
   cat .env.local
   ```
2. If missing, create it:
   ```bash
   cp .env.example .env.local
   ```
3. Restart dev server

### "502 Bad Gateway" on preview

The dev server may still be starting. Wait 15-30 seconds and refresh.

---

## 💰 Cost Information

### GitHub Free Tier Includes

- **60 hours/month** of Codespaces usage
- 2-core machines
- 15 GB storage

### To Minimize Usage

1. **Stop Codespaces when not using**:
   - Command Palette → "Codespaces: Stop Current Codespace"
2. **Set auto-timeout**:
   - GitHub Settings → Codespaces → Default idle timeout: 30 minutes
3. **Delete unused Codespaces**:
   - Go to github.com/codespaces
   - Delete old Codespaces

---

## 🔐 Security Notes

### Default Credentials

| Field | Default Value |
|-------|---------------|
| Username | `admin` |
| Password | `Portfolio@2024` |

> ⚠️ **Change these before sharing your Codespace publicly!**

Edit `.env.local`:
```bash
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=YourSecurePassword123!
SESSION_SECRET=your_random_64_char_string
```

### Public URL Security

- The preview URL is **hard to guess** but **publicly accessible**
- Anyone with the URL can view your portfolio
- Only you can access the admin panel (with credentials)

---

## 🚀 Ready to Launch

Your portfolio is now fully configured for GitHub Codespaces!

```
📍 Live at: https://<your-codespace>-3000.app.github.dev
🔐 Admin at: https://<your-codespace>-3000.app.github.dev/admin
```

Share the preview URL with anyone to demo your work! 🎉
