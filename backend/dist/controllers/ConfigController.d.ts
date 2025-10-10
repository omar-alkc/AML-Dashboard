import { Request, Response } from 'express';
/**
 * Configuration Controller
 * Handles API endpoints for managing data source configurations
 */
export declare class ConfigController {
    /**
     * GET /api/config/googlesheets
     * Get current Google Sheets configuration
     */
    getGoogleSheetsConfig(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/config/googlesheets/screening
     * Update screening sheet configuration
     */
    updateScreeningSheetConfig(req: Request, res: Response): Promise<void>;
    /**
     * PUT /api/config/googlesheets/goaml
     * Update GoAML sheet configuration
     */
    updateGoAMLSheetConfig(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/config/googlesheets/test
     * Test connection to a Google Sheet
     */
    testGoogleSheetConnection(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/config/datasources/health
     * Check health of all data sources
     */
    getDataSourcesHealth(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ConfigController.d.ts.map