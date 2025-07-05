# NSE Scraper

A Node.js application that scrapes NSE (National Stock Exchange) data using Puppeteer.

## Features

- Fetches historical stock data from NSE
- RESTful API endpoint for data retrieval
- Docker support for easy deployment

## API Endpoints

### GET /nse-data
Fetches historical stock data from NSE.

**Query Parameters:**
- `symbol` (required): Stock symbol (e.g., RELIANCE, TCS)
- `fromDate` (required): Start date in DD-MM-YYYY format
- `toDate` (required): End date in DD-MM-YYYY format

**Example:**
```
GET /nse-data?symbol=RELIANCE&fromDate=01-01-2024&toDate=31-01-2024
```

### GET /health
Health check endpoint to verify service status.

## Docker Usage

### Using Docker Compose (Recommended)

1. Build and run the application:
```bash
docker-compose up --build
```

2. The API will be available at `http://localhost:3000`

### Using Docker directly

1. Build the Docker image:
```bash
docker build -t nse-scraper .
```

2. Run the container:
```bash
docker run -p 3000:3000 nse-scraper
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## Deployment on Render.com

This application is configured for deployment on Render.com using Docker.

### Automatic Deployment
1. Connect your GitHub repository to Render.com
2. The `render.yaml` file will automatically configure the deployment
3. Render will use the Dockerfile to build and deploy your application

### Manual Deployment
If you prefer manual deployment:
1. Create a new Web Service on Render.com
2. Select "Docker" as the runtime
3. Connect your GitHub repository
4. Render will automatically detect the Dockerfile and deploy

### Environment Variables
The following environment variables are automatically set:
- `NODE_ENV=production`
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`

### Health Check
Render.com will automatically check the `/health` endpoint to ensure your service is running properly.