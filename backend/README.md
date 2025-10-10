# AML Dashboard Backend

Configurable backend service for the AML Dashboard, providing data from Oracle databases and Google Sheets with Redis caching.

## Architecture

```
Angular Dashboard (Frontend)
    ↓ HTTP/REST
Backend API (Node.js/Express)
    ↓
Data Abstraction Layer
    ↓
├─ Oracle Connector (Eastnets AML)
├─ Oracle Connector (Eastnets Screening)  
└─ Google Sheets Connector
    ↓
Redis Cache (3-month rolling cache)
```

## Features

- **Configurable Data Sources**: Connect to Oracle databases and Google Sheets
- **Redis Caching**: 3-month rolling cache for fast dashboard performance
- **Daily Incremental Updates**: Automatic cache refresh at 2 AM
- **Runtime Google Sheets Configuration**: Update sheet IDs without redeployment
- **Health Monitoring**: Health check endpoints for all data sources
- **RESTful API**: Standard REST endpoints for all data operations

## Prerequisites

- Node.js 18+ (recommended)
- TypeScript
- Redis server
- Oracle Client libraries (for Thick mode) or use Thin mode
- Google Cloud service account credentials

## Installation

```bash
cd backend
npm install
```

## Configuration

### 1. Database Configuration (.env)

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Oracle - Eastnets AML
ORACLE_AML_USER=your_aml_user
ORACLE_AML_PASSWORD=your_aml_password
ORACLE_AML_CONNECT_STRING=//host:port/service

# Oracle - Eastnets Screening
ORACLE_SCREENING_USER=your_screening_user
ORACLE_SCREENING_PASSWORD=your_screening_password
ORACLE_SCREENING_CONNECT_STRING=//host:port/service

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cache Settings
CACHE_MONTHS=3
DAILY_UPDATE_HOUR=2
```

### 2. Google Sheets Configuration

Update `src/config/googlesheets.json` with your service account credentials:

```json
{
  "credentials": {
    "type": "service_account",
    "project_id": "your-project-id",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
    "client_email": "your-service-account@your-project.iam.gserviceaccount.com"
  },
  "sheets": {
    "screening": {
      "sheetId": "your-screening-sheet-id",
      "range": "Sheet1!A1:Z1000"
    },
    "goaml": {
      "sheetId": "your-goaml-sheet-id",
      "range": "Reports!A1:Z1000"
    }
  }
}
```

**Getting Google Service Account Credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google Sheets API
4. Create a service account
5. Download the JSON key file
6. Share your Google Sheets with the service account email

### 3. Oracle Database Schema

The backend expects the following table structures:

**Detections Table (AML):**
```sql
CREATE TABLE DETECTIONS (
  ID NUMBER PRIMARY KEY,
  SCENARIO_NAME VARCHAR2(50),
  STATUS VARCHAR2(50),
  DETECTION_DATE DATE,
  STATUS_CHANGE_DATE DATE,
  MODIFIED_BY VARCHAR2(100)
);
```

**Screening Records Table:**
```sql
CREATE TABLE SCREENING_RECORDS (
  ID NUMBER PRIMARY KEY,
  CUSTOMER_ID VARCHAR2(100),
  SCREENING_DATE DATE,
  STATUS VARCHAR2(50),
  HIT_TYPE VARCHAR2(50),
  INVESTIGATOR VARCHAR2(100),
  RESOLUTION_DATE DATE
);
```

*Note: Adjust table/column names in the service files if your schema differs.*

## Development

```bash
# Start in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Detections (AML Monitoring)
```
GET /api/data/detections?startDate=2024-01-01&endDate=2024-03-31
GET /api/data/detections/scenario/:scenario?startDate&endDate
GET /api/data/detections/kpis?startDate&endDate
GET /api/data/detections/trends?startDate&endDate
```

### Screening
```
GET /api/data/screening?startDate&endDate
GET /api/data/screening/onboarding?startDate&endDate
GET /api/data/screening/kpis?startDate&endDate
```

### GoAML Reports
```
GET /api/data/goaml-reports?startDate&endDate
GET /api/data/goaml-reports/status/:status?startDate&endDate
GET /api/data/goaml-reports/kpis?startDate&endDate
```

### Configuration
```
GET    /api/config/googlesheets
PUT    /api/config/googlesheets/screening
PUT    /api/config/googlesheets/goaml
POST   /api/config/googlesheets/test
GET    /api/config/datasources/health
```

