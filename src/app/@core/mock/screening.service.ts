import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { Screening, ScreeningData } from '../data/screening';

@Injectable()
export class ScreeningService implements ScreeningData {
  data: Screening[] = [];

  constructor(private http: HttpClient) {
    this.loadScreenings();
  }

  private loadScreenings() {
    this.http.get<Screening[]>('assets/mock-data/screening.json')
      .subscribe((screenings) => {
        this.data = screenings;
      });
  }

  getScreenings(): Screening[] {
    return this.data;
  }

  getScreeningsByStatus(status: string): Screening[] {
    return this.data.filter((screening) => screening.status === status);
  }

  getScreeningsByDateRange(start: string, end: string): Screening[] {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return this.data.filter((screening) => {
      const screeningDate = new Date(screening.detection_date);
      return screeningDate >= startDate && screeningDate <= endDate;
    });
  }

  getScreeningsByInvestigator(investigator: string): Screening[] {
    return this.data.filter((screening) => screening.investigator === investigator);
  }

  // Additional helper methods for KPIs
  getScreeningsCount(start: string, end: string): number {
    return this.getScreeningsByDateRange(start, end).length;
  }

  getPotentialMatchesCount(start: string, end: string): number {
    const filtered = this.getScreeningsByDateRange(start, end);
    return filtered.filter(s => s.status === 'Pending').length;
  }

  getConfirmedMatchesCount(start: string, end: string): number {
    const filtered = this.getScreeningsByDateRange(start, end);
    return filtered.filter(s => s.status === 'Rejected').length;
  }
}
