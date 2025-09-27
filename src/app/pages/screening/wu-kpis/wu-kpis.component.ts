import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { ScreeningService } from '../../../@core/mock/screening.service';
import { NbThemeService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface KpiCard {
  title: string;
  value: number;
  status: 'success' | 'warning' | 'danger' | 'info' | 'primary';
  icon: string;
  comparison: {
    value: number;
    isPositive: boolean;
    isPercentage: boolean;
  };
}

@Component({
  selector: 'ngx-wu-kpis',
  templateUrl: './wu-kpis.component.html',
  styleUrls: ['./wu-kpis.component.scss'],
})
export class WuKpisComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dateRange: DateRange;

  kpis: KpiCard[] = [];
  loading = true;
  currentTheme = 'dark';
  private destroy$ = new Subject<void>();

  constructor(
    private screeningService: ScreeningService,
    private themeService: NbThemeService,
  ) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.getJsTheme()
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme.name;
      });

    if (this.dateRange) {
      this.loadKpis();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dateRange && this.dateRange) {
      this.loadKpis();
    }
  }

  loadKpis() {
    this.loading = true;
    const previousPeriod = this.calculatePreviousPeriod(this.dateRange);
    const currentKPIs = this.screeningService.getWUKPIs(this.dateRange.start, this.dateRange.end);
    const previousKPIs = this.screeningService.getWUKPIs(previousPeriod.start, previousPeriod.end);

    this.kpis = [
      {
        title: 'WU beneficiary requests',
        value: currentKPIs.wuBeneficiaryRequests || 0,
        status: 'info',
        icon: 'person-outline',
        comparison: this.calculateComparison(currentKPIs.wuBeneficiaryRequests || 0, previousKPIs.wuBeneficiaryRequests || 0, true, true),
      },
      {
        title: 'Auto Approved (WU)',
        value: currentKPIs.autoApproved || 0,
        status: 'success',
        icon: 'checkmark-square-outline',
        comparison: this.calculateComparison(currentKPIs.autoApproved || 0, previousKPIs.autoApproved || 0, true),
      },
      {
        title: 'Manually Approved (WU)',
        value: currentKPIs.manuallyApproved || 0,
        status: 'success',
        icon: 'checkmark-square-outline',
        comparison: this.calculateComparison(currentKPIs.manuallyApproved || 0, previousKPIs.manuallyApproved || 0, true),
      },
      {
        title: 'Pending requests (WU)',
        value: currentKPIs.pendingRequests || 0,
        status: 'warning',
        icon: 'clock-outline',
        comparison: this.calculateComparison(currentKPIs.pendingRequests || 0, previousKPIs.pendingRequests || 0, false),
      },
      {
        title: 'Pending screening alerts',
        value: currentKPIs.pendingScreeningAlerts || 0,
        status: 'warning',
        icon: 'bell-outline',
        comparison: this.calculateComparison(currentKPIs.pendingScreeningAlerts || 0, previousKPIs.pendingScreeningAlerts || 0, false),
      },
      {
        title: 'Rejected requests (WU)',
        value: currentKPIs.rejectedRequests || 0,
        status: 'danger',
        icon: 'alert-triangle-outline',
        comparison: this.calculateComparison(currentKPIs.rejectedRequests || 0, previousKPIs.rejectedRequests || 0, false),
      },
    ];

    this.loading = false;
  }

  private calculatePreviousPeriod(currentRange: DateRange): DateRange {
    const startDate = new Date(currentRange.start);
    const endDate = new Date(currentRange.end);
    const duration = endDate.getTime() - startDate.getTime();
    
    const previousEndDate = new Date(startDate.getTime() - 1);
    const previousStartDate = new Date(previousEndDate.getTime() - duration);
    
    return {
      start: previousStartDate.toISOString().split('T')[0],
      end: previousEndDate.toISOString().split('T')[0],
    };
  }

  private calculateComparison(current: number, previous: number, isPositive: boolean, isPercentage: boolean = false): { value: number; isPositive: boolean; isPercentage: boolean } {
    if (previous === 0) {
      return { value: current > 0 ? 100 : 0, isPositive: isPositive ? current > 0 : current === 0, isPercentage: true };
    }
    
    const change = ((current - previous) / previous) * 100;
    return { 
      value: Math.abs(change), 
      isPositive: isPositive ? change >= 0 : change <= 0, 
      isPercentage: true 
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
