"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheManager = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const datasources_config_1 = require("../config/datasources.config");
/**
 * Redis Cache Manager
 * Handles caching of detection, screening, and GoAML data
 */
class RedisCacheManager {
    constructor() {
        this.client = new ioredis_1.default({
            host: datasources_config_1.config.redis.host,
            port: datasources_config_1.config.redis.port,
            password: datasources_config_1.config.redis.password,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
        this.client.on('connect', () => {
            console.log('[Redis] Connected to Redis server');
        });
        this.client.on('error', (err) => {
            console.error('[Redis] Error:', err);
        });
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisCacheManager();
        }
        return this.instance;
    }
    /**
     * Get data from cache
     */
    async get(key) {
        try {
            const data = await this.client.get(key);
            if (!data) {
                return null;
            }
            return JSON.parse(data);
        }
        catch (error) {
            console.error(`[Redis] Error getting key ${key}:`, error);
            return null;
        }
    }
    /**
     * Set data in cache with TTL
     */
    async set(key, data, ttlSeconds) {
        try {
            const serialized = JSON.stringify(data);
            await this.client.setex(key, ttlSeconds, serialized);
        }
        catch (error) {
            console.error(`[Redis] Error setting key ${key}:`, error);
            throw error;
        }
    }
    /**
     * Invalidate a specific cache key
     */
    async invalidate(key) {
        try {
            await this.client.del(key);
            console.log(`[Redis] Invalidated cache key: ${key}`);
        }
        catch (error) {
            console.error(`[Redis] Error invalidating key ${key}:`, error);
            throw error;
        }
    }
    /**
     * Invalidate all keys matching a pattern
     */
    async invalidatePattern(pattern) {
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(...keys);
                console.log(`[Redis] Invalidated ${keys.length} keys matching pattern: ${pattern}`);
            }
        }
        catch (error) {
            console.error(`[Redis] Error invalidating pattern ${pattern}:`, error);
            throw error;
        }
    }
    /**
     * Get cache statistics
     */
    async getCacheStats() {
        try {
            const info = await this.client.info('stats');
            const keyspace = await this.client.info('keyspace');
            const memory = await this.client.info('memory');
            // Parse total keys
            const dbMatch = keyspace.match(/keys=(\d+)/);
            const totalKeys = dbMatch ? parseInt(dbMatch[1], 10) : 0;
            // Parse memory usage
            const memMatch = memory.match(/used_memory_human:(.+)/);
            const memoryUsage = memMatch ? memMatch[1].trim() : 'unknown';
            // Parse hit rate
            const hitsMatch = info.match(/keyspace_hits:(\d+)/);
            const missesMatch = info.match(/keyspace_misses:(\d+)/);
            let hitRate;
            if (hitsMatch && missesMatch) {
                const hits = parseInt(hitsMatch[1], 10);
                const misses = parseInt(missesMatch[1], 10);
                const total = hits + misses;
                hitRate = total > 0 ? (hits / total) * 100 : 0;
            }
            return {
                totalKeys,
                memoryUsage,
                hitRate,
                lastUpdate: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error('[Redis] Error getting cache stats:', error);
            throw error;
        }
    }
    /**
     * Check if Redis is healthy
     */
    async isHealthy() {
        try {
            const result = await this.client.ping();
            return result === 'PONG';
        }
        catch (error) {
            console.error('[Redis] Health check failed:', error);
            return false;
        }
    }
    /**
     * Generate cache key for detections
     */
    static getDetectionsCacheKey(startDate, endDate, filter) {
        if (filter) {
            return `detections:${filter}:${startDate}:${endDate}`;
        }
        return `detections:all:${startDate}:${endDate}`;
    }
    /**
     * Generate cache key for screening data
     */
    static getScreeningCacheKey(startDate, endDate, source) {
        if (source) {
            return `screening:${source}:${startDate}:${endDate}`;
        }
        return `screening:all:${startDate}:${endDate}`;
    }
    /**
     * Generate cache key for GoAML reports
     */
    static getGoAMLCacheKey(startDate, endDate, filter) {
        if (filter) {
            return `goaml:${filter}:${startDate}:${endDate}`;
        }
        return `goaml:all:${startDate}:${endDate}`;
    }
    /**
     * Generate cache key for aggregates/KPIs
     */
    static getAggregatesCacheKey(type, startDate, endDate) {
        return `aggregates:${type}:${startDate}:${endDate}`;
    }
    /**
     * Close Redis connection
     */
    async disconnect() {
        await this.client.quit();
        console.log('[Redis] Disconnected from Redis server');
    }
    /**
     * Flush all cache (use with caution!)
     */
    async flushAll() {
        await this.client.flushall();
        console.log('[Redis] Flushed all cache data');
    }
}
exports.RedisCacheManager = RedisCacheManager;
RedisCacheManager.instance = null;
//# sourceMappingURL=RedisCacheManager.js.map