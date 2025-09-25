import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { GoAmlReport, GoAmlReportData } from '../data/goaml-report';

@Injectable()
export class GoAmlReportService implements GoAmlReportData {
  data: GoAmlReport[] = [];

  constructor(private http: HttpClient) {
    this.loadReports();
  }

  private loadReports() {
    this.http.get<GoAmlReport[]>('assets/mock-data/goaml_reports.json')
      .subscribe((reports) => {
        this.data = reports;
      });
  }

  getReports(): GoAmlReport[] {
    return this.data;
  }

  getReportsByType(type: string): GoAmlReport[] {
    return this.data.filter((report) => report.report_type === type);
  }

  getReportsByStatus(status: string): GoAmlReport[] {
    return this.data.filter((report) => report.status === status);
  }

  getReportsByDateRange(start: string, end: string): GoAmlReport[] {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return this.data.filter((report) => {
      const submissionDate = new Date(report.submitted_at);
      return submissionDate >= startDate && submissionDate <= endDate;
    });
  }

  getReportsByInvestigator(investigator: string): GoAmlReport[] {
    return this.data.filter((report) => report.submitted_by === investigator);
  }

  // Additional helper methods for KPIs
  getSARFiledCount(start: string, end: string): number {
    const filtered = this.getReportsByDateRange(start, end);
    return filtered.filter(r => r.report_type === 'SAR' && r.status === 'Sent').length;
  }

  getLateSubmissionsCount(start: string, end: string): number {
    // This is a placeholder for logic to determine late submissions
    // In a real implementation, this would compare submission dates with deadlines
    return 0;
  }

  getOnTimeSubmissionsCount(start: string, end: string): number {
    // This is a placeholder for logic to determine on-time submissions
    return this.getSARFiledCount(start, end);
  }

  getReportTypeDistribution(start: string, end: string): { [key: string]: number } {
    const filtered = this.getReportsByDateRange(start, end);
    const distribution = {};
    
    filtered.forEach(report => {
      if (!distribution[report.report_type]) {
        distribution[report.report_type] = 0;
      }
      distribution[report.report_type]++;
    });
    
    return distribution;
  }
}
