export interface Detection {
  id: number;
  scenario_name: string;
  status: string;
  detection_date: string;
  status_change_date: string | null;
  modified_by: string | null;
}

export abstract class DetectionsData {
  abstract data: Detection[];
  abstract getDetections(): Detection[];
  abstract getDetectionsByScenario(scenario: string): Detection[];
  abstract getDetectionsByStatus(status: string): Detection[];
  abstract getDetectionsByDateRange(start: string, end: string): Detection[];
  abstract getDetectionsByInvestigator(investigator: string): Detection[];
}
