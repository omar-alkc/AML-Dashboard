import { Injectable } from '@angular/core';
import { Observable, of as observableOf, BehaviorSubject } from 'rxjs';

@Injectable()
export class CacheService {
  private readonly CACHE_PREFIX = 'aml_dashboard_cache_';
  private readonly CACHE_EXPIRY_KEY = 'aml_cache_last_refresh';
  private readonly CACHE_DURATION_MS = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
  
  private cacheStatus = new BehaviorSubject<string>('idle');
  public cacheStatus$ = this.cacheStatus.asObservable();
  
  private lastRefreshTimestamp = new BehaviorSubject<string>(null);
  public lastRefreshTimestamp$ = this.lastRefreshTimestamp.asObservable();

  constructor() {
    // Initialize the last refresh timestamp from storage
    const storedTimestamp = localStorage.getItem(this.CACHE_EXPIRY_KEY);
    if (storedTimestamp) {
      this.lastRefreshTimestamp.next(storedTimestamp);
    }
  }

  /**
   * Checks if a cached result is available for the given key and date range
   */
  public isInCache(key: string, startDate: string, endDate: string): boolean {
    // Check if the date range is within the 3-month window
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    
    if (start < threeMonthsAgo) {
      return false; // Outside the 3-month window
    }
    
    // Check if the data exists in cache
    const cacheKey = this.generateCacheKey(key, startDate, endDate);
    return localStorage.getItem(cacheKey) !== null;
  }

  /**
   * Retrieves data from cache
   */
  public getFromCache<T>(key: string, startDate: string, endDate: string): T {
    const cacheKey = this.generateCacheKey(key, startDate, endDate);
    const cachedData = localStorage.getItem(cacheKey);
    
    return cachedData ? JSON.parse(cachedData) : null;
  }

  /**
   * Stores data in cache
   */
  public setInCache<T>(key: string, startDate: string, endDate: string, data: T): void {
    const cacheKey = this.generateCacheKey(key, startDate, endDate);
    localStorage.setItem(cacheKey, JSON.stringify(data));
  }

  /**
   * Generates a cache key for the given parameters
   */
  private generateCacheKey(key: string, startDate: string, endDate: string): string {
    return `${this.CACHE_PREFIX}${key}_${startDate}_${endDate}`;
  }

  /**
   * Refreshes the cache by clearing all cached data
   */
  public refreshCache(): Observable<boolean> {
    this.cacheStatus.next('refreshing');
    
    // Clear all cache entries
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
    
    // Update last refresh timestamp
    const now = new Date().toISOString();
    localStorage.setItem(this.CACHE_EXPIRY_KEY, now);
    this.lastRefreshTimestamp.next(now);
    
    this.cacheStatus.next('idle');
    return observableOf(true);
  }

  /**
   * Gets the last refresh timestamp
   */
  public getLastRefreshTimestamp(): string {
    return this.lastRefreshTimestamp.getValue();
  }

  /**
   * Checks if the cache needs refreshing (older than 90 days)
   */
  public isCacheExpired(): boolean {
    const timestamp = this.getLastRefreshTimestamp();
    if (!timestamp) {
      return true;
    }
    
    const refreshDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - refreshDate.getTime();
    
    return diffMs > this.CACHE_DURATION_MS;
  }
}
