import oracledb from 'oracledb';
import { IDataConnector } from './IDataConnector';
import { OracleConfig } from '../types';

/**
 * Oracle Database Connector
 * Handles connections to Oracle databases (Eastnets AML and Screening)
 */
export class OracleConnector implements IDataConnector {
  private pool: oracledb.Pool | null = null;
  private config: OracleConfig;
  private name: string;

  constructor(config: OracleConfig, name: string) {
    this.config = config;
    this.name = name;
    
    // Configure oracledb for better performance
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    oracledb.fetchAsString = [oracledb.CLOB];
  }

  async connect(): Promise<void> {
    try {
      console.log(`[${this.name}] Connecting to Oracle database...`);
      
      this.pool = await oracledb.createPool({
        user: this.config.user,
        password: this.config.password,
        connectString: this.config.connectString,
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 1,
        poolTimeout: 60,
      });

      console.log(`[${this.name}] Successfully connected to Oracle database`);
    } catch (error) {
      console.error(`[${this.name}] Failed to connect to Oracle:`, error);
      throw new Error(`Oracle connection failed: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.close(10);
        this.pool = null;
        console.log(`[${this.name}] Disconnected from Oracle database`);
      }
    } catch (error) {
      console.error(`[${this.name}] Error disconnecting from Oracle:`, error);
      throw error;
    }
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.pool) {
      throw new Error(`[${this.name}] Oracle connection not initialized`);
    }

    let connection: oracledb.Connection | null = null;

    try {
      connection = await this.pool.getConnection();
      
      const result = await connection.execute(sql, params, {
        maxRows: 100000, // Safety limit
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      return result.rows as any[];
    } catch (error) {
      console.error(`[${this.name}] Query error:`, error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(`[${this.name}] Error closing connection:`, err);
        }
      }
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.pool) {
        return false;
      }

      const result = await this.query('SELECT 1 FROM DUAL', []);
      return result.length > 0;
    } catch (error) {
      console.error(`[${this.name}] Health check failed:`, error);
      return false;
    }
  }

  getConnectionInfo(): string {
    return `${this.name}: ${this.config.user}@${this.config.connectString}`;
  }

  /**
   * Helper method to format dates for Oracle queries
   */
  formatDate(date: string): string {
    // Convert YYYY-MM-DD to Oracle date format
    return `TO_DATE('${date}', 'YYYY-MM-DD')`;
  }

  /**
   * Get pool statistics for monitoring
   */
  getPoolStats(): any {
    if (!this.pool) {
      return null;
    }
    
    return {
      connectionsOpen: this.pool.connectionsOpen,
      connectionsInUse: this.pool.connectionsInUse,
    };
  }
}

