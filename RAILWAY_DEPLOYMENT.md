# 🚄 Railway Deployment Guide - Malaysian Postcode Scraper

Railway is the **fastest and easiest** way to deploy your postcode scraper application. This guide will get you deployed in under 5 minutes!

## 🎯 Why Railway?

- ⚡ **Ultra-fast deployment** (2-3 minutes)
- 🔄 **Auto-deployment** from GitHub
- 🔒 **Automatic HTTPS** 
- 📈 **Auto-scaling**
- 💰 **Generous free tier**
- 🛠️ **Zero configuration** needed

## 🚀 Quick Deployment (5 Steps)

### Step 1: Prepare Your Code (1 minute)
```bash
# Run the Railway preparation script
npm run deploy:railway-prepare

# Or manually:
git add .
git commit -m "Deploy to Railway"
git push
```

### Step 2: Connect to Railway (1 minute)
1. Visit **[railway.app](https://railway.app)**
2. Click **"Sign in with GitHub"**
3. Authorize Railway to access your repositories

### Step 3: Deploy (30 seconds)
1. Click **"New Project"**
2. Select **"Deploy from GitHub"**
3. Choose your postcode scraper repository
4. Railway automatically detects it's a Node.js app

### Step 4: Automatic Build (2-3 minutes)
Railway automatically:
- ✅ Runs `npm ci --production`
- ✅ Starts with `npm start`
- ✅ Assigns a public URL
- ✅ Enables HTTPS

### Step 5: Access Your App
Your app will be available at:
`https://your-app-name.up.railway.app`

## 📊 After Deployment

### Test Your Deployment
```bash
# Test the health endpoint
curl https://your-app-name.up.railway.app/health

# Test the main application
curl https://your-app-name.up.railway.app/api/data-files
```

### Monitor Your App
- **Railway Dashboard**: Real-time logs and metrics
- **Health Check**: `https://your-domain/health`
- **Debug Info**: `https://your-domain/api/debug/sessions`

## 🔧 Configuration

### Environment Variables (Optional)
Railway automatically sets:
- `NODE_ENV=production`
- `PORT` (assigned by Railway)

You can add custom variables in Railway dashboard:
```bash
CORS_ORIGIN=https://your-app-name.up.railway.app
MAX_CONCURRENT_REQUESTS=3
CAPTCHA_TIMEOUT=600000
```

### Custom Domain (Optional)
1. Go to Railway dashboard
2. Click on your service
3. Go to "Settings" → "Domains"
4. Add your custom domain
5. Update DNS records as instructed

## 🔄 Auto-Deployment

Railway automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update scraping logic"
git push

# Railway automatically:
# 1. Detects the push
# 2. Builds your app
# 3. Deploys the new version
# 4. Zero downtime deployment
```

## 📈 Scaling & Performance

### Auto-Scaling
Railway automatically scales based on:
- CPU usage
- Memory usage
- Request volume

### Performance Monitoring
Railway provides:
- **Real-time metrics**
- **Request logs**
- **Error tracking**
- **Performance insights**

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check Railway build logs in dashboard
   # Ensure all dependencies are in package.json
   npm audit --audit-level moderate
   ```

2. **App Not Starting**
   ```bash
   # Verify start script in package.json
   "scripts": {
     "start": "node server.js"
   }
   ```

3. **Environment Issues**
   ```bash
   # Check Railway environment variables
   # Ensure NODE_ENV=production is set
   ```

### Debug Commands
```bash
# View Railway logs
railway logs

# Connect to Railway project
railway login
railway link

# Deploy manually
railway up
```

## 💡 Railway-Specific Features

### Database (If Needed)
```bash
# Add PostgreSQL database
railway add --database postgresql

# Add Redis for sessions
railway add --database redis
```

### Custom Build Command
```toml
# railway.toml (optional)
[build]
command = "npm ci --production"

[deploy]
startCommand = "npm start"

[healthcheck]
path = "/health"
```

### Environment-Specific Settings
```bash
# Development
railway run npm run dev

# Production (automatic)
NODE_ENV=production npm start
```

## 🎉 Success Checklist

After deployment, verify:

- [ ] **App is accessible** at Railway URL
- [ ] **Health check works**: `/health` returns 200
- [ ] **API endpoints work**: `/api/data-files` returns data
- [ ] **Scraping works**: Can start and monitor scraping sessions
- [ ] **CAPTCHA handling**: Manual resolution workflow works
- [ ] **Downloads work**: Can download completed files
- [ ] **Logs are available** in Railway dashboard

## 🌟 Railway Advantages for This App

### Perfect Match for Scraping Apps
- **Long-running processes**: Railway handles background scraping
- **Session management**: Persistent memory for CAPTCHA workflows
- **File storage**: Data directory persists between deployments
- **Monitoring**: Built-in observability for scraping operations

### Cost-Effective
- **Free tier**: Up to $5/month in usage
- **Pay-as-you-scale**: Only pay for what you use
- **No credit card** required to start

### Developer-Friendly
- **GitHub integration**: Push to deploy
- **Real-time logs**: Debug issues instantly
- **Environment management**: Easy variable configuration
- **Team collaboration**: Share access with team members

## 📞 Support

### Railway Resources
- **Documentation**: [docs.railway.app](https://docs.railway.app)
- **Discord Community**: Active support community
- **GitHub Integration**: Seamless workflow

### App-Specific Support
- **Health Endpoint**: Monitor app status
- **Debug API**: Check scraping sessions
- **Comprehensive Logging**: Track all operations

---

## 🎯 One-Command Deployment

```bash
# Single command to prepare and deploy
npm run deploy:railway-prepare
```

Then just connect your GitHub repo to Railway - that's it! 

Your Malaysian postcode scraper will be live and ready to handle production traffic in minutes! 🚀

---

**Railway Deployment URL Format:**
`https://[project-name]-production.up.railway.app`

**Your app will be ready to scrape postcodes at scale!** 🌟
