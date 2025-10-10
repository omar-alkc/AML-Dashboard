import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { GoAmlReportService } from '../../../@core/mock/goaml-report.service';
import { DetectionService } from '../../../@core/mock/detection.service';
import { ScreeningService } from '../../../@core/mock/screening.service';
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
  selector: 'ngx-goaml-kpis',
  templateUrl: './goaml-kpis.component.html',
  styleUrls: ['./goaml-kpis.component.scss'],
})
export class GoamlKpisComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dateRange: DateRange;

  kpis: KpiCard[] = [];
  loading = true;
  currentTheme = 'dark';
  private destroy$ = new Subject<void>();

  constructor(
    private goamlService: GoAmlReportService,
    private detectionService: DetectionService,
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

    // Calculate previous period date range
    const previousPeriod = this.calculatePreviousPeriod(this.dateRange);

    // Calculate current period KPIs
    const currentKPIs = this.calculateKPIsForPeriod(this.dateRange.start, this.dateRange.end);
    
    // Calculate previous period KPIs
    const previousKPIs = this.calculateKPIsForPeriod(previousPeriod.start, previousPeriod.end);

    this.kpis = [
      {
        title: 'Sent SAR Reports',
        value: currentKPIs.sentSAR,
        status: 'success',
        icon: 'paper-plane-outline',
        comparison: this.calculateComparison(currentKPIs.sentSAR, previousKPIs.sentSAR, true, true), // Neutral
      },
      {
        title: 'Pending SAR (Cashout & SAR alerts)',
        value: currentKPIs.pendingSAR,
        status: 'warning',
        icon: 'clock-outline',
        comparison: this.calculateComparison(currentKPIs.pendingSAR, previousKPIs.pendingSAR, false), // Lower is better
      },
      {
        title: 'Sent STR Reports',
        value: currentKPIs.sentSTR,
        status: 'success',
        icon: 'checkmark-square-outline',
        comparison: this.calculateComparison(currentKPIs.sentSTR, previousKPIs.sentSTR, true, true), // Neutral
      },
      {
        title: 'Sent CTR Reports',
        value: currentKPIs.sentCTR,
        status: 'info',
        icon: 'file-text-outline',
        comparison: this.calculateComparison(currentKPIs.sentCTR, previousKPIs.sentCTR, true, true), // Neutral
      },
      {
        title: 'Rejected Wallets (on-boarding & periodic screening)',
        value: currentKPIs.rejectedWallets,
        status: 'danger',
        icon: 'alert-triangle-outline',
        comparison: this.calculateComparison(currentKPIs.rejectedWallets, previousKPIs.rejectedWallets, false), // Lower is better
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

  private calculateKPIsForPeriod(start: string, end: string): any {
    // Get counts from goAML service
    const sentSAR = this.goamlService.getSentSARCount(start, end);
    const sentSTR = this.goamlService.getSentSTRCount(start, end);
    const sentCTR = this.goamlService.getSentCTRCount(start, end);

    // Get pending SAR from detection service (Cashout & SAR alerts)
    const pendingSAR = this.detectionService.getPendingSARCount();

    // Get rejected wallets from screening service
    const onboardingKPIs = this.screeningService.getOnboardingKPIs(start, end);
    const periodicKPIs = this.screeningService.getPeriodicKPIs(start, end);
    const rejectedWallets = (onboardingKPIs.rejectedWallets || 0) + (periodicKPIs.rejectedWallets || 0);

    return {
      sentSAR,
      pendingSAR,
      sentSTR,
      sentCTR,
      rejectedWallets,
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

