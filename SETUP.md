# Sanctuary — Setup Guide

## One-Time Setup (Home Machine)

### 1. Update package.json with your GitHub info
Open `package.json` and replace `GITHUB_USERNAME` with your actual GitHub username:
```json
"publish": {
  "provider": "github",
  "owner": "YOUR_GITHUB_USERNAME",
  "repo": "sanctuary",
  "private": true
}
```

### 2. Add GitHub token to repo secrets
Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret

- Name: `GH_TOKEN`
- Value: Your GitHub Personal Access Token (needs `repo` scope)

This lets GitHub Actions build and publish the `.exe` automatically.

### 3. Generate a Gist token for sync
Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
- Name: `sanctuary-sync`
- Check only: **gist**
- Generate and copy the token

### 4. Enter the token in the app
Open Sanctuary → click **☁ Sync** → click **⚙** → paste your Gist token → Save

---

## Every Sunday — Home Machine

1. Open Sanctuary (`npm run dev`)
2. Build your service order, add songs, set countdown
3. Click **☁ Sync** to push to cloud
4. Done — church laptop will auto-load it

---

## Church Laptop — One-Time Install

1. Download `Sanctuary Setup 1.0.0.exe` from GitHub releases
2. Run it — Sanctuary installs like any normal app
3. Open Sanctuary — it auto-loads the latest service from cloud
4. Enter the Gist token in Sync settings (one time only)

---

## Getting Updates (Church Laptop)

Nothing to do. When you push a new release:
- Church laptop opens Sanctuary
- App silently downloads the update in background
- Small banner appears: "Update ready — Restart to update"
- Click it, app restarts with new version

---

## Workflow Summary

```
Home machine              GitHub              Church laptop
     |                       |                      |
Build service         Auto-builds .exe         Runs installed .exe
Click ☁ Sync    →    Stores in Gist    →    Auto-loads on open
Push to main    →    Publishes release →    Auto-updates silently
```
