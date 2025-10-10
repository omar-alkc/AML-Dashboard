import { Request, Response } from 'express';
import { RedisCacheManager } from '../cache/RedisCacheManager';
import { CacheWarmingService } from '../cache/CacheWarmingService';
import { DailyUpdateScheduler } from '../schedulers/DailyUpdateScheduler';
import { ApiResponse } from '../types';

/**
 * Cache Controller
 * Handles API endpoints for cache management and monitoring
 */
export class CacheController {
  private cacheManager: RedisCacheManager;
  private cacheWarmingService: CacheWarmingService;
  private dailyScheduler: DailyUpdateScheduler;

  constructor(dailyScheduler: DailyUpdateScheduler) {
    this.cacheManager = RedisCacheManager.getInstance();
    this.cacheWarmingService = new CacheWarmingService();
    this.dailyScheduler = dailyScheduler;
  }

  /**
   * GET /api/cache/status
   * Get cache status and health
   */
  async getCacheStatus(req: Request, res: Response): Promise<void> {
    try {
      const healthy = await this.cacheManager.isHealthy();

      res.json({
        success: true,
        data: {
          healthy,
          status: healthy ? 'operational' : 'down',
          lastChecked: new Date().toISOString(),
        },
      } as ApiResponse);
    } catch (error) {
      console.error('[CacheController] Error getting cache status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check cache status',
      } as ApiResponse);
    }
  }

  /**
   * GET /api/cache/stats
   * Get cache statistics
   */
  async getCacheStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.cacheManager.getCacheStats();

      res.json({
        success: true,
        data: stats,
      } as ApiResponse);
    } catch (error) {
      console.error('[CacheController] Error getting cache stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve cache statistics',
      } as ApiResponse);
    }
  }

  /**
   * POST /api/cache/refresh
   * Manually trigger cache refresh
   */
  async refreshCache(req: Request, res: Response): Promise<void> {
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
      } as ApiResponse);
    } catch (error) {
      console.error('[CacheController] Error initiating cache refresh:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initiate cache refresh',
      } as ApiResponse);
    }
  }

  /**
   * DELETE /api/cache/invalidate
   * Invalidate cache entries
   */
  async invalidateCache(req: Request, res: Response): Promise<void> {
    try {
      const { pattern } = req.body;

      if (!pattern) {
        res.status(400).json({
          success: false,
          error: 'pattern is required',
        } as ApiResponse);
        return;
      }

      await this.cacheManager.invalidatePattern(pattern);

      res.json({
        success: true,
        data: {
          message: `Cache entries matching pattern "${pattern}" invalidated`,
          timestamp: new Date().toISOString(),
        },
      } as ApiResponse);
    } catch (error) {
      console.error('[CacheController] Error invalidating cache:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to invalidate cache',
      } as ApiResponse);
    }
  }

  /**
   * POST /api/cache/trigger-update
   * Manually trigger daily update (for testing)
   */
  async triggerDailyUpdate(req: Request, res: Response): Promise<void> {
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
      } as ApiResponse);
    } catch (error) {
      console.error('[CacheController] Error triggering daily update:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger daily update',
      } as ApiResponse);
    }
  }
}

