/**
 * Cache Warming Service
 * Loads 3 months of data from all sources into Redis cache
 */
export declare class CacheWarmingService {
    private cacheManager;
    constructor();
    /**
     * Calculate 3-month date range
     */
    private getDateRange;
    /**
     * Warm cache with all data sources
     */
    warmCache(): Promise<void>;
    /**
     * Warm detections cache from Oracle AML
     */
    private warmDetectionsCache;
    /**
     * Warm screening cache from Oracle Screening and Google Sheets
     */
    private warmScreeningCache;
    /**
     * Warm GoAML reports cache from Google Sheets
     */
    private warmGoAMLCache;
    /**
     * Pre-compute and cache detection KPIs
     */
    private cacheDetectionKPIs;
    /**
     * Pre-compute and cache GoAML KPIs
     */
    private cacheGoAMLKPIs;
}
//# sourceMappingURL=CacheWarmingService.d.ts.map