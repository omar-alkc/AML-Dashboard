import * as cron from 'node-cron';
import { CacheWarmingService } from '../cache/CacheWarmingService';
import { RedisCacheManager } from '../cache/RedisCacheManager';
import { config } from '../config/datasources.config';

/**
 * Daily Update Scheduler
 * Runs daily incremental cache updates at configured hour
 */
export class DailyUpdateScheduler {
  private cacheWarming: CacheWarmingService;
  private cacheManager: RedisCacheManager;
  private cronJob: cron.ScheduledTask | null = null;

  constructor() {
    this.cacheWarming = new CacheWarmingService();
    this.cacheManager = RedisCacheManager.getInstance();
  }

  /**
   * Start the daily update scheduler
   */
  start(): void {
    // Run daily at configured hour (default 2 AM)
    const cronExpression = `0 ${config.cache.dailyUpdateHour} * * *`;

    this.cronJob = cron.schedule(cronExpression, async () => {
      console.log('[DailyScheduler] Starting daily cache update...');
      await this.runDailyUpdate();
    });

    console.log(`[DailyScheduler] Scheduled daily updates at ${config.cache.dailyUpdateHour}:00`);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('[DailyScheduler] Stopped daily update scheduler');
    }
  }

  /**
   * Run daily incremental update
   */
  async runDailyUpdate(): Promise<void> {
    const startTime = Date.now();

    try {
      console.log('[DailyScheduler] Starting daily update...');

      // 1. Calculate yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // 2. Calculate cutoff date (data older than 90 days)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (config.cache.months * 30));
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

    } catch (error) {
      console.error('[DailyScheduler] Error during daily update:', error);
    }
  }

  /**
   * Remove cache data older than cutoff date
   */
  private async removeOldCacheData(cutoffDate: string): Promise<void> {
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
    } catch (error) {
      console.error('[DailyScheduler] Error removing old cache data:', error);
    }
  }

  /**
   * Manually trigger daily update (for testing)
   */
  async triggerManualUpdate(): Promise<void> {
    console.log('[DailyScheduler] Manual update triggered');
    await this.runDailyUpdate();
  }
}

