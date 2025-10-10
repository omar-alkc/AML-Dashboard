# AML Dashboard - Backend Data Layer Setup Guide

This guide explains how to set up and use the configurable data layer backend for the AML Dashboard.

## Quick Start

### 1. Start Redis

```bash
# Using Docker (recommended)
docker run -d --name aml-redis -p 6379:6379 redis:7-alpine

# OR install Redis locally
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis
# Linux: sudo apt-get install redis-server
```

### 2. Configure Backend

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# Edit src/config/googlesheets.json with your Google credentials
```

### 3. Install & Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend will start on `http://localhost:3000`

### 4. Configure Frontend

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  cacheMonths: 3,
  useBackendData: true, // Set to true to use backend
};
```

### 5. Start Frontend

```bash
npm start
```

Dashboard will be available at `http://localhost:4200`

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Angular Dashboard                     │
│  (AML Monitoring, Screening, GoAML Reports pages)      │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP/REST
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Backend API (Node.js/Express)              │
│  - Data Controllers                                     │
│  - Business Logic Services                              │
│  - Data Connectors (Oracle, Google Sheets)             │
└──────────────────────────┬──────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    ↓             ↓
         ┌──────────────┐  ┌─────────────────┐
         │ Redis Cache  │  │  Data Sources   │
         │ (3 months)   │  │  - Oracle AML   │
         │ ~100MB       │  │  - Oracle Screen│
         └──────────────┘  │  - Google Sheets│
                           └─────────────────┘
```

## Configuration Details

### Oracle Database Setup

**Required Tables:**

1. **DETECTIONS** (Eastnets AML)
   - Columns: ID, SCENARIO_NAME, STATUS, DETECTION_DATE, STATUS_CHANGE_DATE, MODIFIED_BY

2. **SCREENING_RECORDS** (Eastnets Screening)
   - Columns: ID, CUSTOMER_ID, SCREENING_DATE, STATUS, HIT_TYPE, INVESTIGATOR, RESOLUTION_DATE

**Connection String Format:**
```
//hostname:port/servicename
Example: //192.168.1.100:1521/XEPDB1
```

### Google Sheets Setup

**Steps:**

1. **Create Google Cloud Project**
   - Visit: https://console.cloud.google.com/
   - Create new project: "AML Dashboard"

2. **Enable Google Sheets API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Name: "AML Dashboard Service"
   - Download JSON key file

4. **Share Google Sheets**
   - Open your screening/GoAML Google Sheets
   - Click "Share"
   - Add service account email (from JSON file)
   - Grant "Viewer" permission

5. **Update Configuration**
   - Copy contents from downloaded JSON to `backend/src/config/googlesheets.json`
   - Add your Sheet IDs and ranges

**Finding Sheet ID:**
```
URL: https://docs.google.com/spreadsheets/d/1abc123def456/edit
                                            ↑
                                      This is your Sheet ID
```

## Data Flow

### Initial Load (on backend startup)

```
1. Backend starts
   ↓
2. Connect to all data sources (Oracle, Google Sheets)
   ↓
3. Cache Warming: Load last 3 months
   - Detections from Oracle AML (~30K records)
   - Screening from Oracle + Sheets (~15K records)
   - GoAML Reports from Sheets (~2K records)
   ↓
4. Store in Redis with 90-day TTL
   ↓
5. Pre-compute KPIs (daily alert counts, trends, etc.)
   ↓
6. Backend ready (30-60 seconds total)
```

### Daily Updates (automatic at 2 AM)

```
1. Fetch yesterday's data from all sources
   ↓
2. Add new data to cache
   ↓
3. Remove data older than 90 days
   ↓
4. Recompute aggregates
   ↓
5. Log completion status
```

### Dashboard Requests

```
User selects date range in dashboard
   ↓
Frontend: GET /api/data/detections?startDate=2024-01-01&endDate=2024-03-31
   ↓
Backend: Check Redis cache
   ↓
┌─ Cache HIT (within 3 months) ─────┐
│  Return data immediately (5-50ms) │
└───────────────────────────────────┘
   ↓
┌─ Cache MISS (outside 3 months) ───┐
│  1. Query Oracle database         │
│  2. Cache results                 │
│  3. Return data (2-10 seconds)    │
└───────────────────────────────────┘
```

## Switching Between Mock and Real Data

### Development Mode (Mock Data)

`src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useBackendData: false, // ← Use mock data
};
```

**Benefits:**
- Fast development without database access
- No backend dependencies
- Works offline
- Consistent test data

### Backend Mode (Real Data)

`src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useBackendData: true, // ← Use backend API
};
```

**Benefits:**
- Real-time data from production systems
- Test data integration
- Validate backend API
- Performance testing

## Production Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# Services started:
# - Redis (port 6379)
# - Backend (port 3000)
# - Nginx (port 80) serving Angular + proxying /api to backend
```

