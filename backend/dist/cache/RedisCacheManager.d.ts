import { CacheStats } from '../types';
/**
 * Redis Cache Manager
 * Handles caching of detection, screening, and GoAML data
 */
export declare class RedisCacheManager {
    private client;
    private static instance;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): RedisCacheManager;
    /**
     * Get data from cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set data in cache with TTL
     */
    set<T>(key: string, data: T, ttlSeconds: number): Promise<void>;
    /**
     * Invalidate a specific cache key
     */
    invalidate(key: string): Promise<void>;
    /**
     * Invalidate all keys matching a pattern
     */
    invalidatePattern(pattern: string): Promise<void>;
    /**
     * Get cache statistics
     */
    getCacheStats(): Promise<CacheStats>;
    /**
     * Check if Redis is healthy
     */
    isHealthy(): Promise<boolean>;
    /**
     * Generate cache key for detections
     */
    static getDetectionsCacheKey(startDate: string, endDate: string, filter?: string): string;
    /**
     * Generate cache key for screening data
     */
    static getScreeningCacheKey(startDate: string, endDate: string, source?: string): string;
    /**
     * Generate cache key for GoAML reports
     */
    static getGoAMLCacheKey(startDate: string, endDate: string, filter?: string): string;
    /**
     * Generate cache key for aggregates/KPIs
     */
    static getAggregatesCacheKey(type: string, startDate: string, endDate: string): string;
    /**
     * Close Redis connection
     */
    disconnect(): Promise<void>;
    /**
     * Flush all cache (use with caution!)
     */
    flushAll(): Promise<void>;
}
//# sourceMappingURL=RedisCacheManager.d.ts.map