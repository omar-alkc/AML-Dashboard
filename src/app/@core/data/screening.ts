export interface Screening {
  detection_date: string;
  detection_id: string;
  MSISDN: string;
  status: string;
  investigator: string;
}

export abstract class ScreeningData {
  abstract data: Screening[];
  abstract getScreenings(): Screening[];
  abstract getScreeningsByStatus(status: string): Screening[];
  abstract getScreeningsByDateRange(start: string, end: string): Screening[];
  abstract getScreeningsByInvestigator(investigator: string): Screening[];
}
