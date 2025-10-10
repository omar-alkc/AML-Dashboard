# Quick Start Guide

## Current Status

✅ **Backend Code Complete** - All files created successfully  
✅ **Redis Running** - Docker container operational  
✅ **TypeScript Compiles** - No build errors  
⚠️ **Server Not Starting** - Requires database configuration  

## Why Backend Won't Start Yet

The backend tries to connect to these on startup:
1. Oracle AML database (placeholder credentials in `.env`)
2. Oracle Screening database (placeholder credentials in `.env`)
3. Google Sheets API (placeholder credentials in `googlesheets.json`)

**All three will fail** because they're not configured yet.

## Options to Test Backend

### Option 1: Skip Data Source Connections (Quick Test)

Temporarily comment out connection initialization in `backend/src/server.ts`:

```typescript
// Comment out line ~98:
// await ConnectorFactory.initializeAll();
console.log('[Server] Skipping connector initialization for testing');

// Comment out line ~108:
// await this.warmupCache();
console.log('[Server] Skipping cache warmup for testing');
```

This will let the server start without database connections.

### Option 2: Configure Real Data Sources (Full Setup)

1. **Update `backend/.env`** with real Oracle credentials
2. **Update `backend/src/config/googlesheets.json`** with your Google service account
3. **Share Google Sheets** with the service account email

See `BACKEND_SETUP_GUIDE.md` for detailed instructions.

### Option 3: Use Mock Mode Only (No Backend Needed)

In `src/environments/environment.ts`:
```typescript
useBackendData: false  // Dashboard will use mock data
```

## Next Steps

### For Testing Without Databases:

1. Open `backend/src/server.ts`
2. Comment out lines ~98 and ~108 as shown above
3. Run: `cd backend && npm run dev`
4. Test: `curl http://localhost:3000/health`

### For Full Production Setup:

See `BACKEND_SETUP_GUIDE.md` sections:
- "Oracle Database Setup"
- "Google Sheets Setup"
- "Configuration Details"

## What Was Built

✅ Complete backend infrastructure (30+ files)  
✅ 3 data connectors (Oracle x2, Google Sheets)  
✅ Redis caching layer  
✅ 15+ REST API endpoints  
✅ Daily update scheduler  
✅ Docker deployment configuration  
✅ Comprehensive documentation  

## Files Created

**Backend:**
- Configuration system
- Data connectors (Oracle, Google Sheets)
- Business services (Transaction Monitoring, Screening, GoAML)
- REST API controllers
- Redis cache manager
- Daily scheduler
- Main server
- Docker setup

**Documentation:**
- backend/README.md
- BACKEND_SETUP_GUIDE.md
- IMPLEMENTATION_SUMMARY.md
- docker-compose.yml
- nginx.conf

**Frontend:**
- Environment configuration updated
- HttpDetectionService created (example)

## Quick Commands

```bash
# Start Redis
docker start aml-redis

# Build backend
cd backend
npm run build

# Start backend (will fail without DB config)
npm run dev

# Test health endpoint
curl http://localhost:3000/health
```

## Support

- Full backend docs: `backend/README.md`
- Setup instructions: `BACKEND_SETUP_GUIDE.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`

