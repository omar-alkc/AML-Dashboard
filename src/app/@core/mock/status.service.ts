import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { Status, StatusData, StatusGroup } from '../data/status';

export { StatusGroup };

@Injectable()
export class StatusService implements StatusData {
  data: Status[] = [];

  constructor(private http: HttpClient) {
    this.loadStatuses();
  }

  private loadStatuses() {
    this.http.get<Status[]>('assets/mock-data/statuses.json')
      .subscribe((statuses) => {
        this.data = statuses;
      });
  }

  getStatuses(): Status[] {
    return this.data;
  }

  getStatusGroups(): { group: string; statuses: Status[] }[] {
    // Implementation of status grouping according to PRD rules
    const groupMappings = [
      {
        group: StatusGroup.WAITING_FOR_EVIDENCE,
        matcher: (status: string) => status.includes('Waiting for Evidence'),
      },
      {
        group: StatusGroup.SUSPICIOUS_INITIAL,
        matcher: (status: string) => status.includes('Suspicious Initial'),
      },
      {
        group: StatusGroup.FALSE_POSITIVE_INITIAL,
        matcher: (status: string) => status.includes('False Positive Initial'),
      },
      {
        group: StatusGroup.UNDER_INVESTIGATION,
        matcher: (status: string) => status.includes('Under Investigation'),
      },
      {
        group: StatusGroup.NEW,
        matcher: (status: string) => status === 'New',
      },
      {
        group: StatusGroup.DELAYED,
        matcher: (status: string) => status === 'Delayed',
      },
      {
        group: StatusGroup.SUSPICIOUS_FINAL,
        matcher: (status: string) => status === 'Suspicious Final',
      },
      {
        group: StatusGroup.FALSE_POSITIVE_FINAL,
        matcher: (status: string) => status === 'False Positive Final',
      },
      {
        group: StatusGroup.SENT_SAR,
        matcher: (status: string) => status === 'Sent SAR',
      },
    ];

    // Filter out Test and Unknown statuses
    const filteredStatuses = this.data.filter(status => 
      status.name !== 'Test' && status.name !== 'Unknown'
    );

    // Group statuses
    const groups = groupMappings.map(groupMapping => {
      return {
        group: groupMapping.group,
        statuses: filteredStatuses.filter(status => groupMapping.matcher(status.name)),
      };
    });

    // Remove empty groups
    return groups.filter(group => group.statuses.length > 0);
  }

  getStatusByName(name: string): Status {
    return this.data.find((status) => status.name === name);
  }

  getStatusGroupForStatus(status: string): StatusGroup {
    // Determine which group a status belongs to
    if (status.includes('Waiting for Evidence')) {
      return StatusGroup.WAITING_FOR_EVIDENCE;
    } else if (status.includes('Suspicious Initial')) {
      return StatusGroup.SUSPICIOUS_INITIAL;
    } else if (status.includes('False Positive Initial')) {
      return StatusGroup.FALSE_POSITIVE_INITIAL;
    } else if (status.includes('Under Investigation')) {
      return StatusGroup.UNDER_INVESTIGATION;
    } else if (status === 'New') {
      return StatusGroup.NEW;
    } else if (status === 'Delayed') {
      return StatusGroup.DELAYED;
    } else if (status === 'Suspicious Final') {
      return StatusGroup.SUSPICIOUS_FINAL;
    } else if (status === 'False Positive Final') {
      return StatusGroup.FALSE_POSITIVE_FINAL;
    } else if (status === 'Sent SAR') {
      return StatusGroup.SENT_SAR;
    }
    
    // Default fallback
    return null;
  }
}
