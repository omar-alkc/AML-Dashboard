export interface GoAmlReport {
  report_id: string;
  submitted_at: string;
  report_type: string;
  submitted_by: string;
  status: string;
  reason: string;
}

export abstract class GoAmlReportData {
  abstract data: GoAmlReport[];
  abstract getReports(): GoAmlReport[];
  abstract getReportsByType(type: string): GoAmlReport[];
  abstract getReportsByStatus(status: string): GoAmlReport[];
  abstract getReportsByDateRange(start: string, end: string): GoAmlReport[];
  abstract getReportsByInvestigator(investigator: string): GoAmlReport[];
}
