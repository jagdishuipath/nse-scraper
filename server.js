
const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

app.get('/nse-data', async (req, res) => {
  const { symbol, fromDate, toDate } = req.query;
  const browser = await puppeteer.launch({
	 headless: true,
	 args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json',
    'Referer': 'https://www.nseindia.com/',
    'Accept-Language': 'en-US,en;q=0.9'
  });

  const url = `https://www.nseindia.com/api/historicalOR/generateSecurityWiseHistoricalData?from=${fromDate}&to=${toDate}&symbol=${symbol}&type=priceVolumeDeliverable&series=ALL`;

  const response = await page.goto(url, { waitUntil: 'networkidle0' });
  const body = await response.text();
  const data = JSON.parse(body);

  await browser.close();
  //return data;
  res.json({ data });
});

app.listen(3000, () => console.log('Server running on port 3000'));

