import { Request, Response } from 'express';
import { DailyUpdateScheduler } from '../schedulers/DailyUpdateScheduler';
/**
 * Cache Controller
 * Handles API endpoints for cache management and monitoring
 */
export declare class CacheController {
    private cacheManager;
    private cacheWarmingService;
    private dailyScheduler;
    constructor(dailyScheduler: DailyUpdateScheduler);
    /**
     * GET /api/cache/status
     * Get cache status and health
     */
    getCacheStatus(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/cache/stats
     * Get cache statistics
     */
    getCacheStats(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/cache/refresh
     * Manually trigger cache refresh
     */
    refreshCache(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/cache/invalidate
     * Invalidate cache entries
     */
    invalidateCache(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/cache/trigger-update
     * Manually trigger daily update (for testing)
     */
    triggerDailyUpdate(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=CacheController.d.ts.map