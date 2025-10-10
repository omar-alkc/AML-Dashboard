import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { Detection, DetectionsData } from '../data/detection';

@Injectable()
export class DetectionService implements DetectionsData {
  data: Detection[] = [];

  constructor(private http: HttpClient) {
    this.loadDetections();
  }

  private loadDetections() {
    this.http.get<Detection[]>('assets/mock-data/detections.json')
      .subscribe((detections) => {
        this.data = detections;
      });
  }

  getDetections(): Detection[] {
    return this.data;
  }

  getDetectionsByScenario(scenario: string): Detection[] {
    return this.data.filter((detection) => detection.scenario_name === scenario);
  }

  getDetectionsByStatus(status: string): Detection[] {
    return this.data.filter((detection) => detection.status === status);
  }

  getDetectionsByDateRange(start: string, end: string): Detection[] {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return this.data.filter((detection) => {
      const detectionDate = new Date(detection.detection_date);
      return detectionDate >= startDate && detectionDate <= endDate;
    });
  }

  getDetectionsByInvestigator(investigator: string): Detection[] {
    return this.data.filter((detection) => detection.modified_by === investigator);
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
    // Get pending SAR alerts (Cashout & SAR scenarios that are not yet sent)
    const pendingStatuses = ['New', 'Delayed', 'Waiting for Evidence', 'Suspicious Initial'];
    return this.data.filter(d => 
      (d.scenario_name === 'CO' || d.scenario_name === 'SAR') && 
      pendingStatuses.includes(d.status)
    ).length;
  }
}
