import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { CustomerBehaviorService } from '../../../@core/mock/customer-behavior.service';
import { BehaviorFilters } from '../../../@core/data/customer-behavior';
import { NbThemeService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface KpiCard {
  title: string;
  value: number;
  status: 'success' | 'warning' | 'danger' | 'info' | 'primary';
  icon: string;
  comparison?: {
    absoluteChange: number;
    percentageChange: number;
    isPositive: boolean;
    isNeutral: boolean;
  };
}

@Component({
  selector: 'ngx-behavior-kpis',
  templateUrl: './behavior-kpis.component.html',
  styleUrls: ['./behavior-kpis.component.scss'],
})
export class BehaviorKpisComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dateRange: DateRange;

  totalKpis: KpiCard[] = [];
  averageKpis: KpiCard[] = [];
  maxKpis: KpiCard[] = [];
  loading = true;
  currentTheme = 'dark';
  private destroy$ = new Subject<void>();

  constructor(
    private behaviorService: CustomerBehaviorService,
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

    // Calculate previous period date range
    const previousPeriod = this.calculatePreviousPeriod(this.dateRange);

    // Create filters for current and previous periods
    const currentFilters: BehaviorFilters = {
      walletType: 'All',
      transactionType: 'All',
      startDate: this.dateRange.start,
      endDate: this.dateRange.end,
    };

    const previousFilters: BehaviorFilters = {
      walletType: 'All',
      transactionType: 'All',
      startDate: previousPeriod.start,
      endDate: previousPeriod.end,
    };

    // Calculate current period KPIs
    const currentKPIs = this.behaviorService.getKPIs(currentFilters);
    
    // Calculate previous period KPIs
    const previousKPIs = this.behaviorService.getKPIs(previousFilters);

    // Total KPIs (Row 1)
    this.totalKpis = [
      {
        title: 'Total Transaction Amount',
        value: currentKPIs.totalTransactionAmount,
        status: 'primary',
        icon: 'trending-up-outline',
        comparison: this.calculateComparison(currentKPIs.totalTransactionAmount, previousKPIs.totalTransactionAmount, true, true),
      },
      {
        title: 'Total Transaction Count',
        value: currentKPIs.totalTransactionCount,
        status: 'info',
        icon: 'hash-outline',
        comparison: this.calculateComparison(currentKPIs.totalTransactionCount, previousKPIs.totalTransactionCount, true, true),
      },
    ];

    // Average KPIs (Row 2)
    this.averageKpis = [
      {
        title: 'Avg. Transaction Amount',
        value: currentKPIs.avgTransactionAmount,
        status: 'success',
        icon: 'bar-chart-outline',
        comparison: this.calculateComparison(currentKPIs.avgTransactionAmount, previousKPIs.avgTransactionAmount, true, true),
      },
      {
        title: 'Avg. Transaction Count',
        value: currentKPIs.avgTransactionCount,
        status: 'warning',
        icon: 'activity-outline',
        comparison: this.calculateComparison(currentKPIs.avgTransactionCount, previousKPIs.avgTransactionCount, true, true),
      },
    ];

    // Max KPIs (Row 3)
    this.maxKpis = [
      {
        title: 'Max Transaction Amount',
        value: currentKPIs.maxTransactionAmount,
        status: 'danger',
        icon: 'arrow-up-outline',
        comparison: this.calculateComparison(currentKPIs.maxTransactionAmount, previousKPIs.maxTransactionAmount, true, true),
      },
      {
        title: 'Max Transaction Count',
        value: currentKPIs.maxTransactionCount,
        status: 'warning',
        icon: 'maximize-outline',
        comparison: this.calculateComparison(currentKPIs.maxTransactionCount, previousKPIs.maxTransactionCount, true, true),
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

  private calculateComparison(current: number, previous: number, higherIsBetter: boolean, isNeutral: boolean = false): any {
    const absoluteChange = current - previous;
    const percentageChange = previous === 0 ? (current > 0 ? 100 : 0) : Math.round((absoluteChange / previous) * 100);
    
    let isPositive: boolean;
    if (isNeutral) {
      isPositive = true; // Neutral items don't use color coding
    } else {
      isPositive = higherIsBetter ? absoluteChange >= 0 : absoluteChange <= 0;
    }

    return {
      absoluteChange,
      percentageChange,
      isPositive,
      isNeutral,
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

