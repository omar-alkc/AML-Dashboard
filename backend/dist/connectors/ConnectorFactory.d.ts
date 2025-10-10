import { OracleConnector } from './OracleConnector';
import { GoogleSheetsConnector } from './GoogleSheetsConnector';
/**
 * Factory for creating data connector instances
 * Centralizes connector creation and configuration
 */
export declare class ConnectorFactory {
    private static oracleAMLInstance;
    private static oracleScreeningInstance;
    private static googleSheetsInstance;
    /**
     * Create or get Oracle AML connector (singleton)
     */
    static createOracleAMLConnector(): OracleConnector;
    /**
     * Create or get Oracle Screening connector (singleton)
     */
    static createOracleScreeningConnector(): OracleConnector;
    /**
     * Create or get Google Sheets connector (singleton)
     */
    static createGoogleSheetsConnector(): GoogleSheetsConnector;
    /**
     * Initialize all connectors
     */
    static initializeAll(): Promise<void>;
    /**
     * Disconnect all connectors
     */
    static disconnectAll(): Promise<void>;
    /**
     * Check health of all connectors
     */
    static checkAllHealth(): Promise<{
        [key: string]: boolean;
    }>;
}
//# sourceMappingURL=ConnectorFactory.d.ts.map