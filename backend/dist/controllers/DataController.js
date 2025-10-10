"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataController = void 0;
const TransactionMonitoringService_1 = require("../services/TransactionMonitoringService");
const ScreeningService_1 = require("../services/ScreeningService");
const GoAMLService_1 = require("../services/GoAMLService");
/**
 * Data Controller
 * Handles API endpoints for retrieving detection, screening, and GoAML data
 */
class DataController {
    constructor() {
        this.transactionMonitoringService = new TransactionMonitoringService_1.TransactionMonitoringService();
        this.screeningService = new ScreeningService_1.ScreeningService();
        this.goamlService = new GoAMLService_1.GoAMLService();
    }
    /**
     * GET /api/data/detections
     * Get all detections for date range
     */
    async getDetections(req, res) {
        try {
            const startTime = Date.now();
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    error: 'startDate and endDate are required',
                });
                return;
            }
            const dateRange = {
                startDate: startDate,
                endDate: endDate,
            };
            const data = await this.transactionMonitoringService.getDetections(dateRange);
            const queryTime = Date.now() - startTime;
            res.json({
                success: true,
                data,
                metadata: {
                    source: 'cache',
                    queryTime,
                    recordCount: data.length,
                },
            });
        }
        catch (error) {
            console.error('[DataController] Error getting detections:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve detections',
            });
        }
    }
    /**
     * GET /api/data/detections/scenario/:scenario
     * Get detections by scenario
     */
    async getDetectionsByScenario(req, res) {
        try {
            const startTime = Date.now();
            const { scenario } = req.params;
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    error: 'startDate and endDate are required',
                });
                return;
            }
            const dateRange = {
                startDate: startDate,
                endDate: endDate,
            };
            const data = await this.transactionMonitoringService.getDetectionsByScenario(scenario, dateRange);
            const queryTime = Date.now() - startTime;
            res.json({
                success: true,
                data,
                metadata: {
                    source: 'cache',
                    queryTime,
                    recordCount: data.length,
                },
            });
        }
        catch (error) {
            console.error('[DataController] Error getting detections by scenario:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve detections',
            });
        }
    }
    /**
     * GET /api/data/detections/kpis
     * Get detection KPIs
     */
    async getDetectionKPIs(req, res) {
        try {
            const startTime = Date.now();
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    error: 'startDate and endDate are required',
                });
                return;
            }
            const dateRange = {
                startDate: startDate,
                endDate: endDate,
            };
            const data = await this.transactionMonitoringService.getKPIs(dateRange);
            const queryTime = Date.now() - startTime;
            res.json({
                success: true,
                data,
                metadata: {
                    source: 'cache',
                    queryTime,
                    recordCount: 1,
                },
            });
        }
        catch (error) {
            console.error('[DataController] Error getting detection KPIs:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve KPIs',
            });
        }
    }
    /**
     * GET /api/data/detections/trends
     * Get alert trends
     */
    async getDetectionTrends(req, res) {
        try {
            const startTime = Date.now();
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    error: 'startDate and endDate are required',
                });
                return;
            }
            const dateRange = {
                startDate: startDate,
                endDate: endDate,
            };
            const data = await this.transactionMonitoringService.getAlertTrends(dateRange);
            const queryTime = Date.now() - startTime;
            res.json({
                success: true,
                data,
                metadata: {
                    source: 'cache',
                    queryTime,
                    recordCount: data.length,
                },
            });
        }
        catch (error) {
            console.error('[DataController] Error getting detection trends:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve trends',
            });
        }
    }
    /**
     * GET /api/data/screening
     * Get all screening records
     */
    async getScreening(req, res) {
        try {
            const startTime = Date.now();
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    error: 'startDate and endDate are required',
                });
                return;
            }
            const dateRange = {
                startDate: startDate,
                endDate: endDate,
            };
            const data = await this.screeningService.getScreeningRecords(dateRange);
            const queryTime = Date.now() - startTime;
            res.json({
                success: true,
                data,
                metadata: {
                    source: 'cache',
                    queryTime,
                    recordCount: data.length,
                },
            });
        }
        catch (error) {
            console.error('[DataController] Error getting screening records:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve screening records',
            });
        }
    }
    /**
     * GET /api/data/screening/onboarding
     * Get onboarding alerts
     */
    async getScreeningOnboarding(req, res) {
        try {
            const startTime = Date.now();
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    error: 'startDate and endDate are required',
                });
                return;
            }
            const dateRange = {
                startDate: startDate,
                endDate: endDate,
            };
            const data = await this.screeningService.getOnboardingAlerts(dateRange);
            const queryTime = Date.now() - startTime;
            res.json({
                success: true,
                data,
                metadata: {
                    source: 'cache',
                    queryTime,
                    recordCount: data.length,
                },
            });
        }
        catch (error) {
            console.error('[DataController] Error getting onboarding alerts:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve onboarding alerts',
            });
        }
    }
    /**
     * GET /api/data/screening/kpis
     * Get screening KPIs
     */
    async getScreeningKPIs(req, res) {
        try {
            const startTime = Date.now();
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    error: 'startDate and endDate are required',
                });
                return;
            }
            const dateRange = {
                startDate: startDate,
                endDate: endDate,
            };
            const data = await this.screeningService.getScreeningKPIs(dateRange);
            const queryTime = Date.now() - startTime;
            res.json({
                success: true,
                data,
                metadata: {
                    source: 'cache',
                    queryTime,
                    recordCount: 1,
                },
            });
        }
        catch (error) {
            console.error('[DataController] Error getting screening KPIs:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve screening KPIs',
            });
        }
    }
    /**
     * GET /api/data/goaml-reports
     * Get all GoAML reports
     */
    async getGoAMLReports(req, res) {
        try {
            const startTime = Date.now();
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    error: 'startDate and endDate are required',
                });
                return;
            }
            const dateRange = {
                startDate: startDate,
                endDate: endDate,
            };
            const data = await this.goamlService.getReports(dateRange);
            const queryTime = Date.now() - startTime;
            res.json({
                success: true,
                data,
                metadata: {
                    source: 'cache',
                    queryTime,
                    recordCount: data.length,
                },
            });
        }
        catch (error) {
            console.error('[DataController] Error getting GoAML reports:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve GoAML reports',
            });
        }
    }
    /**
     * GET /api/data/goaml-reports/status/:status
     * Get GoAML reports by status
     */
    async getGoAMLReportsByStatus(req, res) {
        try {
            const startTime = Date.now();
            const { status } = req.params;
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    error: 'startDate and endDate are required',
                });
                return;
            }
            const dateRange = {
                startDate: startDate,
                endDate: endDate,
            };
            const data = await this.goamlService.getReportsByStatus(status, dateRange);
            const queryTime = Date.now() - startTime;
            res.json({
                success: true,
                data,
                metadata: {
                    source: 'cache',
                    queryTime,
                    recordCount: data.length,
                },
            });
        }
        catch (error) {
            console.error('[DataController] Error getting GoAML reports by status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve GoAML reports',
            });
        }
    }
    /**
     * GET /api/data/goaml-reports/kpis
     * Get GoAML KPIs
     */
    async getGoAMLKPIs(req, res) {
        try {
            const startTime = Date.now();
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    error: 'startDate and endDate are required',
                });
                return;
            }
            const dateRange = {
                startDate: startDate,
                endDate: endDate,
            };
            const data = await this.goamlService.getReportingKPIs(dateRange);
            const queryTime = Date.now() - startTime;
            res.json({
                success: true,
                data,
                metadata: {
                    source: 'cache',
                    queryTime,
                    recordCount: 1,
                },
            });
        }
        catch (error) {
            console.error('[DataController] Error getting GoAML KPIs:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve GoAML KPIs',
            });
        }
    }
}
exports.DataController = DataController;
//# sourceMappingURL=DataController.js.map