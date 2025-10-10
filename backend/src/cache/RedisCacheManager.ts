import Redis from 'ioredis';
import { config } from '../config/datasources.config';
import { CacheStats } from '../types';

/**
 * Redis Cache Manager
 * Handles caching of detection, screening, and GoAML data
 */
export class RedisCacheManager {
  private client: Redis;
  private static instance: RedisCacheManager | null = null;

  private constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
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
  static getInstance(): RedisCacheManager {
    if (!this.instance) {
      this.instance = new RedisCacheManager();
    }
    return this.instance;
  }

  /**
   * Get data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      
      if (!data) {
        return null;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`[Redis] Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in cache with TTL
   */
  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      await this.client.setex(key, ttlSeconds, serialized);
    } catch (error) {
      console.error(`[Redis] Error setting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate a specific cache key
   */
  async invalidate(key: string): Promise<void> {
    try {
      await this.client.del(key);
      console.log(`[Redis] Invalidated cache key: ${key}`);
    } catch (error) {
      console.error(`[Redis] Error invalidating key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate all keys matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      
      if (keys.length > 0) {
        await this.client.del(...keys);
        console.log(`[Redis] Invalidated ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error(`[Redis] Error invalidating pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
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
      let hitRate: number | undefined;

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
    } catch (error) {
      console.error('[Redis] Error getting cache stats:', error);
      throw error;
    }
  }

  /**
   * Check if Redis is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('[Redis] Health check failed:', error);
      return false;
    }
  }

  /**
   * Generate cache key for detections
   */
  static getDetectionsCacheKey(startDate: string, endDate: string, filter?: string): string {
    if (filter) {
      return `detections:${filter}:${startDate}:${endDate}`;
    }
    return `detections:all:${startDate}:${endDate}`;
  }

  /**
   * Generate cache key for screening data
   */
  static getScreeningCacheKey(startDate: string, endDate: string, source?: string): string {
    if (source) {
      return `screening:${source}:${startDate}:${endDate}`;
    }
    return `screening:all:${startDate}:${endDate}`;
  }

  /**
   * Generate cache key for GoAML reports
   */
  static getGoAMLCacheKey(startDate: string, endDate: string, filter?: string): string {
    if (filter) {
      return `goaml:${filter}:${startDate}:${endDate}`;
    }
    return `goaml:all:${startDate}:${endDate}`;
  }

  /**
   * Generate cache key for aggregates/KPIs
   */
  static getAggregatesCacheKey(type: string, startDate: string, endDate: string): string {
    return `aggregates:${type}:${startDate}:${endDate}`;
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    await this.client.quit();
    console.log('[Redis] Disconnected from Redis server');
  }

  /**
   * Flush all cache (use with caution!)
   */
  async flushAll(): Promise<void> {
    await this.client.flushall();
    console.log('[Redis] Flushed all cache data');
  }
}

