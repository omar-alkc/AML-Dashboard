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

  creditKpis: KpiCard[] = [];
  debitKpis: KpiCard[] = [];
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

    // Credit KPIs (Row 1)
    this.creditKpis = [
      {
        title: 'Avg. Credit Amount',
        value: currentKPIs.avgCreditAmount,
        status: 'success',
        icon: 'trending-up-outline',
        comparison: this.calculateComparison(currentKPIs.avgCreditAmount, previousKPIs.avgCreditAmount, true, true),
      },
      {
        title: 'Avg. Credit Count',
        value: currentKPIs.avgCreditCount,
        status: 'info',
        icon: 'hash-outline',
        comparison: this.calculateComparison(currentKPIs.avgCreditCount, previousKPIs.avgCreditCount, true, true),
      },
      {
        title: 'Max Credit Amount',
        value: currentKPIs.maxCreditAmount,
        status: 'primary',
        icon: 'arrow-up-outline',
        comparison: this.calculateComparison(currentKPIs.maxCreditAmount, previousKPIs.maxCreditAmount, true, true),
      },
    ];

    // Debit KPIs (Row 2)
    this.debitKpis = [
      {
        title: 'Avg. Debit Amount',
        value: currentKPIs.avgDebitAmount,
        status: 'warning',
        icon: 'trending-down-outline',
        comparison: this.calculateComparison(currentKPIs.avgDebitAmount, previousKPIs.avgDebitAmount, true, true),
      },
      {
        title: 'Avg. Debit Count',
        value: currentKPIs.avgDebitCount,
        status: 'info',
        icon: 'hash-outline',
        comparison: this.calculateComparison(currentKPIs.avgDebitCount, previousKPIs.avgDebitCount, true, true),
      },
      {
        title: 'Max Debit Amount',
        value: currentKPIs.maxDebitAmount,
        status: 'danger',
        icon: 'arrow-down-outline',
        comparison: this.calculateComparison(currentKPIs.maxDebitAmount, previousKPIs.maxDebitAmount, true, true),
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

