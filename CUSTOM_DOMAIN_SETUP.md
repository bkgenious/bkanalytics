# 🌐 Custom Domain Setup (Hostinger + Vercel)

This guide explains how to get your portfolio live at `bkanalytics.in`.

## 1. Deploy to Vercel

We recommend Vercel for hosting because it's free, fast, and integrates perfectly with Next.js.

1. **Sign Up**: Go to [vercel.com](https://vercel.com) and sign up with GitHub.
2. **Import Project**:
   - Click "Add New Project".
   - Select your Portfolio repository.
   - **Framework Preset**: Next.js.
   - **Root Directory**: `./` (Default).
   - **Environment Variables**:
     - Copy them from your `.env.local` or `.env.example`.
     - `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`.
   - Click **Deploy**.

## 2. Connect Custom Domain

1. Go to your Vercel Project Dashboard -> **Settings** -> **Domains**.
2. Enter `bkanalytics.in` and click **Add**.
3. Choose the option recommended (usually "Add bkanalytics.in and www.bkanalytics.in").

## 3. Configure DNS (Hostinger)

Vercel will give you immediate instructions (likely A Record or CNAME). Login to Hostinger:

1. **Access DNS Zone**: Hostinger Dashboard -> Domains -> bkanalytics.in -> DNS / Name Servers.
2. **Add Records** (Standard Vercel Setup):
   - **Type**: `A`
   - **Name**: `@`
   - **Value**: `76.76.21.21` (Verify this in Vercel!)
   
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Value**: `cname.vercel-dns.com` (Verify this in Vercel!)

3. **Save**. Propagation happens in minutes usually.

## 4. Verification

1. Visit `https://bkanalytics.in`.
2. The site should load.
3. Try to go to `/admin`. It should work but warn you that it's "Read Only" or block edits.

## 🔄 Rollback Strategy

If a deployment breaks:
1. Go to Vercel Dashboard -> Deployments.
2. Click the three dots on the previous working deployment.
3. Select "Redeploy" or "Promote to Production".
