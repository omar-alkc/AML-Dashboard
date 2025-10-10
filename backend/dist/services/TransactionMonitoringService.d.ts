import { Detection, DetectionKPIs, DateRange } from '../types';
/**
 * Transaction Monitoring Service
 * Handles detection/alert data from Eastnets AML system
 */
export declare class TransactionMonitoringService {
    private cacheManager;
    constructor();
    /**
     * Get all detections for a date range
     */
    getDetections(dateRange: DateRange): Promise<Detection[]>;
    /**
     * Get detections by scenario
     */
    getDetectionsByScenario(scenario: string, dateRange: DateRange): Promise<Detection[]>;
    /**
     * Get detections by status
     */
    getDetectionsByStatus(status: string, dateRange: DateRange): Promise<Detection[]>;
    /**
     * Get detection KPIs
     */
    getKPIs(dateRange: DateRange): Promise<DetectionKPIs>;
    /**
     * Get alert trends (time series data)
     */
    getAlertTrends(dateRange: DateRange): Promise<any>;
    /**
     * Get scenario distribution
     */
    getScenarioDistribution(dateRange: DateRange): Promise<any>;
    /**
     * Get status distribution
     */
    getStatusDistribution(dateRange: DateRange): Promise<any>;
}
//# sourceMappingURL=TransactionMonitoringService.d.ts.map