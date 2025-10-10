import { Request, Response } from 'express';
import { ConnectorFactory } from '../connectors/ConnectorFactory';
import { ApiResponse, DataSourceHealth } from '../types';

/**
 * Configuration Controller
 * Handles API endpoints for managing data source configurations
 */
export class ConfigController {
  /**
   * GET /api/config/googlesheets
   * Get current Google Sheets configuration
   */
  async getGoogleSheetsConfig(req: Request, res: Response): Promise<void> {
    try {
      const connector = ConnectorFactory.createGoogleSheetsConnector();
      const config = connector.getConfig();

      // Don't expose credentials in response
      res.json({
        success: true,
        data: {
          sheets: config.sheets,
        },
      } as ApiResponse);
    } catch (error) {
      console.error('[ConfigController] Error getting Google Sheets config:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve configuration',
      } as ApiResponse);
    }
  }

  /**
   * PUT /api/config/googlesheets/screening
   * Update screening sheet configuration
   */
  async updateScreeningSheetConfig(req: Request, res: Response): Promise<void> {
    try {
      const { sheetId, range } = req.body;

      if (!sheetId || !range) {
        res.status(400).json({
          success: false,
          error: 'sheetId and range are required',
        } as ApiResponse);
        return;
      }

      const connector = ConnectorFactory.createGoogleSheetsConnector();
      connector.updateSheetConfig('screening', sheetId, range);

      res.json({
        success: true,
        data: {
          message: 'Screening sheet configuration updated successfully',
          sheetId,
          range,
        },
      } as ApiResponse);
    } catch (error) {
      console.error('[ConfigController] Error updating screening sheet config:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update configuration',
      } as ApiResponse);
    }
  }

  /**
   * PUT /api/config/googlesheets/goaml
   * Update GoAML sheet configuration
   */
  async updateGoAMLSheetConfig(req: Request, res: Response): Promise<void> {
    try {
      const { sheetId, range } = req.body;

      if (!sheetId || !range) {
        res.status(400).json({
          success: false,
          error: 'sheetId and range are required',
        } as ApiResponse);
        return;
      }

      const connector = ConnectorFactory.createGoogleSheetsConnector();
      connector.updateSheetConfig('goaml', sheetId, range);

      res.json({
        success: true,
        data: {
          message: 'GoAML sheet configuration updated successfully',
          sheetId,
          range,
        },
      } as ApiResponse);
    } catch (error) {
      console.error('[ConfigController] Error updating GoAML sheet config:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update configuration',
      } as ApiResponse);
    }
  }

  /**
   * POST /api/config/googlesheets/test
   * Test connection to a Google Sheet
   */
  async testGoogleSheetConnection(req: Request, res: Response): Promise<void> {
    try {
      const { sheetId } = req.body;

      if (!sheetId) {
        res.status(400).json({
          success: false,
          error: 'sheetId is required',
        } as ApiResponse);
        return;
      }

      const connector = ConnectorFactory.createGoogleSheetsConnector();
      const isConnected = await connector.testConnection(sheetId);

      if (isConnected) {
        const metadata = await connector.getSheetMetadata(sheetId);
        res.json({
          success: true,
          data: {
            message: 'Connection successful',
            metadata,
          },
        } as ApiResponse);
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to connect to Google Sheet',
        } as ApiResponse);
      }
    } catch (error) {
      console.error('[ConfigController] Error testing Google Sheet connection:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test connection',
      } as ApiResponse);
    }
  }

  /**
   * GET /api/config/datasources/health
   * Check health of all data sources
   */
  async getDataSourcesHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await ConnectorFactory.checkAllHealth();

      const healthDetails: DataSourceHealth[] = [
        {
          name: 'Oracle AML',
          type: 'oracle',
          healthy: health.oracleAML || false,
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Oracle Screening',
          type: 'oracle',
          healthy: health.oracleScreening || false,
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Google Sheets',
          type: 'googlesheets',
          healthy: health.googleSheets || false,
          lastChecked: new Date().toISOString(),
        },
      ];

      res.json({
        success: true,
        data: healthDetails,
      } as ApiResponse);
    } catch (error) {
      console.error('[ConfigController] Error checking data source health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check data source health',
      } as ApiResponse);
    }
  }
}

