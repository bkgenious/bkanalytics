# 🏗️ Production Publishing Architecture

This document explains the "Safety-First" architecture used to host your portfolio.

## Core Concept: "Headless Git CMS"

Your portfolio uses a unique architecture that combines the free editing power of Codespaces with the speed and reliability of Vercel.

| Environment | Role | Write Access | Edit Method |
| :--- | :--- | :--- | :--- |
| **GitHub Codespaces** | **CMS** | ✅ **Writable** | Admin Panel |
| **Production (Vercel)** | **Live Site** | ❌ **Read-Only** | *Disabled* |

### Why Read-Only Production?
Serverless hosting platforms like Vercel have **ephemeral filesystems**. This means if you uploaded a file directly to the live site, it would vanish after a few minutes. To prevent data loss, we strictly block all edits on the live site.

## 🔄 The Publish Workflow

How do changes get from Codespaces to `bkanalytics.in`?

1.  **Edit**: You make changes in Codespaces (e.g., upload a new dashboard). These are saved to your private Codespace filesystem.
2.  **Trigger**: You click **"Publish Now"** in the Admin Panel.
3.  **Dispatch**: The app calls the GitHub API using a secure token (`GITHUB_PAT`).
4.  **Action**: GitHub starts a background workflow (`publish_content.yml`).
5.  **Commit**: The workflow "snapshots" your `data/` folder and `public/uploads/` folder and commits them to the `main` branch.
6.  **Deploy**: Vercel detects the new commit on `main` and automatically rebuilds your site.

**Total Time**: ~2-3 minutes.

## 🛡️ Safety Mechanisms

- **Environment Detection**: `src/lib/env.js` automatically detects if the app is running in Codespaces or Vercel.
- **Write Blocks**: `src/lib/db.js` and `upload.js` check this environment status. If they detect "Production", they throw an error immediately preventing any confusing "successful" edits that would later discourage data loss.
- **CSRF Protection**: The API verifies that the "Publish" request comes from a trusted admin session.

## ❓ Troubleshooting

**"Publish Failed"**
- Check the **Actions** tab in your GitHub Repository. It will show the logs of the failed run.
- Common cause: Missing `GITHUB_PAT` secret.

**"Editing not allowed"**
- You are trying to edit on the live site (`bkanalytics.in`). Go to your Codespaces URL instead.
