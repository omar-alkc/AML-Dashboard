import { ConnectorFactory } from '../connectors/ConnectorFactory';
import { RedisCacheManager } from '../cache/RedisCacheManager';
import { GoAMLReport, GoAMLKPIs, DateRange } from '../types';
import { config } from '../config/datasources.config';

/**
 * GoAML Service
 * Handles GoAML report data from Google Sheets
 */
export class GoAMLService {
  private cacheManager: RedisCacheManager;

  constructor() {
    this.cacheManager = RedisCacheManager.getInstance();
  }

  /**
   * Get all GoAML reports for a date range
   */
  async getReports(dateRange: DateRange): Promise<GoAMLReport[]> {
    const cacheKey = RedisCacheManager.getGoAMLCacheKey(
      dateRange.startDate,
      dateRange.endDate
    );

    // Check cache first
    const cached = await this.cacheManager.get<GoAMLReport[]>(cacheKey);
    if (cached) {
      console.log('[GoAML] Returning reports from cache');
      return cached;
    }

    // Cache miss - query Google Sheets
    console.log('[GoAML] Cache miss - querying Google Sheets');
    const connector = ConnectorFactory.createGoogleSheetsConnector();
    const allReports = await connector.readSheet('goaml');

    // Filter by date range
    const filteredReports = allReports.filter((row: any) => {
      const date = row.report_date || row.date || '';
      return date >= dateRange.startDate && date <= dateRange.endDate;
    });

    // Cache the results
    await this.cacheManager.set(cacheKey, filteredReports, config.cache.defaultTTL);

    return filteredReports;
  }

  /**
   * Get reports by status
   */
  async getReportsByStatus(status: string, dateRange: DateRange): Promise<GoAMLReport[]> {
    const reports = await this.getReports(dateRange);
    return reports.filter((r: any) => r.status === status);
  }

  /**
   * Get reports by reporter
   */
  async getReportsByReporter(reporter: string, dateRange: DateRange): Promise<GoAMLReport[]> {
    const reports = await this.getReports(dateRange);
    return reports.filter((r: any) => r.reporter === reporter);
  }

  /**
   * Get GoAML reporting KPIs
   */
  async getReportingKPIs(dateRange: DateRange): Promise<GoAMLKPIs> {
    const cacheKey = RedisCacheManager.getAggregatesCacheKey(
      'goaml',
      dateRange.startDate,
      dateRange.endDate
    );

    // Check cache first
    const cached = await this.cacheManager.get<GoAMLKPIs>(cacheKey);
    if (cached) {
      console.log('[GoAML] Returning KPIs from cache');
      return cached;
    }

    // Calculate KPIs from reports
    console.log('[GoAML] Computing KPIs from reports');
    const reports = await this.getReports(dateRange);

    const kpis: GoAMLKPIs = {
      totalReports: reports.length,
      submittedReports: reports.filter((r: any) => r.status === 'Submitted').length,
      pendingReports: reports.filter((r: any) => r.status === 'Pending').length,
      draftReports: reports.filter((r: any) => r.status === 'Draft').length,
    };

    // Cache KPIs with shorter TTL
    await this.cacheManager.set(cacheKey, kpis, config.cache.aggregateTTL);

    return kpis;
  }

  /**
   * Get reporting trends
   */
  async getReportingTrends(dateRange: DateRange): Promise<any> {
    const reports = await this.getReports(dateRange);

    // Group by date
    const trendMap: { [date: string]: number } = {};

    reports.forEach((r: any) => {
      const date = (r.report_date || r.date || '').split('T')[0];
      if (date) {
        trendMap[date] = (trendMap[date] || 0) + 1;
      }
    });

    // Convert to array format
    const trends = Object.entries(trendMap).map(([date, count]) => ({
      date,
      count,
    })).sort((a, b) => a.date.localeCompare(b.date));

    return trends;
  }

  /**
   * Get reporter statistics
   */
  async getReporterStats(dateRange: DateRange): Promise<any> {
    const reports = await this.getReports(dateRange);

    // Group by reporter
    const reporterMap: { [reporter: string]: number } = {};

    reports.forEach((r: any) => {
      const reporter = r.reporter || 'Unknown';
      reporterMap[reporter] = (reporterMap[reporter] || 0) + 1;
    });

    // Convert to array format
    const stats = Object.entries(reporterMap).map(([reporter, count]) => ({
      reporter,
      count,
    })).sort((a, b) => b.count - a.count);

    return stats;
  }

  /**
   * Get status distribution
   */
  async getStatusDistribution(dateRange: DateRange): Promise<any> {
    const reports = await this.getReports(dateRange);

    // Group by status
    const statusMap: { [status: string]: number } = {};

    reports.forEach((r: any) => {
      const status = r.status || 'Unknown';
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