### Option 2: Manual Deployment

**Backend:**
```bash
cd backend
npm install
npm run build
NODE_ENV=production PORT=3000 npm start
```

**Frontend:**
```bash
ng build --prod
# Deploy dist/ folder to web server
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    
    # Angular app
    location / {
        root /var/www/aml-dashboard;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
    }
}
```

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:3000/health

# All data sources
curl http://localhost:3000/api/config/datasources/health

# Cache statistics
curl http://localhost:3000/api/cache/stats
```

### Manual Cache Refresh

```bash
# Trigger immediate cache refresh
curl -X POST http://localhost:3000/api/cache/refresh

# Invalidate specific cache pattern
curl -X DELETE http://localhost:3000/api/cache/invalidate \
  -H "Content-Type: application/json" \
  -d '{"pattern": "detections:*"}'
```

### Logs

```bash
# Development
cd backend && npm run dev

# Production (Docker)
docker-compose logs -f backend

# Production (systemd)
journalctl -u aml-backend -f
```

## Troubleshooting

### Problem: "Failed to connect to Redis"

**Solution:**
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not running, start Redis
docker start aml-redis
# OR
redis-server
```

### Problem: "Oracle connection failed"

**Solutions:**
1. Verify credentials in `.env`
2. Test connection from command line:
   ```bash
   sqlplus username/password@//host:port/service
   ```
3. Check firewall rules (port 1521)
4. Ensure Oracle TNS configuration is correct

### Problem: "Dashboard shows no data"

**Diagnosis:**
```bash
# Check backend logs
cd backend && npm run dev
# Look for cache warming status

# Check if data is in cache
redis-cli
> KEYS detections:*
> GET "detections:all:2024-01-01:2024-10-10"
```

**Solution:**
```bash
# Manually trigger cache refresh
curl -X POST http://localhost:3000/api/cache/refresh
```

### Problem: "Google Sheets 403 Forbidden"

**Solutions:**
1. Verify sheet is shared with service account email
2. Check service account has "Viewer" permission
3. Verify `client_email` in `googlesheets.json` matches
4. Ensure Google Sheets API is enabled in Google Cloud Console

### Problem: "Slow dashboard loading"

**Diagnosis:**
```bash
# Check cache hit rate
curl http://localhost:3000/api/cache/stats

# Low hit rate (<80%) indicates:
# - Cache not warming properly
# - Date ranges outside cache window
# - Cache expired
```

**Solution:**
```bash
# Increase cache window
# Edit backend/.env:
CACHE_MONTHS=6

# Restart backend
```

## Performance Metrics

### Expected Performance

| Metric | Value |
|--------|-------|
| Backend startup time | 30-60 seconds |
| Cache warming time | 30-60 seconds |
| API response (cache hit) | 5-50ms |
| API response (cache miss) | 2-10 seconds |
| Daily update duration | 2-5 minutes |
| Redis memory usage | ~100MB |

### Optimization Tips

1. **Increase Connection Pool Size** (high load)
   - Edit `OracleConnector.ts`: increase `poolMax`

2. **Reduce Cache Window** (low memory)
   - Edit `.env`: reduce `CACHE_MONTHS`

3. **Add Read Replicas** (Oracle performance)
   - Point backend to Oracle read replica

4. **Enable Redis Persistence** (data durability)
   ```bash
   redis-server --appendonly yes
   ```

## Next Steps

### Phase 2: Customer Behavior Page

Currently deferred due to large dataset (9M financial transactions).

**Future Implementation:**
- Add PostgreSQL cache database for large datasets
- Implement data aggregation pipeline
- Add incremental loading for transaction details

See: `docs/PHASE2_CUSTOMER_BEHAVIOR.md` (to be created)

## Support

For issues or questions:
1. Check backend logs: `backend/npm run dev`
2. Review this guide's Troubleshooting section
3. Check backend README: `backend/README.md`
4. Verify data source connections health check

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Oracle passwords are strong and rotated regularly
- [ ] Google service account has minimal permissions
- [ ] Redis password is set in production
- [ ] CORS origins are properly configured
- [ ] SSL/TLS is enabled for production API
- [ ] Database connections use encrypted connections
- [ ] API rate limiting is configured
- [ ] Monitoring and alerting is set up

