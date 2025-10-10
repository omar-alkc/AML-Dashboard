import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Detection, DetectionsData } from '../../data/detection';
import { environment } from '../../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  metadata?: {
    source: string;
    queryTime: number;
    recordCount: number;
  };
}

@Injectable()
export class HttpDetectionService extends DetectionsData {
  data: Detection[] = [];
  private apiUrl = `${environment.apiUrl}/data/detections`;
  private currentDateRange: { start: string; end: string } | null = null;

  constructor(private http: HttpClient) {
    super();
    // Auto-load last 3 months on init
    this.loadDefaultDateRange();
  }

  private loadDefaultDateRange(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - environment.cacheMonths);

    this.currentDateRange = {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };

    this.loadData(this.currentDateRange.start, this.currentDateRange.end);
  }

  async loadData(startDate: string, endDate: string): Promise<void> {
    try {
      const response = await this.http.get<ApiResponse<any[]>>(
        `${this.apiUrl}?startDate=${startDate}&endDate=${endDate}`
      ).toPromise();

      if (response && response.success) {
        // Map Oracle column names to Detection interface
        this.data = response.data.map((item: any) => ({
          id: item.ID || item.id,
          scenario_name: item.SCENARIO_NAME || item.scenario_name,
          status: item.STATUS || item.status,
          detection_date: item.DETECTION_DATE || item.detection_date,
          status_change_date: item.STATUS_CHANGE_DATE || item.status_change_date,
          modified_by: item.MODIFIED_BY || item.modified_by,
        }));

        this.currentDateRange = { start: startDate, end: endDate };
        console.log(`[HttpDetectionService] Loaded ${this.data.length} detections`);
      }
    } catch (error) {
      console.error('[HttpDetectionService] Error loading detections:', error);
      this.data = [];
    }
  }

  getDetections(): Detection[] {
    return this.data;
  }

  getDetectionsByScenario(scenario: string): Detection[] {
    return this.data.filter(d => d.scenario_name === scenario);
  }

  getDetectionsByStatus(status: string): Detection[] {
    return this.data.filter(d => d.status === status);
  }

  getDetectionsByDateRange(start: string, end: string): Detection[] {
    // If requesting current range, return cached data
    if (this.currentDateRange && 
        this.currentDateRange.start === start && 
        this.currentDateRange.end === end) {
      return this.data;
    }

    // Otherwise, trigger new load
    this.loadData(start, end);
    return this.data;
  }

  getDetectionsByInvestigator(investigator: string): Detection[] {
    return this.data.filter(d => d.modified_by === investigator);
  }

  // Additional helper methods for KPIs
  getAlertCount(start: string, end: string): number {
    return this.getDetectionsByDateRange(start, end).length;
  }

  getPendingCount(): number {
    return this.getDetectionsByStatus('New').length;
  }

  getDelayedCount(): number {
    return this.getDetectionsByStatus('Delayed').length;
  }

  getSuspiciousInitialCount(): number {
    return this.getDetectionsByStatus('Suspicious Initial').length;
  }

  getFalsePositiveInitialCount(): number {
    return this.getDetectionsByStatus('False Positive Initial').length;
  }

  getWaitingForEvidenceCount(): number {
    return this.getDetectionsByStatus('Waiting for Evidence').length;
  }

  getSentSARCount(start: string, end: string): number {
    const filtered = this.getDetectionsByDateRange(start, end);
    return filtered.filter(d => d.status === 'Sent SAR').length;
  }

  getSuspiciousFinalCount(start: string, end: string): number {
    const filtered = this.getDetectionsByDateRange(start, end);
    return filtered.filter(d => d.status === 'Suspicious Final').length;
  }

  getFalsePositiveFinalCount(start: string, end: string): number {
    const filtered = this.getDetectionsByDateRange(start, end);
    return filtered.filter(d => d.status === 'False Positive Final').length;
  }

  getProcessedAlertsCount(start: string, end: string): number {
    const filtered = this.getDetectionsByDateRange(start, end);
    const processedStatuses = ['Sent SAR', 'Suspicious Final', 'False Positive Final'];
    return filtered.filter(d => processedStatuses.includes(d.status)).length;
  }

  getPendingSARCount(): number {
    const pendingStatuses = ['New', 'Delayed', 'Waiting for Evidence', 'Suspicious Initial'];
    return this.data.filter(d =>
      (d.scenario_name === 'CO' || d.scenario_name === 'SAR') &&
      pendingStatuses.includes(d.status)
    ).length;
  }
}

