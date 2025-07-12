# Malaysian Postcode Scraper Web Application

A web application for scraping detailed postcode information from postcode.my with intelligent CAPTCHA handling.

## Features

- 🗂️ **File Management**: Browse and select from available data files
- 🚀 **Smart Scraping**: Automated data extraction with anti-detection measures
- 🛡️ **CAPTCHA Handling**: Intelligent detection and manual resolution support
- 🧩 **Direct CAPTCHA Solver**: New tool for solving CAPTCHAs directly (see below)
- 📊 **Real-time Progress**: Live progress tracking and status updates
- 📋 **Results Preview**: View scraped data in real-time
- ⚡ **Background Processing**: Non-blocking scraping operations

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Application**
   ```bash
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## How It Works

### 1. Select Data File
- Choose from available JSON files containing postcode URLs
- View file information (state, city, record count)

### 2. Start Scraping
- Click "Start Scraping" to begin the process
- Monitor real-time progress and status updates

### 3. Handle CAPTCHAs
When a CAPTCHA is detected:
- 🛑 **Automatic Detection**: The system pauses and alerts you
- 🌐 **Manual Resolution**: Click the provided link to solve the CAPTCHA
- ✅ **Continue**: Resume scraping after solving

### 4. View Results
- Real-time results table showing latest scraped data
- Detailed progress tracking with error reporting
- Results saved to `*_details.json` files

## CAPTCHA Handling Process

The application includes sophisticated CAPTCHA detection and handling:

```
📋 CAPTCHA Detection → 🌐 Manual Resolution → ✅ Resume Scraping
```

**When CAPTCHA is detected:**
1. Scraping automatically pauses
2. Alert shows with target URL
3. User solves CAPTCHA manually in browser
4. Click "Continue Scraping" to resume
5. Process continues automatically

## API Endpoints

- `GET /api/data-files` - List available data files
- `GET /api/data/:filename` - Get records from specific file
- `POST /api/scrape/:filename` - Start scraping process
- `GET /api/progress/:sessionId` - Get scraping progress
- `POST /api/captcha-solved/:sessionId` - Acknowledge CAPTCHA resolution

## File Structure

```
forDeploying/
├── server.js              # Express server
├── package.json           # Dependencies
├── public/
│   └── index.html        # Web interface
├── script/
│   └── scraper-service.js # Scraping logic
└── data/
    ├── perlis_1.json     # Input data files
    └── perlis_1_details.json # Output results
```

## Anti-Detection Features

- **User-Agent Rotation**: 7 different browser signatures
- **Random Delays**: 2-8 second intervals between requests
- **Session Management**: Cookie persistence across requests
- **Retry Logic**: Exponential backoff for failed requests
- **CAPTCHA Detection**: Multiple trigger patterns

## Error Handling

- Network timeouts and retries
- CAPTCHA detection and manual resolution
- Session management and recovery
- Graceful error reporting and logging

## Development

To modify the scraping logic, edit `script/scraper-service.js`
To customize the UI, edit `public/index.html`

## Notes

- Always respect website terms of service
- Use reasonable delays between requests
- Handle CAPTCHAs promptly to maintain session
- Monitor progress for any issues

## 🌐 Public Deployment

### Option 1: Heroku (Recommended for beginners)

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Prepare for Heroku**
   ```bash
   # Login to Heroku
   heroku login
   
   # Create new app
   heroku create your-postcode-scraper
   
   # Set Node.js version
   echo "18.x" > .nvmrc
   ```

3. **Deploy**
   ```bash
   # Initialize git (if not already)
   git init
   git add .
   git commit -m "Initial deployment"
   
   # Deploy to Heroku
   git push heroku main
   ```

4. **Configure Environment**
   ```bash
   # Set production port
   heroku config:set NODE_ENV=production
   ```

### Option 2: Railway (Modern & Simple)

1. **Connect GitHub**
   - Push code to GitHub repository
   - Visit [railway.app](https://railway.app)
   - Connect your GitHub account

2. **Deploy**
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Railway auto-detects Node.js and deploys

3. **Custom Domain** (Optional)
   - Go to project settings
   - Add custom domain under "Domains"

### Option 2A: GitHub Pages + GitHub Actions (Static hosting)

**Note**: This option requires converting to a static site or using GitHub Pages with a build process.

1. **Enable GitHub Pages**
   ```bash
   # Push to GitHub first
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Select source: "Deploy from a branch"
   - Choose `main` branch
   - Your site will be at: `https://username.github.io/repository-name`

