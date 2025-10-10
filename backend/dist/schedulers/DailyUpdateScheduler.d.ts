/**
 * Daily Update Scheduler
 * Runs daily incremental cache updates at configured hour
 */
export declare class DailyUpdateScheduler {
    private cacheWarming;
    private cacheManager;
    private cronJob;
    constructor();
    /**
     * Start the daily update scheduler
     */
    start(): void;
    /**
     * Stop the scheduler
     */
    stop(): void;
    /**
     * Run daily incremental update
     */
    runDailyUpdate(): Promise<void>;
    /**
     * Remove cache data older than cutoff date
     */
    private removeOldCacheData;
    /**
     * Manually trigger daily update (for testing)
     */
    triggerManualUpdate(): Promise<void>;
}
//# sourceMappingURL=DailyUpdateScheduler.d.ts.map