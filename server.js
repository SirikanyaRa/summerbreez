import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapePostcodeDetails } from './script/scraper-service.js';
import { addCaptchaVerifierRoutes } from './script/captcha-verifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Basic middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Add direct route for the captcha helper page
app.get('/captcha-helper', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'captcha-helper.html'));
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip || 'unknown'}`);
  next();
});

// Store active scraping sessions
const activeSessions = new Map();

// Add captcha verifier routes
addCaptchaVerifierRoutes(app);

// Session cleanup - remove completed/errored sessions after 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [sessionId, session] of activeSessions.entries()) {
    const sessionTime = parseInt(sessionId);
    if (sessionTime < oneHourAgo && (session.status === 'completed' || session.status === 'error')) {
      activeSessions.delete(sessionId);
      console.log(`Cleaned up old session: ${sessionId}`);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

// API Routes

// Get all available data files
app.get('/api/data-files', async (req, res) => {
  try {
    const dataDir = path.join(__dirname, 'data');
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json') && !file.includes('_details'));
    
    const fileInfo = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(dataDir, file);
        const data = await fs.readJson(filePath);
        return {
          filename: file,
          recordCount: data.length,
          state: data[0]?.state || 'Unknown',
          city: data[0]?.city || 'Unknown'
        };
      })
    );

    res.json(fileInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data files' });
  }
});

// Get records from a specific file
app.get('/api/data/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'data', filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const data = await fs.readJson(filePath);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Start scraping process
app.post('/api/scrape/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { selectedRecords } = req.body;
    
    const sessionId = Date.now().toString();
    
    // Initialize session
    activeSessions.set(sessionId, {
      status: 'starting',
      progress: 0,
      total: selectedRecords?.length || 0,
      results: [],
      errors: [],
      captchaRequired: false,
      message: 'Initializing scraping process...'
    });

    // Start scraping in background
    scrapePostcodeDetails(filename, selectedRecords, sessionId, activeSessions);
    
    res.json({ 
      sessionId,
      message: 'Scraping process started. Monitor progress using the session ID.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start scraping process' });
  }
});

// Get scraping progress
app.get('/api/progress/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json(session);
});

// Handle CAPTCHA resolution notification
app.post('/api/captcha-solved/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { userCookies, useFreshSession, timestamp, userAgent, resolved } = req.body;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  console.log(`CAPTCHA resolution request received for session ${sessionId}`);
  console.log(`Resolution timestamp: ${timestamp}, User Agent: ${userAgent?.substring(0, 50)}...`);
  
  // Store user's cookies if provided
  if (userCookies && userCookies.trim()) {
    session.userCookies = userCookies.trim();
    console.log(`User cookies stored for session ${sessionId}: ${userCookies.substring(0, 100)}...`);
    session.message = '✅ CAPTCHA solved with your browser cookies! Resuming scraping...';
  } else if (useFreshSession) {
    session.useFreshSession = true;
    console.log(`Fresh session strategy requested for session ${sessionId}`);
    session.message = '✅ CAPTCHA solved! Trying with fresh session strategy...';
  } else {
    console.log(`CAPTCHA resolution without specific strategy for session ${sessionId}`);
    session.message = '✅ CAPTCHA solved! Implementing fresh session strategy...';
  }
  
  // Update session to indicate CAPTCHA was solved
  session.captchaRequired = false;
  session.status = 'running';
  session.captchaSolvedAt = timestamp || Date.now();
  
  console.log(`CAPTCHA marked as resolved for session ${sessionId}`);
  
  res.json({ 
    message: session.userCookies ? 'CAPTCHA resolution with cookies acknowledged.' : 'CAPTCHA resolution acknowledged. Using fresh session strategy.',
    status: session.status,
    captchaRequired: session.captchaRequired,
    strategy: 'fresh_session_with_delays'
  });
});

// Get completed files (files with _details suffix)
app.get('/api/completed-files', async (req, res) => {
  try {
    const dataDir = path.join(__dirname, 'data');
    const files = await fs.readdir(dataDir);
    const completedFiles = files.filter(file => file.endsWith('_details.json'));
    
    const fileInfo = await Promise.all(
      completedFiles.map(async (file) => {
        const filePath = path.join(dataDir, file);
        const stats = await fs.stat(filePath);
        const data = await fs.readJson(filePath);
        return {
          filename: file,
          recordCount: data.length,
          fileSize: Math.round(stats.size / 1024), // Size in KB
          lastModified: stats.mtime.toISOString(),
          downloadUrl: `/api/download/${file}`
        };
      })
    );

    res.json(fileInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read completed files' });
  }
});

// Download a specific completed file
app.get('/api/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'data', filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Debug endpoint to check all active sessions
app.get('/api/debug/sessions', (req, res) => {
  const sessions = Array.from(activeSessions.entries()).map(([id, session]) => ({
    sessionId: id,
    status: session.status,
    progress: session.progress,
    total: session.total,
    captchaRequired: session.captchaRequired,
    message: session.message,
    captchaUrl: session.captchaUrl || null,
    resultCount: session.results?.length || 0,
    errorCount: session.errors?.length || 0
  }));
  
  res.json({ 
    activeSessions: sessions.length,
    sessions 
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint for load balancers
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Graceful shutdown handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Postcode Scraper App running on http://localhost:${PORT}`);
  console.log(`📁 Data files available in: ${path.join(__dirname, 'data')}`);
  console.log(`🔧 Scraper script location: ${path.join(__dirname, 'script')}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`⚡ Node.js version: ${process.version}`);
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

process.on('SIGTERM', () => {
  console.log('📡 SIGTERM received');
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📡 SIGINT received');
  gracefulShutdown('SIGINT');
});

function gracefulShutdown(signal) {
  console.log(`🔄 Graceful shutdown initiated by ${signal}`);
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server close:', err);
      process.exit(1);
    }
    
    console.log('✅ Server closed successfully');
    
    // Clean up active sessions
    activeSessions.clear();
    console.log('🧹 Active sessions cleared');
    
    process.exit(0);
  });
  
  // Force exit after 30 seconds
  setTimeout(() => {
    console.error('⚠️ Forced exit after timeout');
    process.exit(1);
  }, 30000);
}

// Add CAPTCHA verifier routes
addCaptchaVerifierRoutes(app, activeSessions);
