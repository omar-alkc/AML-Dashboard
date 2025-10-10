import { Request, Response } from 'express';
import { TransactionMonitoringService } from '../services/TransactionMonitoringService';
import { ScreeningService } from '../services/ScreeningService';
import { GoAMLService } from '../services/GoAMLService';
import { ApiResponse, DateRange } from '../types';

/**
 * Data Controller
 * Handles API endpoints for retrieving detection, screening, and GoAML data
 */
export class DataController {
  private transactionMonitoringService: TransactionMonitoringService;
  private screeningService: ScreeningService;
  private goamlService: GoAMLService;

  constructor() {
    this.transactionMonitoringService = new TransactionMonitoringService();
    this.screeningService = new ScreeningService();
    this.goamlService = new GoAMLService();
  }

  /**
   * GET /api/data/detections
   * Get all detections for date range
   */
  async getDetections(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        } as ApiResponse);
        return;
      }

      const dateRange: DateRange = {
        startDate: startDate as string,
        endDate: endDate as string,
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
      } as ApiResponse);
    } catch (error) {
      console.error('[DataController] Error getting detections:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve detections',
      } as ApiResponse);
    }
  }

  /**
   * GET /api/data/detections/scenario/:scenario
   * Get detections by scenario
   */
  async getDetectionsByScenario(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const { scenario } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        } as ApiResponse);
        return;
      }

      const dateRange: DateRange = {
        startDate: startDate as string,
        endDate: endDate as string,
      };

      const data = await this.transactionMonitoringService.getDetectionsByScenario(
        scenario,
        dateRange
      );
      const queryTime = Date.now() - startTime;

      res.json({
        success: true,
        data,
        metadata: {
          source: 'cache',
          queryTime,
          recordCount: data.length,
        },
      } as ApiResponse);
    } catch (error) {
      console.error('[DataController] Error getting detections by scenario:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve detections',
      } as ApiResponse);
    }
  }

  /**
   * GET /api/data/detections/kpis
   * Get detection KPIs
   */
  async getDetectionKPIs(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        } as ApiResponse);
        return;
      }

      const dateRange: DateRange = {
        startDate: startDate as string,
        endDate: endDate as string,
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
      } as ApiResponse);
    } catch (error) {
      console.error('[DataController] Error getting detection KPIs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve KPIs',
      } as ApiResponse);
    }
  }

  /**
   * GET /api/data/detections/trends
   * Get alert trends
   */
  async getDetectionTrends(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        } as ApiResponse);
        return;
      }

      const dateRange: DateRange = {
        startDate: startDate as string,
        endDate: endDate as string,
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
      } as ApiResponse);
    } catch (error) {
      console.error('[DataController] Error getting detection trends:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve trends',
      } as ApiResponse);
    }
  }

  /**
   * GET /api/data/screening
   * Get all screening records
   */
  async getScreening(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        } as ApiResponse);
        return;
      }

      const dateRange: DateRange = {
        startDate: startDate as string,
        endDate: endDate as string,
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
      } as ApiResponse);
    } catch (error) {
      console.error('[DataController] Error getting screening records:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve screening records',
      } as ApiResponse);
    }
  }

  /**
   * GET /api/data/screening/onboarding
   * Get onboarding alerts
   */
  async getScreeningOnboarding(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        } as ApiResponse);
        return;
      }

      const dateRange: DateRange = {
        startDate: startDate as string,
        endDate: endDate as string,
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
      } as ApiResponse);
    } catch (error) {
      console.error('[DataController] Error getting onboarding alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve onboarding alerts',
      } as ApiResponse);
    }
  }

  /**
   * GET /api/data/screening/kpis
   * Get screening KPIs
   */
  async getScreeningKPIs(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        } as ApiResponse);
        return;
      }

      const dateRange: DateRange = {
        startDate: startDate as string,
        endDate: endDate as string,
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
      } as ApiResponse);
    } catch (error) {
      console.error('[DataController] Error getting screening KPIs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve screening KPIs',
      } as ApiResponse);
    }
  }

  /**
   * GET /api/data/goaml-reports
   * Get all GoAML reports
   */
  async getGoAMLReports(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        } as ApiResponse);
        return;
      }

      const dateRange: DateRange = {
        startDate: startDate as string,
        endDate: endDate as string,
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
      } as ApiResponse);
    } catch (error) {
      console.error('[DataController] Error getting GoAML reports:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve GoAML reports',
      } as ApiResponse);
    }
  }

  /**
   * GET /api/data/goaml-reports/status/:status
   * Get GoAML reports by status
   */
  async getGoAMLReportsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const { status } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        } as ApiResponse);
        return;
      }

      const dateRange: DateRange = {
        startDate: startDate as string,
        endDate: endDate as string,
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
      } as ApiResponse);
    } catch (error) {
      console.error('[DataController] Error getting GoAML reports by status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve GoAML reports',
      } as ApiResponse);
    }
  }

  /**
   * GET /api/data/goaml-reports/kpis
   * Get GoAML KPIs
   */
  async getGoAMLKPIs(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        } as ApiResponse);
        return;
      }

      const dateRange: DateRange = {
        startDate: startDate as string,
        endDate: endDate as string,
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
      } as ApiResponse);
    } catch (error) {
      console.error('[DataController] Error getting GoAML KPIs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve GoAML KPIs',
      } as ApiResponse);
    }
  }
}

