"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorFactory = void 0;
const OracleConnector_1 = require("./OracleConnector");
const GoogleSheetsConnector_1 = require("./GoogleSheetsConnector");
const datasources_config_1 = require("../config/datasources.config");
/**
 * Factory for creating data connector instances
 * Centralizes connector creation and configuration
 */
class ConnectorFactory {
    /**
     * Create or get Oracle AML connector (singleton)
     */
    static createOracleAMLConnector() {
        if (!this.oracleAMLInstance) {
            this.oracleAMLInstance = new OracleConnector_1.OracleConnector(datasources_config_1.config.oracleAML, 'OracleAML');
        }
        return this.oracleAMLInstance;
    }
    /**
     * Create or get Oracle Screening connector (singleton)
     */
    static createOracleScreeningConnector() {
        if (!this.oracleScreeningInstance) {
            this.oracleScreeningInstance = new OracleConnector_1.OracleConnector(datasources_config_1.config.oracleScreening, 'OracleScreening');
        }
        return this.oracleScreeningInstance;
    }
    /**
     * Create or get Google Sheets connector (singleton)
     */
    static createGoogleSheetsConnector() {
        if (!this.googleSheetsInstance) {
            this.googleSheetsInstance = new GoogleSheetsConnector_1.GoogleSheetsConnector();
        }
        return this.googleSheetsInstance;
    }
    /**
     * Initialize all connectors
     */
    static async initializeAll() {
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
        }
        catch (error) {
            console.error('[ConnectorFactory] Failed to initialize connectors:', error);
            throw error;
        }
    }
    /**
     * Disconnect all connectors
     */
    static async disconnectAll() {
        console.log('[ConnectorFactory] Disconnecting all connectors...');
        const disconnectPromises = [];
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
    static async checkAllHealth() {
        const health = {};
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
exports.ConnectorFactory = ConnectorFactory;
ConnectorFactory.oracleAMLInstance = null;
ConnectorFactory.oracleScreeningInstance = null;
ConnectorFactory.googleSheetsInstance = null;
//# sourceMappingURL=ConnectorFactory.js.map