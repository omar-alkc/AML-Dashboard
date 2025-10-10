import { GoAMLReport, GoAMLKPIs, DateRange } from '../types';
/**
 * GoAML Service
 * Handles GoAML report data from Google Sheets
 */
export declare class GoAMLService {
    private cacheManager;
    constructor();
    /**
     * Get all GoAML reports for a date range
     */
    getReports(dateRange: DateRange): Promise<GoAMLReport[]>;
    /**
     * Get reports by status
     */
    getReportsByStatus(status: string, dateRange: DateRange): Promise<GoAMLReport[]>;
    /**
     * Get reports by reporter
     */
    getReportsByReporter(reporter: string, dateRange: DateRange): Promise<GoAMLReport[]>;
    /**
     * Get GoAML reporting KPIs
     */
    getReportingKPIs(dateRange: DateRange): Promise<GoAMLKPIs>;
    /**
     * Get reporting trends
     */
    getReportingTrends(dateRange: DateRange): Promise<any>;
    /**
     * Get reporter statistics
     */
    getReporterStats(dateRange: DateRange): Promise<any>;
    /**
     * Get status distribution
     */
    getStatusDistribution(dateRange: DateRange): Promise<any>;
}
//# sourceMappingURL=GoAMLService.d.ts.map