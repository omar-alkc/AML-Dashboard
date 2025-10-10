import { ConnectorFactory } from '../connectors/ConnectorFactory';
import { RedisCacheManager } from '../cache/RedisCacheManager';
import { Detection, DetectionKPIs, DateRange } from '../types';
import { config } from '../config/datasources.config';

/**
 * Transaction Monitoring Service
 * Handles detection/alert data from Eastnets AML system
 */
export class TransactionMonitoringService {
  private cacheManager: RedisCacheManager;

  constructor() {
    this.cacheManager = RedisCacheManager.getInstance();
  }

  /**
   * Get all detections for a date range
   */
  async getDetections(dateRange: DateRange): Promise<Detection[]> {
    const cacheKey = RedisCacheManager.getDetectionsCacheKey(
      dateRange.startDate,
      dateRange.endDate
    );

    // Check cache first
    const cached = await this.cacheManager.get<Detection[]>(cacheKey);
    if (cached) {
      console.log('[TransactionMonitoring] Returning detections from cache');
      return cached;
    }

    // Cache miss - query database
    console.log('[TransactionMonitoring] Cache miss - querying database');
    const connector = ConnectorFactory.createOracleAMLConnector();

    const sql = `
      SELECT 
        ID,
        SCENARIO_NAME,
        STATUS,
        DETECTION_DATE,
        STATUS_CHANGE_DATE,
        MODIFIED_BY
      FROM DETECTIONS
      WHERE DETECTION_DATE >= ${connector.formatDate(dateRange.startDate)}
        AND DETECTION_DATE <= ${connector.formatDate(dateRange.endDate)}
      ORDER BY DETECTION_DATE DESC
    `;

    const detections = await connector.query(sql);

    // Cache the results
    await this.cacheManager.set(cacheKey, detections, config.cache.defaultTTL);

    return detections;
  }

  /**
   * Get detections by scenario
   */
  async getDetectionsByScenario(scenario: string, dateRange: DateRange): Promise<Detection[]> {
    const detections = await this.getDetections(dateRange);
    return detections.filter((d: any) => d.SCENARIO_NAME === scenario);
  }

  /**
   * Get detections by status
   */
  async getDetectionsByStatus(status: string, dateRange: DateRange): Promise<Detection[]> {
    const detections = await this.getDetections(dateRange);
    return detections.filter((d: any) => d.STATUS === status);
  }

  /**
   * Get detection KPIs
   */
  async getKPIs(dateRange: DateRange): Promise<DetectionKPIs> {
    const cacheKey = RedisCacheManager.getAggregatesCacheKey(
      'detections',
      dateRange.startDate,
      dateRange.endDate
    );

    // Check cache first
    const cached = await this.cacheManager.get<DetectionKPIs>(cacheKey);
    if (cached) {
      console.log('[TransactionMonitoring] Returning KPIs from cache');
      return cached;
    }

    // Calculate KPIs from detections
    console.log('[TransactionMonitoring] Computing KPIs from detections');
    const detections = await this.getDetections(dateRange);

    const kpis: DetectionKPIs = {
      alertCount: detections.length,
      pendingCount: detections.filter((d: any) => d.STATUS === 'New').length,
      delayedCount: detections.filter((d: any) => d.STATUS === 'Delayed').length,
      suspiciousInitialCount: detections.filter((d: any) => d.STATUS === 'Suspicious Initial').length,
      falsePositiveInitialCount: detections.filter((d: any) => d.STATUS === 'False Positive Initial').length,
      waitingForEvidenceCount: detections.filter((d: any) => d.STATUS === 'Waiting for Evidence').length,
      sentSARCount: detections.filter((d: any) => d.STATUS === 'Sent SAR').length,
      suspiciousFinalCount: detections.filter((d: any) => d.STATUS === 'Suspicious Final').length,
      falsePositiveFinalCount: detections.filter((d: any) => d.STATUS === 'False Positive Final').length,
      processedAlertsCount: detections.filter((d: any) => 
        ['Sent SAR', 'Suspicious Final', 'False Positive Final'].includes(d.STATUS)
      ).length,
      pendingSARCount: detections.filter((d: any) => 
        (d.SCENARIO_NAME === 'CO' || d.SCENARIO_NAME === 'SAR') && 
        ['New', 'Delayed', 'Waiting for Evidence', 'Suspicious Initial'].includes(d.STATUS)
      ).length,
    };

    // Cache KPIs with shorter TTL
    await this.cacheManager.set(cacheKey, kpis, config.cache.aggregateTTL);

    return kpis;
  }

  /**
   * Get alert trends (time series data)
   */
  async getAlertTrends(dateRange: DateRange): Promise<any> {
    const detections = await this.getDetections(dateRange);

    // Group by date
    const trendMap: { [date: string]: number } = {};

    detections.forEach((d: any) => {
      const date = d.DETECTION_DATE ? d.DETECTION_DATE.split('T')[0] : '';
      trendMap[date] = (trendMap[date] || 0) + 1;
    });

    // Convert to array format
    const trends = Object.entries(trendMap).map(([date, count]) => ({
      date,
      count,
    })).sort((a, b) => a.date.localeCompare(b.date));

    return trends;
  }

  /**
   * Get scenario distribution
   */
  async getScenarioDistribution(dateRange: DateRange): Promise<any> {
    const detections = await this.getDetections(dateRange);

    // Group by scenario
    const scenarioMap: { [scenario: string]: number } = {};

    detections.forEach((d: any) => {
      const scenario = d.SCENARIO_NAME || 'Unknown';
      scenarioMap[scenario] = (scenarioMap[scenario] || 0) + 1;
    });

    // Convert to array format
    const distribution = Object.entries(scenarioMap).map(([scenario, count]) => ({
      scenario,
      count,
    }));

    return distribution;
  }

  /**
   * Get status distribution
   */
  async getStatusDistribution(dateRange: DateRange): Promise<any> {
    const detections = await this.getDetections(dateRange);

    // Group by status
    const statusMap: { [status: string]: number } = {};

    detections.forEach((d: any) => {
      const status = d.STATUS || 'Unknown';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    // Convert to array format
    const distribution = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    return distribution;
  }
}