### Option 2B: GitHub Codespaces (Development & Demo)

1. **Create Codespace**
   - Go to your GitHub repository
   - Click "Code" → "Codespaces" → "Create codespace"
   - Codespace will automatically install dependencies

2. **Run Application**
   ```bash
   npm install
   npm start
   ```

3. **Public Access**
   - Codespace will provide a public URL
   - Perfect for demos and development

### Option 2C: GitHub Actions + Cloud Provider

**Automated deployment using GitHub Actions:**

1. **Setup GitHub Secrets**
   - Go to repository Settings → Secrets and variables → Actions
   - Add deployment credentials (API keys, tokens, etc.)

2. **Automatic Deployment**
   - Every push to `main` triggers deployment
   - Supports Heroku, Railway, DigitalOcean, AWS, etc.
   - Zero-downtime deployments

### Option 3: Render (Free tier available)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Deploy on Render**
   - Visit [render.com](https://render.com)
   - Connect GitHub account
   - Click "New Web Service"
   - Select your repository

3. **Configuration**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node.js

### Option 4: DigitalOcean App Platform

1. **Prepare Code**
   ```bash
   git add .
   git commit -m "Deploy to DigitalOcean"
   git push origin main
   ```

2. **Deploy**
   - Visit [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Connect GitHub repository
   - Configure build and run commands

### Option 5: Self-hosted VPS (Advanced)

1. **Server Setup** (Ubuntu/Debian)
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone your repository
   git clone https://github.com/yourusername/postcode-scraper.git
   cd postcode-scraper/forDeploying
   
   # Install dependencies
   npm install --production
   
   # Start with PM2
   pm2 start server.js --name "postcode-scraper"
   pm2 startup
   pm2 save
   ```

3. **Setup Nginx (Optional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/postcode-scraper
   ```

## 🔧 Production Configuration

### Environment Variables

Create a `.env` file for production settings:

```env
NODE_ENV=production
PORT=3000
MAX_CONCURRENT_REQUESTS=5
REQUEST_DELAY_MIN=3000
REQUEST_DELAY_MAX=8000
```

### Security Considerations

- **Rate Limiting**: Implement request rate limiting
- **CORS**: Configure CORS for your domain only
- **HTTPS**: Always use HTTPS in production
- **Monitoring**: Set up logging and monitoring

### Performance Optimization

- Use `NODE_ENV=production`
- Implement caching for static files
- Monitor memory usage during long scraping sessions
- Consider using a job queue for large datasets

## 🚨 Important Deployment Notes

### Legal & Ethical Considerations
- **Respect robots.txt**: Check target website's robots.txt
- **Terms of Service**: Ensure compliance with website ToS
- **Rate Limiting**: Use reasonable delays (3-8 seconds)
- **No Abuse**: Don't overwhelm the target server

### Monitoring & Maintenance
- **Logs**: Monitor application logs regularly
- **Updates**: Keep dependencies updated
- **Backups**: Backup scraped data regularly
- **Health Checks**: Implement health check endpoints

### Scaling Considerations
- **Memory**: Monitor memory usage for large files
- **Storage**: Plan for growing data storage needs
- **Bandwidth**: Consider bandwidth costs
- **Concurrent Users**: Limit concurrent scraping sessions

---

Happy scraping! 🚀

## CAPTCHA Issues? Try our new solution!

If you encounter CAPTCHA issues or pages not displaying correctly, we have new tools:

1. **Web-based CAPTCHA Helper**
   Navigate to `http://localhost:3000/captcha-helper` for a user-friendly interface to solve CAPTCHAs

2. **Windows Users - One-Click Solution**
   Run `solve-captcha.bat` and follow the prompts

3. **Command Line Solution**
   ```bash
   npm run solve-captcha -- https://postcode.my/your-problematic-url
   ```

For detailed instructions, see [DIRECT_CAPTCHA_SOLUTION.md](./DIRECT_CAPTCHA_SOLUTION.md)
