export interface Status {
  code: number;
  name: string;
}

export enum StatusGroup {
  NEW = 'New',
  DELAYED = 'Delayed',
  SUSPICIOUS_INITIAL = 'Suspicious Initial',
  FALSE_POSITIVE_INITIAL = 'False Positive Initial',
  WAITING_FOR_EVIDENCE = 'Waiting for Evidence',
  SUSPICIOUS_FINAL = 'Suspicious Final',
  FALSE_POSITIVE_FINAL = 'False Positive Final',
  SENT_SAR = 'Sent SAR',
  UNDER_INVESTIGATION = 'Under Investigation',
}

export abstract class StatusData {
  abstract data: Status[];
  abstract getStatuses(): Status[];
  abstract getStatusGroups(): { group: string; statuses: Status[] }[];
  abstract getStatusByName(name: string): Status;
  abstract getStatusGroupForStatus(status: string): StatusGroup;
}
