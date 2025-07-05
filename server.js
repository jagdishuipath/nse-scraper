
const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

// Global timeout setting
const TIMEOUT = 60000;

// Increase max listeners to prevent warnings
process.setMaxListeners(20);

// Set memory management
process.env.UV_THREADPOOL_SIZE = 4;

// Add basic error handling middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NSE Scraper API',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'NSE Scraper API is running',
    endpoints: {
      health: '/health',
      nseData: '/nse-data?symbol=SYMBOL&fromDate=DD-MM-YYYY&toDate=DD-MM-YYYY'
    }
  });
});

app.get('/nse-data', async (req, res) => {
  let browser = null;
  try {
    const { symbol, fromDate, toDate } = req.query;
    
    // Validate required parameters
    if (!symbol || !fromDate || !toDate) {
      return res.status(400).json({ 
        error: 'Missing required parameters: symbol, fromDate, toDate' 
      });
    }

    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--memory-pressure-off',
        '--max_old_space_size=256',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });

    const page = await browser.newPage();
    
    // Set global timeout for page operations
    page.setDefaultTimeout(TIMEOUT);
    page.setDefaultNavigationTimeout(TIMEOUT);

    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.nseindia.com/',
      'Accept-Language': 'en-US,en;q=0.9'
    });

    const url = `https://www.nseindia.com/api/historicalOR/generateSecurityWiseHistoricalData?from=${fromDate}&to=${toDate}&symbol=${symbol}&type=priceVolumeDeliverable&series=ALL`;

    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: TIMEOUT 
    });
    const body = await response.text();
    const data = JSON.parse(body);

    await browser.close();
    browser = null;
    res.json({ data });
  } catch (error) {
    console.error('Error fetching NSE data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch NSE data', 
      message: error.message 
    });
  } finally {
    // Ensure browser is always closed
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

