"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionMonitoringService = void 0;
const ConnectorFactory_1 = require("../connectors/ConnectorFactory");
const RedisCacheManager_1 = require("../cache/RedisCacheManager");
const datasources_config_1 = require("../config/datasources.config");
/**
 * Transaction Monitoring Service
 * Handles detection/alert data from Eastnets AML system
 */
class TransactionMonitoringService {
    constructor() {
        this.cacheManager = RedisCacheManager_1.RedisCacheManager.getInstance();
    }
    /**
     * Get all detections for a date range
     */
    async getDetections(dateRange) {
        const cacheKey = RedisCacheManager_1.RedisCacheManager.getDetectionsCacheKey(dateRange.startDate, dateRange.endDate);
        // Check cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            console.log('[TransactionMonitoring] Returning detections from cache');
            return cached;
        }
        // Cache miss - query database
        console.log('[TransactionMonitoring] Cache miss - querying database');
        const connector = ConnectorFactory_1.ConnectorFactory.createOracleAMLConnector();
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
        await this.cacheManager.set(cacheKey, detections, datasources_config_1.config.cache.defaultTTL);
        return detections;
    }
    /**
     * Get detections by scenario
     */
    async getDetectionsByScenario(scenario, dateRange) {
        const detections = await this.getDetections(dateRange);
        return detections.filter((d) => d.SCENARIO_NAME === scenario);
    }
    /**
     * Get detections by status
     */
    async getDetectionsByStatus(status, dateRange) {
        const detections = await this.getDetections(dateRange);
        return detections.filter((d) => d.STATUS === status);
    }
    /**
     * Get detection KPIs
     */
    async getKPIs(dateRange) {
        const cacheKey = RedisCacheManager_1.RedisCacheManager.getAggregatesCacheKey('detections', dateRange.startDate, dateRange.endDate);
        // Check cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            console.log('[TransactionMonitoring] Returning KPIs from cache');
            return cached;
        }
        // Calculate KPIs from detections
        console.log('[TransactionMonitoring] Computing KPIs from detections');
        const detections = await this.getDetections(dateRange);
        const kpis = {
            alertCount: detections.length,
            pendingCount: detections.filter((d) => d.STATUS === 'New').length,
            delayedCount: detections.filter((d) => d.STATUS === 'Delayed').length,
            suspiciousInitialCount: detections.filter((d) => d.STATUS === 'Suspicious Initial').length,
            falsePositiveInitialCount: detections.filter((d) => d.STATUS === 'False Positive Initial').length,
            waitingForEvidenceCount: detections.filter((d) => d.STATUS === 'Waiting for Evidence').length,
            sentSARCount: detections.filter((d) => d.STATUS === 'Sent SAR').length,
            suspiciousFinalCount: detections.filter((d) => d.STATUS === 'Suspicious Final').length,
            falsePositiveFinalCount: detections.filter((d) => d.STATUS === 'False Positive Final').length,
            processedAlertsCount: detections.filter((d) => ['Sent SAR', 'Suspicious Final', 'False Positive Final'].includes(d.STATUS)).length,
            pendingSARCount: detections.filter((d) => (d.SCENARIO_NAME === 'CO' || d.SCENARIO_NAME === 'SAR') &&
                ['New', 'Delayed', 'Waiting for Evidence', 'Suspicious Initial'].includes(d.STATUS)).length,
        };
        // Cache KPIs with shorter TTL
        await this.cacheManager.set(cacheKey, kpis, datasources_config_1.config.cache.aggregateTTL);
        return kpis;
    }
    /**
     * Get alert trends (time series data)
     */
    async getAlertTrends(dateRange) {
        const detections = await this.getDetections(dateRange);
        // Group by date
        const trendMap = {};
        detections.forEach((d) => {
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
    async getScenarioDistribution(dateRange) {
        const detections = await this.getDetections(dateRange);
        // Group by scenario
        const scenarioMap = {};
        detections.forEach((d) => {
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
    async getStatusDistribution(dateRange) {
        const detections = await this.getDetections(dateRange);
        // Group by status
        const statusMap = {};
        detections.forEach((d) => {
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
exports.TransactionMonitoringService = TransactionMonitoringService;
//# sourceMappingURL=TransactionMonitoringService.js.map