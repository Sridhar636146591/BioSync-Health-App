# 🚀 Quick Deploy Checklist

## Before Deployment

- [x] `.gitignore` created
- [x] `render.yaml` created
- [x] `README.md` created
- [x] `vite.config.ts` optimized
- [x] `package.json` updated with Node version

## Deploy Now

### 1️⃣ Initialize Git
```bash
cd "c:\Users\Sridhar\OneDrive\Desktop\Documents\projects\web (2)\web"
git init
git add .
git commit -m "Ready for deployment"
```

### 2️⃣ Create GitHub Repo
- Go to: https://github.com/new
- Name: `biosync-health`
- Don't initialize with README

### 3️⃣ Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/biosync-health.git
git branch -M main
git push -u origin main
```

### 4️⃣ Deploy on Render
- Go to: https://render.com
- New + → Static Site
- Connect your repo
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Click Deploy!

### 5️⃣ Live! 🎉
Your app: `https://biosync-health.onrender.com`

---

## Test Locally First (Optional)
```bash
npm install
npm run build
npm run preview
```
Open: http://localhost:3000

---

**Need detailed steps?** See `DEPLOYMENT_GUIDE.md`
