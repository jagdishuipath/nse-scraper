
const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

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
  try {
    const { symbol, fromDate, toDate } = req.query;
    
    // Validate required parameters
    if (!symbol || !fromDate || !toDate) {
      return res.status(400).json({ 
        error: 'Missing required parameters: symbol, fromDate, toDate' 
      });
    }

    const browser = await puppeteer.launch({
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
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.nseindia.com/',
      'Accept-Language': 'en-US,en;q=0.9'
    });

    const url = `https://www.nseindia.com/api/historicalOR/generateSecurityWiseHistoricalData?from=${fromDate}&to=${toDate}&symbol=${symbol}&type=priceVolumeDeliverable&series=ALL`;

    const response = await page.goto(url, { waitUntil: 'networkidle0' });
    const body = await response.text();
    const data = JSON.parse(body);

    await browser.close();
    res.json({ data });
  } catch (error) {
    console.error('Error fetching NSE data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch NSE data', 
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

