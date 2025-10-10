import { ScreeningRecord, ScreeningKPIs, DateRange } from '../types';
/**
 * Screening Service
 * Handles screening data from Oracle Screening DB and Google Sheets
 */
export declare class ScreeningService {
    private cacheManager;
    constructor();
    /**
     * Get screening records from Oracle
     */
    getScreeningRecordsOracle(dateRange: DateRange): Promise<ScreeningRecord[]>;
    /**
     * Get screening records from Google Sheets
     */
    getScreeningRecordsSheet(dateRange: DateRange): Promise<any[]>;
    /**
     * Get all screening records (combined from both sources)
     */
    getScreeningRecords(dateRange: DateRange): Promise<any[]>;
    /**
     * Get onboarding alerts (specific subset of screening records)
     */
    getOnboardingAlerts(dateRange: DateRange): Promise<any[]>;
    /**
     * Get combined screening data (merged by customer_id)
     */
    getCombinedScreeningData(dateRange: DateRange): Promise<any[]>;
    /**
     * Get screening KPIs
     */
    getScreeningKPIs(dateRange: DateRange): Promise<ScreeningKPIs>;
    /**
     * Get screening trends
     */
    getScreeningTrends(dateRange: DateRange): Promise<any>;
}
//# sourceMappingURL=ScreeningService.d.ts.map