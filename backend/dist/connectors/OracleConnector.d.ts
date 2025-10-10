import { IDataConnector } from './IDataConnector';
import { OracleConfig } from '../types';
/**
 * Oracle Database Connector
 * Handles connections to Oracle databases (Eastnets AML and Screening)
 */
export declare class OracleConnector implements IDataConnector {
    private pool;
    private config;
    private name;
    constructor(config: OracleConfig, name: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string, params?: any[]): Promise<any[]>;
    isHealthy(): Promise<boolean>;
    getConnectionInfo(): string;
    /**
     * Helper method to format dates for Oracle queries
     */
    formatDate(date: string): string;
    /**
     * Get pool statistics for monitoring
     */
    getPoolStats(): any;
}
//# sourceMappingURL=OracleConnector.d.ts.map