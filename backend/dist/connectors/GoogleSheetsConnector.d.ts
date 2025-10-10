import { IDataConnector } from './IDataConnector';
import { GoogleSheetsConfig, SheetMetadata } from '../types';
/**
 * Google Sheets Connector
 * Handles reading data from Google Sheets using service account authentication
 */
export declare class GoogleSheetsConnector implements IDataConnector {
    private sheets;
    private auth;
    private config;
    private configPath;
    constructor(configPath?: string);
    private loadConfig;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sheetId: string, params?: any[]): Promise<any[]>;
    /**
     * Read data from a Google Sheet
     */
    private readSheetData;
    isHealthy(): Promise<boolean>;
    getConnectionInfo(): string;
    /**
     * Read data from a specific sheet configuration
     */
    readSheet(sheetType: 'screening' | 'goaml'): Promise<any[]>;
    /**
     * Get metadata about a sheet
     */
    getSheetMetadata(sheetId: string): Promise<SheetMetadata>;
    /**
     * Test connection to a specific sheet
     */
    testConnection(sheetId: string): Promise<boolean>;
    /**
     * Update sheet configuration at runtime
     */
    updateSheetConfig(sheetType: 'screening' | 'goaml', sheetId: string, range: string): void;
    /**
     * Get current configuration
     */
    getConfig(): GoogleSheetsConfig;
}
//# sourceMappingURL=GoogleSheetsConnector.d.ts.map