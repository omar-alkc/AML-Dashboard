import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { IDataConnector } from './IDataConnector';
import { GoogleSheetsConfig, SheetMetadata } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Google Sheets Connector
 * Handles reading data from Google Sheets using service account authentication
 */
export class GoogleSheetsConnector implements IDataConnector {
  private sheets: any;
  private auth: JWT | null = null;
  private config: GoogleSheetsConfig;
  private configPath: string;

  constructor(configPath: string = '../config/googlesheets.json') {
    this.configPath = path.resolve(__dirname, configPath);
    this.config = this.loadConfig();
  }

  private loadConfig(): GoogleSheetsConfig {
    try {
      const configData = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('[GoogleSheets] Failed to load config:', error);
      throw new Error('Failed to load Google Sheets configuration');
    }
  }

  async connect(): Promise<void> {
    try {
      console.log('[GoogleSheets] Authenticating with Google Sheets API...');

      this.auth = new google.auth.JWT({
        email: this.config.credentials.client_email,
        key: this.config.credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      await this.auth.authorize();

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });

      console.log('[GoogleSheets] Successfully authenticated with Google Sheets API');
    } catch (error) {
      console.error('[GoogleSheets] Authentication failed:', error);
      throw new Error(`Google Sheets authentication failed: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    // JWT doesn't require explicit disconnect
    this.auth = null;
    this.sheets = null;
    console.log('[GoogleSheets] Disconnected from Google Sheets API');
  }

  async query(sheetId: string, params?: any[]): Promise<any[]> {
    // For Google Sheets, first param is the range
    const range = params && params.length > 0 ? params[0] : 'A1:Z1000';
    return this.readSheetData(sheetId, range);
  }

  /**
   * Read data from a Google Sheet
   */
  private async readSheetData(sheetId: string, range: string): Promise<any[]> {
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
      const data = rows.slice(1).map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header: string, index: number) => {
          obj[header] = row[index] || null;
        });
        return obj;
      });

      return data;
    } catch (error) {
      console.error('[GoogleSheets] Query error:', error);
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
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
    } catch (error) {
      console.error('[GoogleSheets] Health check failed:', error);
      return false;
    }
  }

  getConnectionInfo(): string {
    return `Google Sheets: ${this.config.credentials.client_email}`;
  }

  /**
   * Read data from a specific sheet configuration
   */
  async readSheet(sheetType: 'screening' | 'goaml'): Promise<any[]> {
    const sheetConfig = this.config.sheets[sheetType];
    return this.readSheetData(sheetConfig.sheetId, sheetConfig.range);
  }

  /**
   * Get metadata about a sheet
   */
  async getSheetMetadata(sheetId: string): Promise<SheetMetadata> {
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
    } catch (error) {
      console.error('[GoogleSheets] Failed to get metadata:', error);
      throw error;
    }
  }

  /**
   * Test connection to a specific sheet
   */
  async testConnection(sheetId: string): Promise<boolean> {
    try {
      await this.getSheetMetadata(sheetId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update sheet configuration at runtime
   */
  updateSheetConfig(sheetType: 'screening' | 'goaml', sheetId: string, range: string): void {
    this.config.sheets[sheetType] = { sheetId, range };
    
    // Save updated config to file
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log(`[GoogleSheets] Updated ${sheetType} sheet configuration`);
    } catch (error) {
      console.error('[GoogleSheets] Failed to save config:', error);
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): GoogleSheetsConfig {
    return this.config;
  }
}

