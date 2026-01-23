# Codespaces Testing & Verification Guide

This guide ensures that the Ultra-Premium Portfolio Platform can be fully tested, verified, and debugged inside a GitHub Codespaces environment.

## 🧱 1. Environment Setup

### 1.1 First Launch
When you open this repository in GitHub Codespaces:
1.  **Dependencies** (`npm install`) are installed automatically.
2.  **Environment Variables** (`.env.local`) are auto-created from `.env.example`.
3.  **Sample Data** (`projects.json`) is seeded automatically correctly.

### 1.2 Start the Application
Recommended command:
```bash
npm run dev
```
*   This triggers `predev` checks to ensure `.env.local` is valid.
*   Server starts on port **3000**.
*   Preview tab should open automatically.

### 1.3 Default Credentials
(Set in `.env.local` by default)
*   **Username:** `admin`
*   **Password:** `Portfolio@2024`

---

## 🧪 2. End-to-End Testing Checklist

### 2.1 Health Diagnostics
Access: `/api/health`
**Expected Response:** `200 OK`
```json
{
  "server": "online",
  "checks": {
    "database": { "status": "healthy", "path": "data/projects.json" },
    "config": { "status": "healthy", "path": "data/config.json" },
    "uploads": { "status": "healthy", "writable": true }
  }
}
```
**Failure Test:**
1.  Rename `data/projects.json` to `projects.json.moved`
2.  Refresh `/api/health` -> Should return `503 Service Unavailable` or `missing` status for database.

### 2.2 Public UI Verification
1.  **Homepage:** Verify "Published Projects" count matches seed data (e.g., 2).
2.  **Filtering:** Click "Power BI" -> Should show only Power BI projects.
3.  **Metrics:** Verify "Years Experience" and custom KPIs load (fetched from `/api/metrics`).
4.  **Detail Page:** Click a project -> Ensure all sections (Title, Badges, Description) render.

### 2.3 Admin Panel Functionality
1.  **Login:** Go to `/admin`. Enter credentials. Verify redirect to Dashboard.
2.  **Create Project:**
    *   Click "New Project".
    *   Fill Title: "Test Project".
    *   Tool: "Excel".
    *   Upload an Image (Drag & Drop).
    *   Click Create.
3.  **Verify Creation:**
    *   Dashboard should list "Test Project".
    *   Homepage should show incremented project count + new card.
4.  **Edit Project:**
    *   Change Status to "Draft".
    *   Save.
    *   **Verify:** Project disappears from Homepage but remains in Admin.
5.  **Delete Project:**
    *   Click Trash icon.
    *   Confirm.
    *   **Verify:** Project removed from lists.

### 2.4 Real-Time Metrics & Config
1.  **Metric Edit:**
    *   In Admin Dashboard, scroll to "Site Metrics Configuration".
    *   Change "Years Experience" to `10`.
    *   Add KPI: "Coffees" -> "500".
    *   Click Save.
2.  **Verify:**
    *   Refresh Homepage (or wait if polling is active).
    *   "Years Experience" should be `10`.
    *   "Coffees" card should appear.

### 2.5 Failure Recovery Testing
*This section tests system resilience.*

**Test 1: Missing Config**
1.  Stop server (`Ctrl+C`).
2.  Delete `data/config.json`.
3.  Start server (`npm run dev`).
4.  **Result:** Server starts, default config created, site works.

**Test 2: Corrupted Database**
1.  Edit `data/projects.json` and add a syntax error (remove a closing `}`).
2.  Refresh Homepage.
3.  **Result:** Site should NOT crash. Should show 0 projects or restore from backup (check console logs).

**Test 3: Missing Uploads Folder**
1.  Delete `public/uploads` folder.
2.  Visit `/api/health`.
3.  **Result:** Status should report `created` or `healthy` (it re-creates on check).

---

## ⚡ 3. Persistence Verification
GitHub Codespaces filesystem is **ephemeral** outside of `/workspaces`.
*   **Committed files** persist.
*   **Uncommitted uploads** in `public/uploads` will be LOST if you delete the Codespace.
*   **Recommendation:** Commit uploads to Git if they are permanent sample data.

---

## 🚑 Troubleshooting
*   **Login fails:** Check `.env.local` matches input.
*   **Upload fails:** Check `/api/health` for write permissions.
*   **Port 3000 not open:** Run `npm run dev`. Wait for "Ready".
*   **"Env keys missing":** Delete `.env.local` and restart `npm run dev`.

---
*Generated for Ultra-Premium Portfolio Platform - 2026*