### Cache Management
```
GET    /api/cache/status
GET    /api/cache/stats
POST   /api/cache/refresh
DELETE /api/cache/invalidate
POST   /api/cache/trigger-update
```

## Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t aml-backend ./backend

# Run container
docker run -d \
  --name aml-backend \
  -p 3000:3000 \
  --env-file ./backend/.env \
  aml-backend
```

## Cache Strategy

### What Gets Cached

- **Detections** (AML Monitoring): Last 3 months (~10-50K records)
- **Screening Records**: Last 3 months from Oracle + Google Sheets (~5-20K records)
- **GoAML Reports**: Last 3 months from Google Sheets (~1-5K reports)
- **Aggregated KPIs**: Pre-computed metrics (24-hour TTL)

### Cache Warming

On startup and daily at 2 AM:
1. Calculate 3-month date range
2. Load data from all sources
3. Store in Redis with 90-day TTL
4. Pre-compute and cache KPIs

### Daily Incremental Updates

Automatic process that runs daily:
1. Fetch yesterday's data
2. Add to cache
3. Remove data older than 90 days
4. Recompute aggregates

## Monitoring

### Health Checks

```bash
# Server health
curl http://localhost:3000/health

# Data sources health
curl http://localhost:3000/api/config/datasources/health

# Cache health
curl http://localhost:3000/api/cache/status
```

### Cache Statistics

```bash
curl http://localhost:3000/api/cache/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "totalKeys": 45,
    "memoryUsage": "12.5MB",
    "hitRate": 95.2,
    "lastUpdate": "2024-10-10T14:30:00Z"
  }
}
```

## Troubleshooting

### Oracle Connection Issues

**Error: ORA-12545: Connect failed**
- Check network connectivity to Oracle server
- Verify `ORACLE_*_CONNECT_STRING` in `.env`
- Ensure Oracle port (default 1521) is open

**Error: ORA-01017: invalid username/password**
- Verify credentials in `.env`
- Check if account is locked: `SELECT account_status FROM dba_users WHERE username = 'YOUR_USER';`

### Google Sheets Connection Issues

**Error: "Failed to load Google Sheets configuration"**
- Ensure `googlesheets.json` exists in `src/config/`
- Verify JSON structure is valid

**Error: "The caller does not have permission"**
- Share your Google Sheet with the service account email
- Grant at least "Viewer" permissions

### Redis Connection Issues

**Error: "Redis connection refused"**
- Ensure Redis server is running: `redis-cli ping`
- Check `REDIS_HOST` and `REDIS_PORT` in `.env`

### Cache Not Warming

**Symptoms: Dashboard shows no data**
- Check backend logs for cache warming errors
- Verify database connections are healthy
- Manually trigger cache refresh: `POST /api/cache/refresh`

## Performance Tuning

### Oracle Connection Pool

Edit `src/connectors/OracleConnector.ts`:
```typescript
this.pool = await oracledb.createPool({
  user: this.config.user,
  password: this.config.password,
  connectString: this.config.connectString,
  poolMin: 2,        // Increase for high load
  poolMax: 10,       // Increase for high load
  poolIncrement: 1,
  poolTimeout: 60,
});
```

### Redis Memory

Monitor memory usage:
```bash
redis-cli info memory
```

If running low on memory:
- Reduce `CACHE_MONTHS` in `.env`
- Increase Redis `maxmemory` limit
- Enable Redis persistence: `appendonly yes`

## Development Notes

### Adding New Data Sources

1. Create connector class implementing `IDataConnector`
2. Add to `ConnectorFactory`
3. Create service in `src/services/`
4. Add endpoints in appropriate controller
5. Update cache warming service

### Modifying SQL Queries

Edit service files in `src/services/`:
- `TransactionMonitoringService.ts` - AML detections
- `ScreeningService.ts` - Screening records
- `GoAMLService.ts` - GoAML reports

### Changing Cache TTL

Edit `src/config/datasources.config.ts`:
```typescript
cache: {
  months: 3,                          // Number of months to cache
  defaultTTL: 90 * 24 * 60 * 60,     // 90 days for raw data
  aggregateTTL: 24 * 60 * 60,        // 24 hours for aggregates
}
```

## Security Considerations

- **Never commit `.env` file** - Use `.env.example` as template
- **Rotate database passwords** regularly
- **Limit service account permissions** - Grant only necessary Google Sheets access
- **Use environment variables** for all sensitive configuration
- **Enable Redis password** in production: `REDIS_PASSWORD=your_secure_password`
- **Configure CORS properly** - Update allowed origins in `src/server.ts`

## License

MIT License - See main repository LICENSE file

