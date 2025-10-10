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

  // KPI methods
  getSentSARCount(start: string, end: string): number {
    const filtered = this.getReportsByDateRange(start, end);
    return filtered.filter(r => r.report_type === 'SAR' && r.status === 'Sent').length;
  }

  getSentSTRCount(start: string, end: string): number {
    const filtered = this.getReportsByDateRange(start, end);
    return filtered.filter(r => r.report_type === 'STR' && r.status === 'Sent').length;
  }

  getSentCTRCount(start: string, end: string): number {
    const filtered = this.getReportsByDateRange(start, end);
    return filtered.filter(r => r.report_type === 'CTR' && r.status === 'Sent').length;
  }

  // Chart data methods
  getReportingWorkTimeseries(start: string, end: string): any {
    const filtered = this.getReportsByDateRange(start, end);
    
    // Group by date and type
    const timeseries: { [key: string]: { [key: string]: number } } = {};
    
    filtered.forEach(report => {
      const date = report.submitted_at;
      if (!timeseries[date]) {
        timeseries[date] = {};
      }
      
      const key = `${report.report_type}-${report.source}`;
      if (!timeseries[date][key]) {
        timeseries[date][key] = 0;
      }
      timeseries[date][key]++;
    });
    
    return timeseries;
  }

  getReportsByReporter(start: string, end: string): any {
    const filtered = this.getReportsByDateRange(start, end);
    
    // Group by reporter and report type
    const byReporter: { [key: string]: { [key: string]: number } } = {};
    
    filtered.forEach(report => {
      if (report.status === 'Sent') {
        if (!byReporter[report.submitted_by]) {
          byReporter[report.submitted_by] = {};
        }
        
        if (!byReporter[report.submitted_by][report.report_type]) {
          byReporter[report.submitted_by][report.report_type] = 0;
        }
        byReporter[report.submitted_by][report.report_type]++;
      }
    });
    
    return byReporter;
  }

  getReasonDistribution(start: string, end: string): any {
    const filtered = this.getReportsByDateRange(start, end);
    
    // Group by reason with report type breakdown
    const distribution: { [key: string]: { total: number; byType: { [key: string]: number } } } = {};
    
    filtered.forEach(report => {
      if (!distribution[report.reason]) {
        distribution[report.reason] = { total: 0, byType: {} };
      }
      
      distribution[report.reason].total++;
      
      if (!distribution[report.reason].byType[report.report_type]) {
        distribution[report.reason].byType[report.report_type] = 0;
      }
      distribution[report.reason].byType[report.report_type]++;
    });
    
    return distribution;
  }

  getWalletTypeDistribution(start: string, end: string): any {
    const filtered = this.getReportsByDateRange(start, end);
    
    // Group by wallet type with report type breakdown
    const distribution: { [key: string]: { total: number; byType: { [key: string]: number } } } = {};
    
    filtered.forEach(report => {
      if (!distribution[report.wallet_type]) {
        distribution[report.wallet_type] = { total: 0, byType: {} };
      }
      
      distribution[report.wallet_type].total++;
      
      if (!distribution[report.wallet_type].byType[report.report_type]) {
        distribution[report.wallet_type].byType[report.report_type] = 0;
      }
      distribution[report.wallet_type].byType[report.report_type]++;
    });
    
    return distribution;
  }

  // Legacy methods for backwards compatibility
  getSARFiledCount(start: string, end: string): number {
    return this.getSentSARCount(start, end);
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
