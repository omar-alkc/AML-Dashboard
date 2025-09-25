import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DateRange {
  start: string;
  end: string;
}

@Injectable()
export class DateRangeService {
  // Default date range is the current month
  private defaultRange(): DateRange {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }

  private dateRangeSubject = new BehaviorSubject<DateRange>(this.defaultRange());
  public dateRange$ = this.dateRangeSubject.asObservable();

  constructor() {}

  /**
   * Set a new date range
   */
  setDateRange(range: DateRange): void {
    if (this.isValidRange(range)) {
      this.dateRangeSubject.next(range);
    } else {
      console.error('Invalid date range provided');
    }
  }

  /**
   * Get the current date range
   */
  getCurrentDateRange(): DateRange {
    return this.dateRangeSubject.getValue();
  }

  /**
   * Check if a date range is valid
   */
  isValidRange(range: DateRange): boolean {
    if (!range.start || !range.end) {
      return false;
    }
    
    const start = new Date(range.start);
    const end = new Date(range.end);
    
    return start <= end && !isNaN(start.getTime()) && !isNaN(end.getTime());
  }

  /**
   * Set a preset date range
   */
  setPresetRange(preset: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter'): void {
    const now = new Date();
    let start: Date;
    let end: Date;
    
    switch (preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case 'thisWeek':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'lastWeek':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 1);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisQuarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = now;
        break;
      case 'lastQuarter':
        const lastQuarter = Math.floor((now.getMonth() - 3) / 3);
        const year = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const adjustedQuarter = lastQuarter < 0 ? 3 + lastQuarter : lastQuarter;
        start = new Date(year, adjustedQuarter * 3, 1);
        end = new Date(year, (adjustedQuarter + 1) * 3, 0);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
    }
    
    this.setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
  }
}
