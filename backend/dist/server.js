"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const datasources_config_1 = require("./config/datasources.config");
const ConnectorFactory_1 = require("./connectors/ConnectorFactory");
const CacheWarmingService_1 = require("./cache/CacheWarmingService");
const DailyUpdateScheduler_1 = require("./schedulers/DailyUpdateScheduler");
const DataController_1 = require("./controllers/DataController");
const ConfigController_1 = require("./controllers/ConfigController");
const CacheController_1 = require("./controllers/CacheController");
/**
 * AML Dashboard Backend Server
 * Provides RESTful API for accessing AML data from multiple sources
 */
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.dataController = new DataController_1.DataController();
        this.configController = new ConfigController_1.ConfigController();
        this.dailyScheduler = new DailyUpdateScheduler_1.DailyUpdateScheduler();
        this.cacheController = new CacheController_1.CacheController(this.dailyScheduler);
        this.cacheWarming = new CacheWarmingService_1.CacheWarmingService();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        // Enable CORS
        this.app.use((0, cors_1.default)({
            origin: '*', // Configure appropriately for production
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }));
        // Parse JSON bodies
        this.app.use(express_1.default.json());
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
            next();
        });
    }
    /**
     * Setup API routes
     */
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: datasources_config_1.config.server.env,
            });
        });
        // Data endpoints
        this.app.get('/api/data/detections', this.dataController.getDetections.bind(this.dataController));
        this.app.get('/api/data/detections/scenario/:scenario', this.dataController.getDetectionsByScenario.bind(this.dataController));
        this.app.get('/api/data/detections/kpis', this.dataController.getDetectionKPIs.bind(this.dataController));
        this.app.get('/api/data/detections/trends', this.dataController.getDetectionTrends.bind(this.dataController));
        this.app.get('/api/data/screening', this.dataController.getScreening.bind(this.dataController));
        this.app.get('/api/data/screening/onboarding', this.dataController.getScreeningOnboarding.bind(this.dataController));
        this.app.get('/api/data/screening/kpis', this.dataController.getScreeningKPIs.bind(this.dataController));
        this.app.get('/api/data/goaml-reports', this.dataController.getGoAMLReports.bind(this.dataController));
        this.app.get('/api/data/goaml-reports/status/:status', this.dataController.getGoAMLReportsByStatus.bind(this.dataController));
        this.app.get('/api/data/goaml-reports/kpis', this.dataController.getGoAMLKPIs.bind(this.dataController));
        // Configuration endpoints
        this.app.get('/api/config/googlesheets', this.configController.getGoogleSheetsConfig.bind(this.configController));
        this.app.put('/api/config/googlesheets/screening', this.configController.updateScreeningSheetConfig.bind(this.configController));
        this.app.put('/api/config/googlesheets/goaml', this.configController.updateGoAMLSheetConfig.bind(this.configController));
        this.app.post('/api/config/googlesheets/test', this.configController.testGoogleSheetConnection.bind(this.configController));
        this.app.get('/api/config/datasources/health', this.configController.getDataSourcesHealth.bind(this.configController));
        // Cache endpoints
        this.app.get('/api/cache/status', this.cacheController.getCacheStatus.bind(this.cacheController));
        this.app.get('/api/cache/stats', this.cacheController.getCacheStats.bind(this.cacheController));
        this.app.post('/api/cache/refresh', this.cacheController.refreshCache.bind(this.cacheController));
        this.app.delete('/api/cache/invalidate', this.cacheController.invalidateCache.bind(this.cacheController));
        this.app.post('/api/cache/trigger-update', this.cacheController.triggerDailyUpdate.bind(this.cacheController));
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint not found',
            });
        });
    }
    /**
     * Setup error handling middleware
     */
    setupErrorHandling() {
        this.app.use((err, req, res, next) => {
            console.error('[Server] Unhandled error:', err);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        });
    }
    /**
     * Initialize all data connectors
     */
    async initializeConnectors() {
        console.log('[Server] Initializing data connectors...');
        console.log('[Server] Note: Connection failures are expected if databases are not configured');
        try {
            await ConnectorFactory_1.ConnectorFactory.initializeAll();
            console.log('[Server] All data connectors initialized successfully');
        }
        catch (error) {
            console.error('[Server] Failed to initialize connectors:', error);
            console.log('[Server] ⚠️  Backend will start but data endpoints will not work until databases are configured');
            console.log('[Server] See BACKEND_SETUP_GUIDE.md for configuration instructions');
        }
    }
    /**
     * Warm up cache on startup
     */
    async warmupCache() {
        console.log('[Server] Starting cache warmup...');
        console.log('[Server] Note: This will fail if databases are not configured - this is expected');
        try {
            await this.cacheWarming.warmCache();
            console.log('[Server] ✅ Cache warmup completed successfully');
        }
        catch (error) {
            console.error('[Server] Cache warmup failed:', error);
            console.log('[Server] ⚠️  Server will continue without pre-warmed cache');
            console.log('[Server] Data will be fetched from databases on first request');
        }
    }
    /**
     * Start the server
     */
    async start() {
        try {
            console.log('='.repeat(60));
            console.log('AML Dashboard Backend Server');
            console.log('='.repeat(60));
            console.log(`Environment: ${datasources_config_1.config.server.env}`);
            console.log(`Port: ${datasources_config_1.config.server.port}`);
            console.log('='.repeat(60));
            // Initialize connectors
            await this.initializeConnectors();
            // Warm up cache
            await this.warmupCache();
            // Start daily update scheduler
            this.dailyScheduler.start();
            // Start Express server
            this.app.listen(datasources_config_1.config.server.port, () => {
                console.log(`[Server] Server is running on port ${datasources_config_1.config.server.port}`);
                console.log(`[Server] Health check: http://localhost:${datasources_config_1.config.server.port}/health`);
                console.log('='.repeat(60));
            });
            // Graceful shutdown handler
            process.on('SIGINT', async () => {
                console.log('\n[Server] Shutting down gracefully...');
                this.dailyScheduler.stop();
                await ConnectorFactory_1.ConnectorFactory.disconnectAll();
                console.log('[Server] Goodbye!');
                process.exit(0);
            });
        }
        catch (error) {
            console.error('[Server] Failed to start server:', error);
            process.exit(1);
        }
    }
}
// Start the server
const server = new Server();
server.start().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map