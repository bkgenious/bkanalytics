# 🦅 Codespaces CMS Guide

**Welcome to your new Portfolio CMS.**

Your portfolio uses a generic, powerful architecture:
- **Codespaces** = **Editing Environment (CMS)**. This is where you write content.
- **Production (Vercel)** = **Live Site**. This is read-only and fast.

## 📝 How to Edit Content

1. **Open Codespaces**: Go to your GitHub Repo -> Codespaces -> Open.
2. **Start the App**: Run `npm run dev` in the terminal.
3. **Login to Admin**: Open the "Ports" tab -> Click the Globe icon for Port 3000 -> Go to `/admin`.
4. **Login**: Default is `admin` / `Portfolio@2024`.

You can now:
- Create Projects
- Upload Images/Videos (Drag & Drop)
- Edit Metadata

## 🚀 How to Publish to Live

When you are happy with your changes:

1. Go to **Admin Panel** -> **Publish**.
2. Click **🚀 Publish Now**.
3. Wait ~2-3 minutes.

**What happens?**
- The system automatically commits your changes to Git.
- It pushes them to your repository.
- Vercel detects the change and redeploys your live site.

## ⚠️ Important Rules

1. **Never Edit in Production**: You cannot log in or edit on `bkanalytics.in`. It is read-only.
2. **Filesystem**: Codespaces is the *only* place where files stick. If you upload a file, you *must* Publish to save it permanentely.
3. **Secrets**: To make Publishing work, you need a secret named `GITHUB_PAT` in your Codespaces settings.

## 🛠️ Setup: Enabling the "Publish" Button

To make the magic button work, the system needs permission to write to your repo.

1. **Generate Token**:
   - Go to GitHub -> Settings -> Developer Settings -> Personal Access Tokens -> Tokens (classic).
   - Generate New Token.
   - Scopes: `repo` (Full control of private repositories).
   - Copy the token.

2. **Add to Codespaces**:
   - Go to your Repo -> Settings -> Secrets and variables -> Codespaces.
   - New Repository Secret.
   - Name: `GITHUB_PAT`.
   - Value: (Paste your token).

3. **Restart**: Reload your Codespace for the secret to take effect.
