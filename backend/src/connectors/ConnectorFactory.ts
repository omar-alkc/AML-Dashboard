import { OracleConnector } from './OracleConnector';
import { GoogleSheetsConnector } from './GoogleSheetsConnector';
import { config } from '../config/datasources.config';

/**
 * Factory for creating data connector instances
 * Centralizes connector creation and configuration
 */
export class ConnectorFactory {
  private static oracleAMLInstance: OracleConnector | null = null;
  private static oracleScreeningInstance: OracleConnector | null = null;
  private static googleSheetsInstance: GoogleSheetsConnector | null = null;

  /**
   * Create or get Oracle AML connector (singleton)
   */
  static createOracleAMLConnector(): OracleConnector {
    if (!this.oracleAMLInstance) {
      this.oracleAMLInstance = new OracleConnector(
        config.oracleAML,
        'OracleAML'
      );
    }
    return this.oracleAMLInstance;
  }

  /**
   * Create or get Oracle Screening connector (singleton)
   */
  static createOracleScreeningConnector(): OracleConnector {
    if (!this.oracleScreeningInstance) {
      this.oracleScreeningInstance = new OracleConnector(
        config.oracleScreening,
        'OracleScreening'
      );
    }
    return this.oracleScreeningInstance;
  }

  /**
   * Create or get Google Sheets connector (singleton)
   */
  static createGoogleSheetsConnector(): GoogleSheetsConnector {
    if (!this.googleSheetsInstance) {
      this.googleSheetsInstance = new GoogleSheetsConnector();
    }
    return this.googleSheetsInstance;
  }

  /**
   * Initialize all connectors
   */
  static async initializeAll(): Promise<void> {
    console.log('[ConnectorFactory] Initializing all data connectors...');

    try {
      // Initialize Oracle AML
      const oracleAML = this.createOracleAMLConnector();
      await oracleAML.connect();

      // Initialize Oracle Screening
      const oracleScreening = this.createOracleScreeningConnector();
      await oracleScreening.connect();

      // Initialize Google Sheets
      const googleSheets = this.createGoogleSheetsConnector();
      await googleSheets.connect();

      console.log('[ConnectorFactory] All connectors initialized successfully');
    } catch (error) {
      console.error('[ConnectorFactory] Failed to initialize connectors:', error);
      throw error;
    }
  }

  /**
   * Disconnect all connectors
   */
  static async disconnectAll(): Promise<void> {
    console.log('[ConnectorFactory] Disconnecting all connectors...');

    const disconnectPromises: Promise<void>[] = [];

    if (this.oracleAMLInstance) {
      disconnectPromises.push(this.oracleAMLInstance.disconnect());
    }

    if (this.oracleScreeningInstance) {
      disconnectPromises.push(this.oracleScreeningInstance.disconnect());
    }

    if (this.googleSheetsInstance) {
      disconnectPromises.push(this.googleSheetsInstance.disconnect());
    }

    await Promise.all(disconnectPromises);
    console.log('[ConnectorFactory] All connectors disconnected');
  }

  /**
   * Check health of all connectors
   */
  static async checkAllHealth(): Promise<{[key: string]: boolean}> {
    const health: {[key: string]: boolean} = {};

    if (this.oracleAMLInstance) {
      health.oracleAML = await this.oracleAMLInstance.isHealthy();
    }

    if (this.oracleScreeningInstance) {
      health.oracleScreening = await this.oracleScreeningInstance.isHealthy();
    }

    if (this.googleSheetsInstance) {
      health.googleSheets = await this.googleSheetsInstance.isHealthy();
    }

    return health;
  }
}

