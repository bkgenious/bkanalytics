# Upload Portfolio via GitHub Browser

## Quick Method: Upload as ZIP

### Step 1: Create a ZIP of your project
1. Open File Explorer
2. Navigate to: `C:\Users\user\Documents\personal projects\`
3. Right-click the **Portfolio** folder
4. Select **Compress to ZIP file** (or "Send to → Compressed folder")
5. This creates `Portfolio.zip`

### Step 2: Upload to GitHub
1. Go to your repository: `https://github.com/YOUR_USERNAME/YOUR_REPO`
2. Click **Add file → Upload files**
3. Drag and drop **all files from inside the Portfolio folder** (not the ZIP)
   - OR click "choose your files" and select everything

### Step 3: Exclude These (Don't Upload)
- `node_modules/` folder (will be recreated)
- `.next/` folder (build cache)
- `.env.local` (contains secrets)

---

## Alternative: Use Codespaces Terminal

If you can access your Codespace, you can clone from your local machine:

### In Codespaces Terminal:
```bash
# Delete old files (if any)
rm -rf *

# Then upload files via drag-and-drop into the Codespaces file explorer
```

### Drag and Drop Method:
1. Open your Codespace in browser
2. In the left sidebar, you'll see the file explorer
3. Open File Explorer on Windows showing your Portfolio folder
4. Select all files/folders (except node_modules, .next)
5. Drag them directly into the Codespaces file explorer

---

## After Upload: Run These Commands

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then edit `.env.local` with your admin credentials.
