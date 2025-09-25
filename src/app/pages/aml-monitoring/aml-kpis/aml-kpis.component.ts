import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { DetectionService } from '../../../@core/mock/detection.service';
import { WalletService } from '../../../@core/mock/wallet.service';
import { NbThemeService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface KpiCard {
  title: string;
  value: number;
  status: string;
  icon: string;
  comparison?: {
    absoluteChange: number;
    percentageChange: number;
    isPositive: boolean;
    isNeutral: boolean;
  };
}

@Component({
  selector: 'ngx-aml-kpis',
  templateUrl: './aml-kpis.component.html',
  styleUrls: ['./aml-kpis.component.scss'],
})
export class AmlKpisComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dateRange: DateRange;

  kpis: KpiCard[] = [];
  loading = true;
  currentTheme = 'dark';
  private destroy$ = new Subject<void>();

  constructor(
    private detectionService: DetectionService,
    private walletService: WalletService,
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
        title: 'Alerts Created',
        value: currentKPIs.alertsCreated,
        status: 'primary',
        icon: 'bell-outline',
        comparison: this.calculateComparison(currentKPIs.alertsCreated, previousKPIs.alertsCreated, false), // Higher is worse
      },
      {
        title: 'Processed Alerts',
        value: currentKPIs.processedAlerts,
        status: 'success',
        icon: 'checkmark-square-outline',
        comparison: this.calculateComparison(currentKPIs.processedAlerts, previousKPIs.processedAlerts, true), // Higher is better
      },
      {
        title: 'Pending Alerts',
        value: currentKPIs.pendingCount,
        status: 'warning',
        icon: 'clock-outline',
        comparison: this.calculateComparison(currentKPIs.pendingCount, previousKPIs.pendingCount, false), // Higher is worse
      },
      {
        title: 'Delayed Alerts',
        value: currentKPIs.delayedCount,
        status: 'danger',
        icon: 'alert-triangle-outline',
        comparison: this.calculateComparison(currentKPIs.delayedCount, previousKPIs.delayedCount, false), // Higher is worse
      },
      {
        title: 'Pending Senior Review (Suspicious & False positive initial)',
        value: currentKPIs.pendingSeniorReview,
        status: 'info',
        icon: 'eye-outline',
        comparison: this.calculateComparison(currentKPIs.pendingSeniorReview, previousKPIs.pendingSeniorReview, false), // Higher is worse
      },
      {
        title: 'Waiting for Evidence',
        value: currentKPIs.waitingForEvidence,
        status: 'warning',
        icon: 'folder-outline',
        comparison: this.calculateComparison(currentKPIs.waitingForEvidence, previousKPIs.waitingForEvidence, false), // Higher is worse
      },
      {
        title: 'SAR Sent',
        value: currentKPIs.sarSent,
        status: 'success',
        icon: 'paper-plane-outline',
        comparison: this.calculateComparison(currentKPIs.sarSent, previousKPIs.sarSent, true, true), // Neutral
      },
      {
        title: 'Suspicious Final',
        value: currentKPIs.suspiciousFinal,
        status: 'danger',
        icon: 'alert-circle-outline',
        comparison: this.calculateComparison(currentKPIs.suspiciousFinal, previousKPIs.suspiciousFinal, false), // Higher is worse
      },
      {
        title: 'False Positive Final',
        value: currentKPIs.falsePositiveFinal,
        status: 'success',
        icon: 'checkmark-circle-outline',
        comparison: this.calculateComparison(currentKPIs.falsePositiveFinal, previousKPIs.falsePositiveFinal, false), // Higher is worse
      },
      {
        title: 'Newly Created Wallets',
        value: currentKPIs.walletsCreated,
        status: 'info',
        icon: 'person-outline',
        comparison: this.calculateComparison(currentKPIs.walletsCreated, previousKPIs.walletsCreated, true, true), // Neutral
      },
    ];

    this.loading = false;
  }

  private calculatePreviousPeriod(currentRange: DateRange): DateRange {
    const startDate = new Date(currentRange.start);
    const endDate = new Date(currentRange.end);
    const duration = endDate.getTime() - startDate.getTime();
    
    const previousEndDate = new Date(startDate);
    const previousStartDate = new Date(previousEndDate.getTime() - duration);
    
    return {
      start: previousStartDate.toISOString().split('T')[0],
      end: previousEndDate.toISOString().split('T')[0],
    };
  }

  private calculateKPIsForPeriod(start: string, end: string): any {
    return {
      alertsCreated: this.detectionService.getAlertCount(start, end),
      processedAlerts: this.detectionService.getProcessedAlertsCount(start, end),
      pendingCount: this.detectionService.getPendingCount(),
      delayedCount: this.detectionService.getDelayedCount(),
      pendingSeniorReview: this.detectionService.getSuspiciousInitialCount() + this.detectionService.getFalsePositiveInitialCount(),
      waitingForEvidence: this.detectionService.getWaitingForEvidenceCount(),
      sarSent: this.detectionService.getSentSARCount(start, end),
      suspiciousFinal: this.detectionService.getSuspiciousFinalCount(start, end),
      falsePositiveFinal: this.detectionService.getFalsePositiveFinalCount(start, end),
      walletsCreated: this.walletService.getWalletCount(start, end),
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
