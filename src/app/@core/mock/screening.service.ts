import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { Screening, ScreeningData, ScreeningKPI, ScreeningMetrics, InvestigatorPerformance } from '../data/screening';

@Injectable()
export class ScreeningService implements ScreeningData {
  data: Screening[] = [];

  constructor(private http: HttpClient) {
    this.loadScreenings();
  }

  private loadScreenings() {
    this.http.get<Screening[]>('assets/mock-data/screening.json')
      .subscribe((screenings) => {
        console.log('Screening service loaded data:', screenings);
        this.data = screenings;
      }, (error) => {
        console.error('Error loading screening data:', error);
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

  getScreeningsByType(type: 'onboarding' | 'periodic' | 'wu_beneficiary'): Screening[] {
    return this.data.filter((screening) => screening.screening_type === type);
  }

  // KPI Calculation Methods
  getOnboardingKPIs(start: string, end: string): ScreeningKPI {
    const onboardingData = this.getScreeningsByType('onboarding');
    const filteredData = onboardingData.filter(s => {
      const date = new Date(s.detection_date);
      return date >= new Date(start) && date <= new Date(end);
    });

    console.log('getOnboardingKPIs called with:', start, 'to', end);
    console.log('Filtered data count:', filteredData.length);

    return {
      walletsCreated: filteredData.length,
      alertsCreated: filteredData.filter(s => s.alert_creation_date).length,
      autoReleased: filteredData.filter(s => s.auto_processed_date).length,
      manualReleased: filteredData.filter(s => s.manual_processed_date).length,
      pendingSeniorReview: filteredData.filter(s => s.status === 'Pending Senior Review').length,
      rejectedWallets: filteredData.filter(s => s.status === 'Rejected').length,
    };
  }

  getPeriodicKPIs(start: string, end: string): ScreeningKPI {
    const periodicData = this.getScreeningsByType('periodic');
    const filteredData = periodicData.filter(s => {
      const date = new Date(s.detection_date);
      return date >= new Date(start) && date <= new Date(end);
    });

    return {
      walletsScanned: filteredData.length,
      periodicAlertsCreated: filteredData.filter(s => s.alert_creation_date).length,
      autoReleased: filteredData.filter(s => s.auto_processed_date).length,
      manualReleased: filteredData.filter(s => s.manual_processed_date).length,
      pendingAlerts: filteredData.filter(s => s.status === 'Pending').length,
      rejectedWallets: filteredData.filter(s => s.status === 'Rejected').length,
    };
  }

  getWUKPIs(start: string, end: string): ScreeningKPI {
    const wuData = this.getScreeningsByType('wu_beneficiary');
    const filteredData = wuData.filter(s => {
      const date = new Date(s.detection_date);
      return date >= new Date(start) && date <= new Date(end);
    });

    return {
      wuBeneficiaryRequests: filteredData.length,
      autoApproved: filteredData.filter(s => s.auto_processed_date).length,
      manuallyApproved: filteredData.filter(s => s.manual_processed_date).length,
      pendingRequests: filteredData.filter(s => s.status === 'Pending').length,
      pendingScreeningAlerts: filteredData.filter(s => s.alert_creation_date && s.status === 'Pending').length,
      rejectedRequests: filteredData.filter(s => s.status === 'Rejected').length,
    };
  }

  // Time Series Methods
  getOnboardingTimeSeries(start: string, end: string, period: 'day'|'week'|'month'): ScreeningMetrics[] {
    console.log('getOnboardingTimeSeries called with:', start, end, period);
    console.log('Total data available:', this.data.length);
    
    const onboardingData = this.getScreeningsByType('onboarding');
    console.log('Onboarding data count:', onboardingData.length);
    
    const filteredData = onboardingData.filter(s => {
      const date = new Date(s.detection_date);
      return date >= new Date(start) && date <= new Date(end);
    });

    console.log('Filtered data count:', filteredData.length);
    const result = this.aggregateTimeSeries(filteredData, period, 'onboarding');
    console.log('Aggregated time series result:', result);
    return result;
  }

  getPeriodicTimeSeries(start: string, end: string, period: 'day'|'week'|'month'): ScreeningMetrics[] {
    const periodicData = this.getScreeningsByType('periodic');
    const filteredData = periodicData.filter(s => {
      const date = new Date(s.detection_date);
      return date >= new Date(start) && date <= new Date(end);
    });

    return this.aggregateTimeSeries(filteredData, period, 'periodic');
  }

  getWUTimeSeries(start: string, end: string, period: 'day'|'week'|'month'): ScreeningMetrics[] {
    console.log('getWUTimeSeries called with:', start, end, period);
    const wuData = this.getScreeningsByType('wu_beneficiary');
    console.log('WU data count:', wuData.length);
    
    const filteredData = wuData.filter(s => {
      const date = new Date(s.detection_date);
      return date >= new Date(start) && date <= new Date(end);
    });

    console.log('WU filtered data count:', filteredData.length);
    const result = this.aggregateTimeSeries(filteredData, period, 'wu_beneficiary');
    console.log('WU aggregated time series result:', result);
    return result;
  }

  getInvestigatorPerformance(screeningType: string, start: string, end: string): InvestigatorPerformance[] {
    console.log('getInvestigatorPerformance called with:', screeningType, start, end);
    const typeData = this.getScreeningsByType(screeningType as any);
    console.log('Type data count for', screeningType, ':', typeData.length);
    
    const filteredData = typeData.filter(s => {
      const date = new Date(s.detection_date);
      return date >= new Date(start) && date <= new Date(end);
    });

    console.log('Filtered data count for', screeningType, ':', filteredData.length);

    const investigatorMap = new Map<string, InvestigatorPerformance>();

    filteredData.forEach(screening => {
      if (!investigatorMap.has(screening.investigator)) {
        investigatorMap.set(screening.investigator, {
          investigator: screening.investigator,
          workload: 0,
          processed: 0,
          pending: 0,
          rejected: 0,
        });
      }

      const performance = investigatorMap.get(screening.investigator)!;
      performance.workload++;
      
      if (screening.status === 'Processed' || screening.auto_processed_date || screening.manual_processed_date) {
        performance.processed++;
      } else if (screening.status === 'Pending') {
        performance.pending++;
      } else if (screening.status === 'Rejected') {
        performance.rejected++;
      }
    });

    return Array.from(investigatorMap.values());
  }

  private aggregateTimeSeries(data: Screening[], period: 'day'|'week'|'month', type: string): ScreeningMetrics[] {
    const periodMap = new Map<string, ScreeningMetrics>();

    data.forEach(screening => {
      const date = new Date(screening.detection_date);
      let periodKey: string;

      switch (period) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = `Week ${Math.ceil(weekStart.getDate() / 7)}, ${weekStart.toLocaleString('default', { month: 'short' })}`;
          break;
        case 'month':
          periodKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          break;
      }

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          period: periodKey,
          totalWalletsCreated: 0,
          newDetections: 0,
          falsePositives: 0,
          walletsRejected: 0,
          scannedWallets: 0,
          createdAlerts: 0,
          manuallyProcessedAlerts: 0,
          automaticallyReleasedAlerts: 0,
          scannedRequests: 0,
          rejectedRequests: 0,
          soundexMatches: 0,
        });
      }

      const metrics = periodMap.get(periodKey)!;
      
      if (type === 'onboarding') {
        metrics.totalWalletsCreated++;
        if (screening.alert_creation_date) metrics.newDetections++;
        if (screening.status === 'False Positive') metrics.falsePositives++;
        if (screening.status === 'Rejected') metrics.walletsRejected++;
      } else if (type === 'periodic') {
        metrics.scannedWallets++;
        if (screening.alert_creation_date) metrics.createdAlerts++;
        if (screening.manual_processed_date) metrics.manuallyProcessedAlerts++;
        if (screening.auto_processed_date) metrics.automaticallyReleasedAlerts++;
      } else if (type === 'wu_beneficiary') {
        metrics.scannedRequests++;
        if (screening.alert_creation_date) metrics.createdAlerts++;
        if (screening.manual_processed_date) metrics.manuallyProcessedAlerts++;
        if (screening.auto_processed_date) metrics.automaticallyReleasedAlerts++;
        if (screening.status === 'Rejected') metrics.rejectedRequests++;
        // Add some mock soundex matches (randomly assign to some records)
        if (Math.random() > 0.7) metrics.soundexMatches++;
      }
    });

    return Array.from(periodMap.values()).sort((a, b) => a.period.localeCompare(b.period));
  }

  // Legacy helper methods for backward compatibility
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