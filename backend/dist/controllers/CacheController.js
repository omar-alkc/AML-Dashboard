"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheController = void 0;
const RedisCacheManager_1 = require("../cache/RedisCacheManager");
const CacheWarmingService_1 = require("../cache/CacheWarmingService");
/**
 * Cache Controller
 * Handles API endpoints for cache management and monitoring
 */
class CacheController {
    constructor(dailyScheduler) {
        this.cacheManager = RedisCacheManager_1.RedisCacheManager.getInstance();
        this.cacheWarmingService = new CacheWarmingService_1.CacheWarmingService();
        this.dailyScheduler = dailyScheduler;
    }
    /**
     * GET /api/cache/status
     * Get cache status and health
     */
    async getCacheStatus(req, res) {
        try {
            const healthy = await this.cacheManager.isHealthy();
            res.json({
                success: true,
                data: {
                    healthy,
                    status: healthy ? 'operational' : 'down',
                    lastChecked: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('[CacheController] Error getting cache status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to check cache status',
            });
        }
    }
    /**
     * GET /api/cache/stats
     * Get cache statistics
     */
    async getCacheStats(req, res) {
        try {
            const stats = await this.cacheManager.getCacheStats();
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error('[CacheController] Error getting cache stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve cache statistics',
            });
        }
    }
    /**
     * POST /api/cache/refresh
     * Manually trigger cache refresh
     */
    async refreshCache(req, res) {
        try {
            // Start cache refresh in background
            this.cacheWarmingService.warmCache().catch((error) => {
                console.error('[CacheController] Error during cache refresh:', error);
            });
            res.json({
                success: true,
                data: {
                    message: 'Cache refresh initiated',
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('[CacheController] Error initiating cache refresh:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to initiate cache refresh',
            });
        }
    }
    /**
     * DELETE /api/cache/invalidate
     * Invalidate cache entries
     */
    async invalidateCache(req, res) {
        try {
            const { pattern } = req.body;
            if (!pattern) {
                res.status(400).json({
                    success: false,
                    error: 'pattern is required',
                });
                return;
            }
            await this.cacheManager.invalidatePattern(pattern);
            res.json({
                success: true,
                data: {
                    message: `Cache entries matching pattern "${pattern}" invalidated`,
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('[CacheController] Error invalidating cache:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to invalidate cache',
            });
        }
    }
    /**
     * POST /api/cache/trigger-update
     * Manually trigger daily update (for testing)
     */
    async triggerDailyUpdate(req, res) {
        try {
            // Start update in background
            this.dailyScheduler.triggerManualUpdate().catch((error) => {
                console.error('[CacheController] Error during manual update:', error);
            });
            res.json({
                success: true,
                data: {
                    message: 'Daily update triggered manually',
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('[CacheController] Error triggering daily update:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to trigger daily update',
            });
        }
    }
}
exports.CacheController = CacheController;
//# sourceMappingURL=CacheController.js.map