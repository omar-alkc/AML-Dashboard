"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigController = void 0;
const ConnectorFactory_1 = require("../connectors/ConnectorFactory");
/**
 * Configuration Controller
 * Handles API endpoints for managing data source configurations
 */
class ConfigController {
    /**
     * GET /api/config/googlesheets
     * Get current Google Sheets configuration
     */
    async getGoogleSheetsConfig(req, res) {
        try {
            const connector = ConnectorFactory_1.ConnectorFactory.createGoogleSheetsConnector();
            const config = connector.getConfig();
            // Don't expose credentials in response
            res.json({
                success: true,
                data: {
                    sheets: config.sheets,
                },
            });
        }
        catch (error) {
            console.error('[ConfigController] Error getting Google Sheets config:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve configuration',
            });
        }
    }
    /**
     * PUT /api/config/googlesheets/screening
     * Update screening sheet configuration
     */
    async updateScreeningSheetConfig(req, res) {
        try {
            const { sheetId, range } = req.body;
            if (!sheetId || !range) {
                res.status(400).json({
                    success: false,
                    error: 'sheetId and range are required',
                });
                return;
            }
            const connector = ConnectorFactory_1.ConnectorFactory.createGoogleSheetsConnector();
            connector.updateSheetConfig('screening', sheetId, range);
            res.json({
                success: true,
                data: {
                    message: 'Screening sheet configuration updated successfully',
                    sheetId,
                    range,
                },
            });
        }
        catch (error) {
            console.error('[ConfigController] Error updating screening sheet config:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update configuration',
            });
        }
    }
    /**
     * PUT /api/config/googlesheets/goaml
     * Update GoAML sheet configuration
     */
    async updateGoAMLSheetConfig(req, res) {
        try {
            const { sheetId, range } = req.body;
            if (!sheetId || !range) {
                res.status(400).json({
                    success: false,
                    error: 'sheetId and range are required',
                });
                return;
            }
            const connector = ConnectorFactory_1.ConnectorFactory.createGoogleSheetsConnector();
            connector.updateSheetConfig('goaml', sheetId, range);
            res.json({
                success: true,
                data: {
                    message: 'GoAML sheet configuration updated successfully',
                    sheetId,
                    range,
                },
            });
        }
        catch (error) {
            console.error('[ConfigController] Error updating GoAML sheet config:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update configuration',
            });
        }
    }
    /**
     * POST /api/config/googlesheets/test
     * Test connection to a Google Sheet
     */
    async testGoogleSheetConnection(req, res) {
        try {
            const { sheetId } = req.body;
            if (!sheetId) {
                res.status(400).json({
                    success: false,
                    error: 'sheetId is required',
                });
                return;
            }
            const connector = ConnectorFactory_1.ConnectorFactory.createGoogleSheetsConnector();
            const isConnected = await connector.testConnection(sheetId);
            if (isConnected) {
                const metadata = await connector.getSheetMetadata(sheetId);
                res.json({
                    success: true,
                    data: {
                        message: 'Connection successful',
                        metadata,
                    },
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    error: 'Failed to connect to Google Sheet',
                });
            }
        }
        catch (error) {
            console.error('[ConfigController] Error testing Google Sheet connection:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to test connection',
            });
        }
    }
    /**
     * GET /api/config/datasources/health
     * Check health of all data sources
     */
    async getDataSourcesHealth(req, res) {
        try {
            const health = await ConnectorFactory_1.ConnectorFactory.checkAllHealth();
            const healthDetails = [
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
            });
        }
        catch (error) {
            console.error('[ConfigController] Error checking data source health:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to check data source health',
            });
        }
    }
}
exports.ConfigController = ConfigController;
//# sourceMappingURL=ConfigController.js.map