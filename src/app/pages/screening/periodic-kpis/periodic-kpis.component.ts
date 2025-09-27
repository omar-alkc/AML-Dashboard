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
  selector: 'ngx-periodic-kpis',
  templateUrl: './periodic-kpis.component.html',
  styleUrls: ['./periodic-kpis.component.scss'],
})
export class PeriodicKpisComponent implements OnInit, OnChanges, OnDestroy {
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
    const currentKPIs = this.screeningService.getPeriodicKPIs(this.dateRange.start, this.dateRange.end);
    const previousKPIs = this.screeningService.getPeriodicKPIs(previousPeriod.start, previousPeriod.end);

    this.kpis = [
      {
        title: 'Wallets scanned (Periodic)',
        value: currentKPIs.walletsScanned || 0,
        status: 'info',
        icon: 'person-outline',
        comparison: this.calculateComparison(currentKPIs.walletsScanned || 0, previousKPIs.walletsScanned || 0, true, true),
      },
      {
        title: 'Periodic Alerts Created',
        value: currentKPIs.periodicAlertsCreated || 0,
        status: 'primary',
        icon: 'bell-outline',
        comparison: this.calculateComparison(currentKPIs.periodicAlertsCreated || 0, previousKPIs.periodicAlertsCreated || 0, false),
      },
      {
        title: 'Automatically released',
        value: currentKPIs.autoReleased || 0,
        status: 'success',
        icon: 'checkmark-square-outline',
        comparison: this.calculateComparison(currentKPIs.autoReleased || 0, previousKPIs.autoReleased || 0, true),
      },
      {
        title: 'Manually released',
        value: currentKPIs.manualReleased || 0,
        status: 'success',
        icon: 'checkmark-square-outline',
        comparison: this.calculateComparison(currentKPIs.manualReleased || 0, previousKPIs.manualReleased || 0, true),
      },
      {
        title: 'Pending Alerts',
        value: currentKPIs.pendingAlerts || 0,
        status: 'warning',
        icon: 'clock-outline',
        comparison: this.calculateComparison(currentKPIs.pendingAlerts || 0, previousKPIs.pendingAlerts || 0, false),
      },
      {
        title: 'Rejected wallets (on-boarding)',
        value: currentKPIs.rejectedWallets || 0,
        status: 'danger',
        icon: 'alert-triangle-outline',
        comparison: this.calculateComparison(currentKPIs.rejectedWallets || 0, previousKPIs.rejectedWallets || 0, false),
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
