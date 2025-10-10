/**
 * Base interface for all data connectors
 * Provides a standard contract for connecting to different data sources
 */
export interface IDataConnector {
    /**
     * Establish connection to the data source
     */
    connect(): Promise<void>;
    /**
     * Close connection to the data source
     */
    disconnect(): Promise<void>;
    /**
     * Execute a query against the data source
     * @param sql - SQL query or equivalent query string
     * @param params - Optional parameters for the query
     */
    query(sql: string, params?: any[]): Promise<any[]>;
    /**
     * Check if the connection is healthy
     */
    isHealthy(): Promise<boolean>;
    /**
     * Get connection information for logging/debugging
     */
    getConnectionInfo(): string;
}
//# sourceMappingURL=IDataConnector.d.ts.map