"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyUpdateScheduler = void 0;
const cron = __importStar(require("node-cron"));
const CacheWarmingService_1 = require("../cache/CacheWarmingService");
const RedisCacheManager_1 = require("../cache/RedisCacheManager");
const datasources_config_1 = require("../config/datasources.config");
/**
 * Daily Update Scheduler
 * Runs daily incremental cache updates at configured hour
 */
class DailyUpdateScheduler {
    constructor() {
        this.cronJob = null;
        this.cacheWarming = new CacheWarmingService_1.CacheWarmingService();
        this.cacheManager = RedisCacheManager_1.RedisCacheManager.getInstance();
    }
    /**
     * Start the daily update scheduler
     */
    start() {
        // Run daily at configured hour (default 2 AM)
        const cronExpression = `0 ${datasources_config_1.config.cache.dailyUpdateHour} * * *`;
        this.cronJob = cron.schedule(cronExpression, async () => {
            console.log('[DailyScheduler] Starting daily cache update...');
            await this.runDailyUpdate();
        });
        console.log(`[DailyScheduler] Scheduled daily updates at ${datasources_config_1.config.cache.dailyUpdateHour}:00`);
    }
    /**
     * Stop the scheduler
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            console.log('[DailyScheduler] Stopped daily update scheduler');
        }
    }
    /**
     * Run daily incremental update
     */
    async runDailyUpdate() {
        const startTime = Date.now();
        try {
            console.log('[DailyScheduler] Starting daily update...');
            // 1. Calculate yesterday's date
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            // 2. Calculate cutoff date (data older than 90 days)
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - (datasources_config_1.config.cache.months * 30));
            const cutoffStr = cutoffDate.toISOString().split('T')[0];
            console.log(`[DailyScheduler] Fetching data for: ${yesterdayStr}`);
            console.log(`[DailyScheduler] Removing data older than: ${cutoffStr}`);
            // 3. Invalidate old cache entries
            await this.removeOldCacheData(cutoffStr);
            // 4. Re-warm cache with updated 3-month range
            await this.cacheWarming.warmCache();
            // 5. Log completion
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`[DailyScheduler] Daily update completed in ${duration}s`);
            // 6. Log cache stats
            const stats = await this.cacheManager.getCacheStats();
            console.log('[DailyScheduler] Cache stats:', stats);
        }
        catch (error) {
            console.error('[DailyScheduler] Error during daily update:', error);
        }
    }
    /**
     * Remove cache data older than cutoff date
     */
    async removeOldCacheData(cutoffDate) {
        try {
            // Get all cache keys
            const patterns = [
                'detections:*',
                'screening:*',
                'goaml:*',
                'aggregates:*',
            ];
            for (const pattern of patterns) {
                // This is a simple approach - invalidate all and re-cache
                // A more sophisticated approach would parse keys and selectively delete
                await this.cacheManager.invalidatePattern(pattern);
            }
            console.log(`[DailyScheduler] Invalidated old cache entries before ${cutoffDate}`);
        }
        catch (error) {
            console.error('[DailyScheduler] Error removing old cache data:', error);
        }
    }
    /**
     * Manually trigger daily update (for testing)
     */
    async triggerManualUpdate() {
        console.log('[DailyScheduler] Manual update triggered');
        await this.runDailyUpdate();
    }
}
exports.DailyUpdateScheduler = DailyUpdateScheduler;
//# sourceMappingURL=DailyUpdateScheduler.js.map