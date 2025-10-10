import { Request, Response } from 'express';
/**
 * Data Controller
 * Handles API endpoints for retrieving detection, screening, and GoAML data
 */
export declare class DataController {
    private transactionMonitoringService;
    private screeningService;
    private goamlService;
    constructor();
    /**
     * GET /api/data/detections
     * Get all detections for date range
     */
    getDetections(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/data/detections/scenario/:scenario
     * Get detections by scenario
     */
    getDetectionsByScenario(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/data/detections/kpis
     * Get detection KPIs
     */
    getDetectionKPIs(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/data/detections/trends
     * Get alert trends
     */
    getDetectionTrends(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/data/screening
     * Get all screening records
     */
    getScreening(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/data/screening/onboarding
     * Get onboarding alerts
     */
    getScreeningOnboarding(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/data/screening/kpis
     * Get screening KPIs
     */
    getScreeningKPIs(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/data/goaml-reports
     * Get all GoAML reports
     */
    getGoAMLReports(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/data/goaml-reports/status/:status
     * Get GoAML reports by status
     */
    getGoAMLReportsByStatus(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/data/goaml-reports/kpis
     * Get GoAML KPIs
     */
    getGoAMLKPIs(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=DataController.d.ts.map