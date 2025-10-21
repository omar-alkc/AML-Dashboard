import { Component, OnInit, OnDestroy } from '@angular/core';
import { DateRangeService, DateRange } from '../../@core/utils/date-range.service';
import { CacheService } from '../../@core/utils/cache.service';
import { Subscription } from 'rxjs';
import { NbDialogService } from '@nebular/theme';
import { PageInfoModalComponent } from '../../@core/components/page-info-modal/page-info-modal.component';
import { PageInfoService } from '../../@core/data/page-info.service';

@Component({
  selector: 'ngx-aml-monitoring',
  templateUrl: './aml-monitoring.component.html',
  styleUrls: ['./aml-monitoring.component.scss'],
})
export class AmlMonitoringComponent implements OnInit, OnDestroy {
  loading = false;
  dateRange: DateRange;
  lastRefresh: string;
  cashoutTimePeriod: 'day' | 'week' | 'month' = 'week';
  detectionTimePeriod: 'day' | 'week' | 'month' = 'week';
  private subscriptions: Subscription[] = [];

  constructor(
    private dateRangeService: DateRangeService,
    private cacheService: CacheService,
    private dialogService: NbDialogService,
    private pageInfoService: PageInfoService,
  ) {}

  ngOnInit() {
    // Subscribe to date range changes
    this.subscriptions.push(
      this.dateRangeService.dateRange$.subscribe((range) => {
        this.dateRange = range;
        this.refreshData();
      }),
    );

    // Subscribe to cache refresh updates
    this.subscriptions.push(
      this.cacheService.lastRefreshTimestamp$.subscribe((timestamp) => {
        this.lastRefresh = timestamp;
      }),
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  refreshData() {
    // This will be triggered when date range changes
    // Components will handle their own data fetching
  }

  onRefreshClicked() {
    this.loading = true;
    this.cacheService.refreshCache().subscribe(() => {
      this.loading = false;
    });
  }

  setCashoutTimePeriod(period: 'day' | 'week' | 'month') {
    this.cashoutTimePeriod = period;
  }

  setDetectionTimePeriod(period: 'day' | 'week' | 'month') {
    this.detectionTimePeriod = period;
  }

  openPageInfo() {
    const pageInfo = this.pageInfoService.getPageInfo('aml-monitoring');
    const dialogRef = this.dialogService.open(PageInfoModalComponent, {
      hasBackdrop: true,
      closeOnBackdropClick: true,
      closeOnEsc: true,
    });
    // Pass data to the component
    dialogRef.componentRef?.instance.setData(pageInfo);
  }
}
