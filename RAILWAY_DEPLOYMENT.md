# Railway Deployment Guide

## ✅ Issues Fixed

### 1. **500 Error on `/api/auth/login`**
- **Problem**: Server was crashing if database connection failed
- **Solution**: 
  - Made database connection non-blocking on startup
  - Added support for Railway's `DATABASE_URL` format
  - Server now starts even if DB connection fails (allows health checks to pass)

### 2. **404 Favicon Error**
- **Problem**: Browser requesting `/favicon.ico` that doesn't exist
- **Solution**: Added a favicon handler that returns 204 (No Content)

---

## 🚀 Deployment Steps on Railway

### Step 1: Add MySQL Database on Railway
1. Go to your Railway project dashboard
2. Click **"New"** → **"Database"** → **"Add MySQL"**
3. Railway will automatically create these environment variables in your service:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQL_URL` (connection string)

### Step 2: Link Database to Your App
1. In Railway, click on your **web service**
2. Go to **"Settings"** → **"Service Variables"**
3. You should see MySQL variables automatically linked
4. **Add one more variable manually**:
   - `JWT_SECRET` = `your_secure_random_string_here_change_this`

### Step 3: Deploy
1. **Commit and push** these changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix: Railway deployment issues - DB connection and favicon"
   git push origin main
   ```

2. Railway will automatically detect the push and redeploy

### Step 4: Verify Deployment
1. Wait for deployment to complete (watch the logs)
2. Visit your Railway URL (e.g., `https://your-app.up.railway.app`)
3. Check the logs for:
   ```
   🚀 Server is running on port 3000
   🔄 Attempting database connection...
   ✅ MySQL connected successfully
   ✅ Database tables checked/created
   ✅ Initial data seeded
   ```

---

## 🔍 Troubleshooting

### If you still see 500 errors:

1. **Check Railway Logs**:
   - Go to your service → "Deployments" → Click latest deployment
   - Look for database connection errors

2. **Verify Environment Variables**:
   - Service → "Settings" → "Variables"
   - Make sure `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` exist

3. **Check Database Status**:
   - Click on your MySQL database service
   - Make sure it shows "Active" and "Deployed"
   - Visit your app's `/health` endpoint: `https://your-app.up.railway.app/health`
   - Should return: `{"status":"OK","database":"connected"}`

4. **Manual Database Connection String** (if auto-linking fails):
   - Go to MySQL service → "Connect"
   - Copy the `MYSQL_URL` value
   - Add it as `DATABASE_URL` in your web service variables

---

## 📝 Test Login After Deployment

1. Visit your Railway URL
2. Default credentials (created by seed.js):
   - **Username**: `admin`
   - **Password**: `admin123`

---

## 🔐 Important Security Note

**Before going to production**, change these in Railway variables:
- `JWT_SECRET` → Use a long random string
- Create a new admin user with a strong password
- Consider removing the seeding of default users in production

---

## 📊 Monitoring

Monitor your app at:
- **Health Check**: `https://your-app.up.railway.app/health`
- **Railway Logs**: Service → Deployments → [Latest] → Logs
- **Metrics**: Railway dashboard shows CPU, Memory, Network usage
