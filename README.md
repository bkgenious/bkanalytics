# DataViz Portfolio Platform

Ultra-premium, enterprise-grade portfolio website for data professionals. Built with Next.js 14, Tailwind CSS, and designed to run **100% free** in GitHub Codespaces.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Codespaces Ready](https://img.shields.io/badge/Codespaces-Ready-blue?style=flat-square&logo=github)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🚀 One-Click Launch with GitHub Codespaces

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new)

### Quick Start (Codespaces)

1. **Open Repository** → Click the green **"Code"** button
2. **Create Codespace** → Select **"Open with Codespaces"** → **"New codespace"**
3. **Wait for Setup** → Dependencies install automatically (~2 minutes)
4. **Start Dev Server** → Run in terminal:
   ```bash
   npm run dev
   ```
5. **Open Preview** → Click the **"Open in Browser"** button when port 3000 appears
6. **Share Link** → The preview URL is **publicly accessible**!

> ✅ **That's it!** Your portfolio is now live and shareable.

---

## 🌐 Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/portfolio.git
cd portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✨ Features

### Public Portfolio
- 🎨 Ultra-premium, consulting-grade UI design
- 🌓 Dark/light mode with smooth transitions
- 📱 Fully responsive (desktop, tablet, mobile)
- 🔍 Filter projects by tool (Power BI, Tableau, Excel)
- 🖼️ Image gallery with lightbox
- 🎬 Video embedding
- 📄 PDF downloads
- ⚡ Optimized for performance

### Admin Panel
- 🔐 Protected at `/admin` with secure authentication
- 📤 Drag & drop file uploads
- 📝 Full CRUD for projects
- 🔄 Real-time updates to public site
- ⚠️ File persistence warning for Codespaces users

---

## 🔑 Admin Access

Navigate to `/admin` and use the default credentials:

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `Portfolio@2024` |

> ⚠️ **Important:** Change these in `.env.local` before sharing your Codespace!

---

## ⚙️ Configuration

### Environment Variables

The `.env.example` file is **automatically copied** to `.env.local` in Codespaces.

For local development:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=generate_a_random_64_character_string
```

---

## 📁 File Storage & Persistence

### Important for Codespaces Users

Files uploaded via the admin panel are stored in `public/uploads/`:

```
public/uploads/
├── images/    # Dashboard screenshots
├── videos/    # Demo recordings
└── pdfs/      # Documentation files
```

> ⚠️ **Critical:** Uploaded files exist **only in your Codespace**. They will be **lost** when the Codespace is deleted unless you commit them to Git:

```bash
# Save uploaded files to the repository
git add public/uploads/
git commit -m "Add uploaded project files"
git push
```

---

## 🧪 Verification Checklist

Use this checklist to verify your Codespaces setup works:

- [ ] ✅ Repository opens in Codespaces
- [ ] ✅ Dependencies install automatically (check terminal)
- [ ] ✅ `npm run dev` starts without errors
- [ ] ✅ Port 3000 appears in the Ports tab
- [ ] ✅ "Open in Browser" shows the portfolio
- [ ] ✅ Preview URL is accessible (share with a friend!)
- [ ] ✅ Dark mode toggle works
- [ ] ✅ `/admin` login page loads
- [ ] ✅ Admin login works with default credentials
- [ ] ✅ File upload works in admin panel
- [ ] ✅ Uploaded files appear on project pages
- [ ] ✅ Restarting Codespace doesn't break setup

---

## 🛠️ Troubleshooting

### Port 3000 not visible in Ports tab

1. Make sure the dev server is running: `npm run dev`
2. Click **"Ports"** tab in the bottom panel
3. If not listed, manually forward: **Add Port** → **3000**
4. Set visibility to **Public** for shareable links

### Preview URL not loading

1. Wait 5-10 seconds after server starts
2. Check terminal for errors
3. Try refreshing the preview
4. Ensure port visibility is set to **Public**

### Environment variables not working

1. Check `.env.local` exists (should be auto-created)
2. Restart the dev server after changing env vars
3. Verify no quotes around values in `.env.local`

### "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Admin login not working

1. Check `.env.local` has correct credentials
2. Default: `admin` / `Portfolio@2024`
3. Clear browser cookies and try again

---

## 📂 Project Structure

```
Portfolio/
├── .devcontainer/          # Codespaces configuration
│   └── devcontainer.json   # Container settings
├── data/
│   └── projects.json       # Project database
├── public/
│   └── uploads/            # Uploaded files (images, videos, PDFs)
├── src/
│   ├── app/
│   │   ├── admin/          # Admin panel pages
│   │   ├── api/            # API routes
│   │   ├── projects/       # Project detail pages
│   │   ├── globals.css     # Global styles
│   │   ├── layout.jsx      # Root layout
│   │   └── page.jsx        # Homepage
│   ├── components/
│   │   ├── admin/          # Admin components
│   │   ├── layout/         # Header, Footer
│   │   └── ui/             # Button, Card, Badge, Modal, etc.
│   └── lib/
│       ├── auth.js         # Authentication utilities
│       ├── db.js           # JSON database utilities
│       └── upload.js       # File upload utilities
├── .env.example            # Environment template
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
└── next.config.mjs         # Next.js configuration
```

---

## 🛡️ Security

- ✅ Admin routes protected by environment-based authentication
- ✅ HMAC-signed session tokens
- ✅ File type and size validation
- ✅ HttpOnly cookies for session management
- ✅ No credentials in source code
- ✅ Security headers configured

---

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Heroicons** | Premium icons |
| **UUID** | Unique ID generation |

---

## 🚀 Production Deployment

This app is designed for easy migration from Codespaces to production:

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the .next folder
```

### Self-Hosted
```bash
npm run build
npm start
```

> **Note:** For production, consider:
> - External file storage (S3, Cloudinary)
> - Database (PostgreSQL, MongoDB)
> - Rate limiting on API routes
> - Custom domain with HTTPS

---

## 📄 License

MIT License - feel free to use this for your own portfolio!

---

## 💡 Tips for Best Results

1. **Use high-quality screenshots** (1920x1080 or similar)
2. **Keep project descriptions concise** but informative
3. **Add relevant tags** for better filtering
4. **Include demo videos** when possible
5. **Commit your uploads** to persist them

---

Built with ❤️ for data professionals who want their work to shine.
