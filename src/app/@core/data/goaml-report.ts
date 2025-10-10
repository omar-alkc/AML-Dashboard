export interface GoAmlReport {
  report_id: string;
  submitted_at: string;
  report_type: string;
  submitted_by: string;
  status: string;
  reason: string;
  wallet_type: string;
  source: string; // 'Eastnets' or 'Google Sheet'
}

export abstract class GoAmlReportData {
  abstract data: GoAmlReport[];
  abstract getReports(): GoAmlReport[];
  abstract getReportsByType(type: string): GoAmlReport[];
  abstract getReportsByStatus(status: string): GoAmlReport[];
  abstract getReportsByDateRange(start: string, end: string): GoAmlReport[];
  abstract getReportsByInvestigator(investigator: string): GoAmlReport[];
  
  // KPI methods
  abstract getSentSARCount(start: string, end: string): number;
  abstract getSentSTRCount(start: string, end: string): number;
  abstract getSentCTRCount(start: string, end: string): number;
  
  // Chart data methods
  abstract getReportingWorkTimeseries(start: string, end: string): any;
  abstract getReportsByReporter(start: string, end: string): any;
  abstract getReasonDistribution(start: string, end: string): any;
  abstract getWalletTypeDistribution(start: string, end: string): any;
}
