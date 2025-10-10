"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetsConnector = void 0;
const googleapis_1 = require("googleapis");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Google Sheets Connector
 * Handles reading data from Google Sheets using service account authentication
 */
class GoogleSheetsConnector {
    constructor(configPath = '../config/googlesheets.json') {
        this.auth = null;
        this.configPath = path.resolve(__dirname, configPath);
        this.config = this.loadConfig();
    }
    loadConfig() {
        try {
            const configData = fs.readFileSync(this.configPath, 'utf8');
            return JSON.parse(configData);
        }
        catch (error) {
            console.error('[GoogleSheets] Failed to load config:', error);
            throw new Error('Failed to load Google Sheets configuration');
        }
    }
    async connect() {
        try {
            console.log('[GoogleSheets] Authenticating with Google Sheets API...');
            this.auth = new googleapis_1.google.auth.JWT({
                email: this.config.credentials.client_email,
                key: this.config.credentials.private_key,
                scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
            });
            await this.auth.authorize();
            this.sheets = googleapis_1.google.sheets({ version: 'v4', auth: this.auth });
            console.log('[GoogleSheets] Successfully authenticated with Google Sheets API');
        }
        catch (error) {
            console.error('[GoogleSheets] Authentication failed:', error);
            throw new Error(`Google Sheets authentication failed: ${error}`);
        }
    }
    async disconnect() {
        // JWT doesn't require explicit disconnect
        this.auth = null;
        this.sheets = null;
        console.log('[GoogleSheets] Disconnected from Google Sheets API');
    }
    async query(sheetId, params) {
        // For Google Sheets, first param is the range
        const range = params && params.length > 0 ? params[0] : 'A1:Z1000';
        return this.readSheetData(sheetId, range);
    }
    /**
     * Read data from a Google Sheet
     */
    async readSheetData(sheetId, range) {
        if (!this.sheets) {
            throw new Error('[GoogleSheets] Not connected to Google Sheets API');
        }
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: range,
            });
            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                console.log('[GoogleSheets] No data found in sheet');
                return [];
            }
            // Convert rows to objects using first row as headers
            const headers = rows[0];
            const data = rows.slice(1).map((row) => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] || null;
                });
                return obj;
            });
            return data;
        }
        catch (error) {
            console.error('[GoogleSheets] Query error:', error);
            throw error;
        }
    }
    async isHealthy() {
        try {
            if (!this.sheets) {
                return false;
            }
            // Try to read metadata from screening sheet to verify connection
            const sheetId = this.config.sheets.screening.sheetId;
            await this.sheets.spreadsheets.get({
                spreadsheetId: sheetId,
            });
            return true;
        }
        catch (error) {
            console.error('[GoogleSheets] Health check failed:', error);
            return false;
        }
    }
    getConnectionInfo() {
        return `Google Sheets: ${this.config.credentials.client_email}`;
    }
    /**
     * Read data from a specific sheet configuration
     */
    async readSheet(sheetType) {
        const sheetConfig = this.config.sheets[sheetType];
        return this.readSheetData(sheetConfig.sheetId, sheetConfig.range);
    }
    /**
     * Get metadata about a sheet
     */
    async getSheetMetadata(sheetId) {
        if (!this.sheets) {
            throw new Error('[GoogleSheets] Not connected to Google Sheets API');
        }
        try {
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: sheetId,
            });
            return {
                title: response.data.properties.title,
                sheetCount: response.data.sheets.length,
                lastModified: response.data.properties.timeZone,
            };
        }
        catch (error) {
            console.error('[GoogleSheets] Failed to get metadata:', error);
            throw error;
        }
    }
    /**
     * Test connection to a specific sheet
     */
    async testConnection(sheetId) {
        try {
            await this.getSheetMetadata(sheetId);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Update sheet configuration at runtime
     */
    updateSheetConfig(sheetType, sheetId, range) {
        this.config.sheets[sheetType] = { sheetId, range };
        // Save updated config to file
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
            console.log(`[GoogleSheets] Updated ${sheetType} sheet configuration`);
        }
        catch (error) {
            console.error('[GoogleSheets] Failed to save config:', error);
            throw error;
        }
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return this.config;
    }
}
exports.GoogleSheetsConnector = GoogleSheetsConnector;
//# sourceMappingURL=GoogleSheetsConnector.js.map