"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoAMLService = void 0;
const ConnectorFactory_1 = require("../connectors/ConnectorFactory");
const RedisCacheManager_1 = require("../cache/RedisCacheManager");
const datasources_config_1 = require("../config/datasources.config");
/**
 * GoAML Service
 * Handles GoAML report data from Google Sheets
 */
class GoAMLService {
    constructor() {
        this.cacheManager = RedisCacheManager_1.RedisCacheManager.getInstance();
    }
    /**
     * Get all GoAML reports for a date range
     */
    async getReports(dateRange) {
        const cacheKey = RedisCacheManager_1.RedisCacheManager.getGoAMLCacheKey(dateRange.startDate, dateRange.endDate);
        // Check cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            console.log('[GoAML] Returning reports from cache');
            return cached;
        }
        // Cache miss - query Google Sheets
        console.log('[GoAML] Cache miss - querying Google Sheets');
        const connector = ConnectorFactory_1.ConnectorFactory.createGoogleSheetsConnector();
        const allReports = await connector.readSheet('goaml');
        // Filter by date range
        const filteredReports = allReports.filter((row) => {
            const date = row.report_date || row.date || '';
            return date >= dateRange.startDate && date <= dateRange.endDate;
        });
        // Cache the results
        await this.cacheManager.set(cacheKey, filteredReports, datasources_config_1.config.cache.defaultTTL);
        return filteredReports;
    }
    /**
     * Get reports by status
     */
    async getReportsByStatus(status, dateRange) {
        const reports = await this.getReports(dateRange);
        return reports.filter((r) => r.status === status);
    }
    /**
     * Get reports by reporter
     */
    async getReportsByReporter(reporter, dateRange) {
        const reports = await this.getReports(dateRange);
        return reports.filter((r) => r.reporter === reporter);
    }
    /**
     * Get GoAML reporting KPIs
     */
    async getReportingKPIs(dateRange) {
        const cacheKey = RedisCacheManager_1.RedisCacheManager.getAggregatesCacheKey('goaml', dateRange.startDate, dateRange.endDate);
        // Check cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            console.log('[GoAML] Returning KPIs from cache');
            return cached;
        }
        // Calculate KPIs from reports
        console.log('[GoAML] Computing KPIs from reports');
        const reports = await this.getReports(dateRange);
        const kpis = {
            totalReports: reports.length,
            submittedReports: reports.filter((r) => r.status === 'Submitted').length,
            pendingReports: reports.filter((r) => r.status === 'Pending').length,
            draftReports: reports.filter((r) => r.status === 'Draft').length,
        };
        // Cache KPIs with shorter TTL
        await this.cacheManager.set(cacheKey, kpis, datasources_config_1.config.cache.aggregateTTL);
        return kpis;
    }
    /**
     * Get reporting trends
     */
    async getReportingTrends(dateRange) {
        const reports = await this.getReports(dateRange);
        // Group by date
        const trendMap = {};
        reports.forEach((r) => {
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
    async getReporterStats(dateRange) {
        const reports = await this.getReports(dateRange);
        // Group by reporter
        const reporterMap = {};
        reports.forEach((r) => {
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
    async getStatusDistribution(dateRange) {
        const reports = await this.getReports(dateRange);
        // Group by status
        const statusMap = {};
        reports.forEach((r) => {
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
exports.GoAMLService = GoAMLService;
//# sourceMappingURL=GoAMLService.js.map