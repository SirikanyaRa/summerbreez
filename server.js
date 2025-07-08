import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapePostcodeDetails } from './script/scraper-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store active scraping sessions
const activeSessions = new Map();

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
    const { selectedRecords, bypassCaptchaDetection } = req.body;
    
    const sessionId = Date.now().toString();
    
    // Initialize session
    activeSessions.set(sessionId, {
      status: 'starting',
      progress: 0,
      total: selectedRecords?.length || 0,
      results: [],
      errors: [],
      captchaRequired: false,
      bypassCaptchaDetection: bypassCaptchaDetection || false,
      message: 'Initializing scraping process...'
    });

    // Start scraping in background
    scrapePostcodeDetails(filename, selectedRecords, sessionId, activeSessions);
    
    res.json({ 
      sessionId,
      message: 'Scraping process started. Monitor progress using the session ID.',
      bypassCaptchaDetection: bypassCaptchaDetection || false
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
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  console.log(`CAPTCHA resolution request received for session ${sessionId}`);
  
  // Update session to indicate CAPTCHA was solved
  session.captchaRequired = false;
  session.status = 'running';
  session.message = '✅ CAPTCHA solved! Resuming scraping process...';
  
  console.log(`CAPTCHA marked as resolved for session ${sessionId}`);
  
  res.json({ 
    message: 'CAPTCHA resolution acknowledged',
    status: session.status,
    captchaRequired: session.captchaRequired
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

app.listen(PORT, () => {
  console.log(`🚀 Postcode Scraper App running on http://localhost:${PORT}`);
  console.log(`📁 Data files available in: ${path.join(__dirname, 'data')}`);
  console.log(`🔧 Scraper script location: ${path.join(__dirname, 'script')}`);
});
