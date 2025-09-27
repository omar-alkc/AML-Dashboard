export interface Screening {
  detection_date: string;
  detection_id: string;
  MSISDN: string;
  status: string;
  investigator: string;
  screening_type: 'onboarding' | 'periodic' | 'wu_beneficiary';
  wallet_creation_date?: string;
  alert_creation_date?: string;
  auto_processed_date?: string;
  manual_processed_date?: string;
  rejection_reason?: string;
  screening_source: 'Eastnets AML' | 'Eastnets Screening' | 'GOAML' | 'Western Union';
}

export interface ScreeningKPI {
  walletsCreated?: number;
  alertsCreated?: number;
  autoReleased?: number;
  manualReleased?: number;
  pendingSeniorReview?: number;
  rejectedWallets?: number;
  walletsScanned?: number;
  periodicAlertsCreated?: number;
  pendingAlerts?: number;
  wuBeneficiaryRequests?: number;
  autoApproved?: number;
  manuallyApproved?: number;
  pendingRequests?: number;
  pendingScreeningAlerts?: number;
  rejectedRequests?: number;
}

export interface ScreeningMetrics {
  period: string;
  totalWalletsCreated: number;
  newDetections: number;
  falsePositives: number;
  walletsRejected: number;
  scannedWallets: number;
  createdAlerts: number;
  manuallyProcessedAlerts: number;
  automaticallyReleasedAlerts: number;
  scannedRequests: number;
  rejectedRequests?: number;
  soundexMatches?: number;
}

export interface InvestigatorPerformance {
  investigator: string;
  workload: number;
  processed: number;
  pending: number;
  rejected: number;
}

export abstract class ScreeningData {
  abstract data: Screening[];
  abstract getScreenings(): Screening[];
  abstract getScreeningsByStatus(status: string): Screening[];
  abstract getScreeningsByDateRange(start: string, end: string): Screening[];
  abstract getScreeningsByInvestigator(investigator: string): Screening[];
  abstract getScreeningsByType(type: 'onboarding' | 'periodic' | 'wu_beneficiary'): Screening[];
  abstract getOnboardingKPIs(start: string, end: string): ScreeningKPI;
  abstract getPeriodicKPIs(start: string, end: string): ScreeningKPI;
  abstract getWUKPIs(start: string, end: string): ScreeningKPI;
  abstract getOnboardingTimeSeries(start: string, end: string, period: 'day'|'week'|'month'): ScreeningMetrics[];
  abstract getPeriodicTimeSeries(start: string, end: string, period: 'day'|'week'|'month'): ScreeningMetrics[];
  abstract getWUTimeSeries(start: string, end: string, period: 'day'|'week'|'month'): ScreeningMetrics[];
  abstract getInvestigatorPerformance(screeningType: string, start: string, end: string): InvestigatorPerformance[];
}