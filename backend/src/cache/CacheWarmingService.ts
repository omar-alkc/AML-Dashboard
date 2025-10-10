import { RedisCacheManager } from './RedisCacheManager';
import { ConnectorFactory } from '../connectors/ConnectorFactory';
import { config } from '../config/datasources.config';
import { Detection, ScreeningRecord, GoAMLReport } from '../types';

/**
 * Cache Warming Service
 * Loads 3 months of data from all sources into Redis cache
 */
export class CacheWarmingService {
  private cacheManager: RedisCacheManager;

  constructor() {
    this.cacheManager = RedisCacheManager.getInstance();
  }

  /**
   * Calculate 3-month date range
   */
  private getDateRange(): { startDate: string; endDate: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - config.cache.months);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  /**
   * Warm cache with all data sources
   */
  async warmCache(): Promise<void> {
    console.log('[CacheWarming] Starting cache warming process...');
    const startTime = Date.now();

    try {
      const { startDate, endDate } = this.getDateRange();
      console.log(`[CacheWarming] Date range: ${startDate} to ${endDate}`);

      // Warm detections cache
      await this.warmDetectionsCache(startDate, endDate);

      // Warm screening cache
      await this.warmScreeningCache(startDate, endDate);

      // Warm GoAML reports cache
      await this.warmGoAMLCache(startDate, endDate);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[CacheWarming] Cache warming completed in ${duration}s`);
    } catch (error) {
      console.error('[CacheWarming] Error during cache warming:', error);
      throw error;
    }
  }

  /**
   * Warm detections cache from Oracle AML
   */
  private async warmDetectionsCache(startDate: string, endDate: string): Promise<void> {
    console.log('[CacheWarming] Loading detections from Oracle AML...');

    try {
      const connector = ConnectorFactory.createOracleAMLConnector();

      // Query detections for date range
      // Note: Adjust table/column names based on actual Eastnets schema
      const sql = `
        SELECT 
          ID,
          SCENARIO_NAME,
          STATUS,
          DETECTION_DATE,
          STATUS_CHANGE_DATE,
          MODIFIED_BY
        FROM DETECTIONS
        WHERE DETECTION_DATE >= ${connector.formatDate(startDate)}
          AND DETECTION_DATE <= ${connector.formatDate(endDate)}
        ORDER BY DETECTION_DATE DESC
      `;

      const detections = await connector.query(sql);

      // Cache all detections
      const cacheKey = RedisCacheManager.getDetectionsCacheKey(startDate, endDate);
      await this.cacheManager.set(cacheKey, detections, config.cache.defaultTTL);

      console.log(`[CacheWarming] Cached ${detections.length} detections`);

      // Pre-compute and cache KPIs
      await this.cacheDetectionKPIs(detections, startDate, endDate);
    } catch (error) {
      console.error('[CacheWarming] Error warming detections cache:', error);
      // Continue with other caches even if this fails
    }
  }

  /**
   * Warm screening cache from Oracle Screening and Google Sheets
   */
  private async warmScreeningCache(startDate: string, endDate: string): Promise<void> {
    console.log('[CacheWarming] Loading screening data...');

    try {
      // Load from Oracle Screening
      const oracleConnector = ConnectorFactory.createOracleScreeningConnector();

      const sql = `
        SELECT 
          ID,
          CUSTOMER_ID,
          SCREENING_DATE,
          STATUS,
          HIT_TYPE,
          INVESTIGATOR,
          RESOLUTION_DATE
        FROM SCREENING_RECORDS
        WHERE SCREENING_DATE >= ${oracleConnector.formatDate(startDate)}
          AND SCREENING_DATE <= ${oracleConnector.formatDate(endDate)}
        ORDER BY SCREENING_DATE DESC
      `;

      const oracleData = await oracleConnector.query(sql);

      // Cache Oracle screening data
      const oracleCacheKey = RedisCacheManager.getScreeningCacheKey(startDate, endDate, 'oracle');
      await this.cacheManager.set(oracleCacheKey, oracleData, config.cache.defaultTTL);

      console.log(`[CacheWarming] Cached ${oracleData.length} screening records from Oracle`);

      // Load from Google Sheets
      const sheetsConnector = ConnectorFactory.createGoogleSheetsConnector();
      const sheetsData = await sheetsConnector.readSheet('screening');

      // Filter by date range
      const filteredSheetsData = sheetsData.filter((row: any) => {
        const date = row.screening_date || row.date;
        return date >= startDate && date <= endDate;
      });

      // Cache Google Sheets screening data
      const sheetsCacheKey = RedisCacheManager.getScreeningCacheKey(startDate, endDate, 'sheet');
      await this.cacheManager.set(sheetsCacheKey, filteredSheetsData, config.cache.defaultTTL);

      console.log(`[CacheWarming] Cached ${filteredSheetsData.length} screening records from Google Sheets`);

      // Cache combined data
      const combinedData = [...oracleData, ...filteredSheetsData];
      const allCacheKey = RedisCacheManager.getScreeningCacheKey(startDate, endDate);
      await this.cacheManager.set(allCacheKey, combinedData, config.cache.defaultTTL);

    } catch (error) {
      console.error('[CacheWarming] Error warming screening cache:', error);
    }
  }

  /**
   * Warm GoAML reports cache from Google Sheets
   */
  private async warmGoAMLCache(startDate: string, endDate: string): Promise<void> {
    console.log('[CacheWarming] Loading GoAML reports from Google Sheets...');

    try {
      const connector = ConnectorFactory.createGoogleSheetsConnector();
      const reports = await connector.readSheet('goaml');

      // Filter by date range
      const filteredReports = reports.filter((row: any) => {
        const date = row.report_date || row.date;
        return date >= startDate && date <= endDate;
      });

      // Cache reports
      const cacheKey = RedisCacheManager.getGoAMLCacheKey(startDate, endDate);
      await this.cacheManager.set(cacheKey, filteredReports, config.cache.defaultTTL);

      console.log(`[CacheWarming] Cached ${filteredReports.length} GoAML reports`);

      // Pre-compute and cache KPIs
      await this.cacheGoAMLKPIs(filteredReports, startDate, endDate);
    } catch (error) {
      console.error('[CacheWarming] Error warming GoAML cache:', error);
    }
  }

  /**
   * Pre-compute and cache detection KPIs
   */
  private async cacheDetectionKPIs(detections: any[], startDate: string, endDate: string): Promise<void> {
    const kpis = {
      alertCount: detections.length,
      pendingCount: detections.filter(d => d.STATUS === 'New').length,
      delayedCount: detections.filter(d => d.STATUS === 'Delayed').length,
      suspiciousInitialCount: detections.filter(d => d.STATUS === 'Suspicious Initial').length,
      falsePositiveInitialCount: detections.filter(d => d.STATUS === 'False Positive Initial').length,
      waitingForEvidenceCount: detections.filter(d => d.STATUS === 'Waiting for Evidence').length,
      sentSARCount: detections.filter(d => d.STATUS === 'Sent SAR').length,
      suspiciousFinalCount: detections.filter(d => d.STATUS === 'Suspicious Final').length,
      falsePositiveFinalCount: detections.filter(d => d.STATUS === 'False Positive Final').length,
      processedAlertsCount: detections.filter(d => 
        ['Sent SAR', 'Suspicious Final', 'False Positive Final'].includes(d.STATUS)
      ).length,
      pendingSARCount: detections.filter(d => 
        (d.SCENARIO_NAME === 'CO' || d.SCENARIO_NAME === 'SAR') && 
        ['New', 'Delayed', 'Waiting for Evidence', 'Suspicious Initial'].includes(d.STATUS)
      ).length,
    };

    const cacheKey = RedisCacheManager.getAggregatesCacheKey('detections', startDate, endDate);
    await this.cacheManager.set(cacheKey, kpis, config.cache.aggregateTTL);

    console.log('[CacheWarming] Cached detection KPIs');
  }

  /**
   * Pre-compute and cache GoAML KPIs
   */
  private async cacheGoAMLKPIs(reports: any[], startDate: string, endDate: string): Promise<void> {
    const kpis = {
      totalReports: reports.length,
      submittedReports: reports.filter(r => r.status === 'Submitted').length,
      pendingReports: reports.filter(r => r.status === 'Pending').length,
      draftReports: reports.filter(r => r.status === 'Draft').length,
    };

    const cacheKey = RedisCacheManager.getAggregatesCacheKey('goaml', startDate, endDate);
    await this.cacheManager.set(cacheKey, kpis, config.cache.aggregateTTL);

    console.log('[CacheWarming] Cached GoAML KPIs');
  }
}

