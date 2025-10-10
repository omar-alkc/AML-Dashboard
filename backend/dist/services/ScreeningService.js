"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreeningService = void 0;
const ConnectorFactory_1 = require("../connectors/ConnectorFactory");
const RedisCacheManager_1 = require("../cache/RedisCacheManager");
const datasources_config_1 = require("../config/datasources.config");
/**
 * Screening Service
 * Handles screening data from Oracle Screening DB and Google Sheets
 */
class ScreeningService {
    constructor() {
        this.cacheManager = RedisCacheManager_1.RedisCacheManager.getInstance();
    }
    /**
     * Get screening records from Oracle
     */
    async getScreeningRecordsOracle(dateRange) {
        const cacheKey = RedisCacheManager_1.RedisCacheManager.getScreeningCacheKey(dateRange.startDate, dateRange.endDate, 'oracle');
        // Check cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            console.log('[Screening] Returning Oracle screening records from cache');
            return cached;
        }
        // Cache miss - query database
        console.log('[Screening] Cache miss - querying Oracle database');
        const connector = ConnectorFactory_1.ConnectorFactory.createOracleScreeningConnector();
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
      WHERE SCREENING_DATE >= ${connector.formatDate(dateRange.startDate)}
        AND SCREENING_DATE <= ${connector.formatDate(dateRange.endDate)}
      ORDER BY SCREENING_DATE DESC
    `;
        const records = await connector.query(sql);
        // Cache the results
        await this.cacheManager.set(cacheKey, records, datasources_config_1.config.cache.defaultTTL);
        return records;
    }
    /**
     * Get screening records from Google Sheets
     */
    async getScreeningRecordsSheet(dateRange) {
        const cacheKey = RedisCacheManager_1.RedisCacheManager.getScreeningCacheKey(dateRange.startDate, dateRange.endDate, 'sheet');
        // Check cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            console.log('[Screening] Returning Google Sheets screening records from cache');
            return cached;
        }
        // Cache miss - query Google Sheets
        console.log('[Screening] Cache miss - querying Google Sheets');
        const connector = ConnectorFactory_1.ConnectorFactory.createGoogleSheetsConnector();
        const allRecords = await connector.readSheet('screening');
        // Filter by date range
        const filteredRecords = allRecords.filter((row) => {
            const date = row.screening_date || row.date || '';
            return date >= dateRange.startDate && date <= dateRange.endDate;
        });
        // Cache the results
        await this.cacheManager.set(cacheKey, filteredRecords, datasources_config_1.config.cache.defaultTTL);
        return filteredRecords;
    }
    /**
     * Get all screening records (combined from both sources)
     */
    async getScreeningRecords(dateRange) {
        const cacheKey = RedisCacheManager_1.RedisCacheManager.getScreeningCacheKey(dateRange.startDate, dateRange.endDate);
        // Check cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            console.log('[Screening] Returning combined screening records from cache');
            return cached;
        }
        // Get data from both sources
        const [oracleRecords, sheetRecords] = await Promise.all([
            this.getScreeningRecordsOracle(dateRange),
            this.getScreeningRecordsSheet(dateRange),
        ]);
        // Combine records
        const combined = [...oracleRecords, ...sheetRecords];
        // Cache combined data
        await this.cacheManager.set(cacheKey, combined, datasources_config_1.config.cache.defaultTTL);
        return combined;
    }
    /**
     * Get onboarding alerts (specific subset of screening records)
     */
    async getOnboardingAlerts(dateRange) {
        const allRecords = await this.getScreeningRecords(dateRange);
        // Filter for onboarding-specific records
        // Adjust filter logic based on actual data structure
        const onboardingAlerts = allRecords.filter((record) => {
            return record.STATUS === 'Alert' || record.HIT_TYPE === 'Onboarding';
        });
        return onboardingAlerts;
    }
    /**
     * Get combined screening data (merged by customer_id)
     */
    async getCombinedScreeningData(dateRange) {
        const [oracleRecords, sheetRecords] = await Promise.all([
            this.getScreeningRecordsOracle(dateRange),
            this.getScreeningRecordsSheet(dateRange),
        ]);
        // Create a map for quick lookup
        const customerMap = {};
        // Add Oracle records
        oracleRecords.forEach((record) => {
            const custId = record.CUSTOMER_ID || record.customer_id;
            if (custId) {
                customerMap[custId] = {
                    ...record,
                    source: 'oracle',
                };
            }
        });
        // Merge with sheet records
        sheetRecords.forEach((record) => {
            const custId = record.customer_id || record.CUSTOMER_ID;
            if (custId) {
                if (customerMap[custId]) {
                    // Merge data
                    customerMap[custId] = {
                        ...customerMap[custId],
                        ...record,
                        sources: ['oracle', 'sheet'],
                    };
                }
                else {
                    customerMap[custId] = {
                        ...record,
                        source: 'sheet',
                    };
                }
            }
        });
        return Object.values(customerMap);
    }
    /**
     * Get screening KPIs
     */
    async getScreeningKPIs(dateRange) {
        const records = await this.getScreeningRecords(dateRange);
        const kpis = {
            totalScreening: records.length,
            pendingScreening: records.filter((r) => r.STATUS === 'Pending' || r.status === 'Pending').length,
            completedScreening: records.filter((r) => r.STATUS === 'Completed' || r.status === 'Completed').length,
            hitRate: 0,
        };
        // Calculate hit rate
        const hitsCount = records.filter((r) => r.HIT_TYPE || r.hit_type).length;
        kpis.hitRate = kpis.totalScreening > 0
            ? (hitsCount / kpis.totalScreening) * 100
            : 0;
        return kpis;
    }
    /**
     * Get screening trends
     */
    async getScreeningTrends(dateRange) {
        const records = await this.getScreeningRecords(dateRange);
        // Group by date
        const trendMap = {};
        records.forEach((r) => {
            const date = (r.SCREENING_DATE || r.screening_date || '').split('T')[0];
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
}
exports.ScreeningService = ScreeningService;
//# sourceMappingURL=ScreeningService.js.map