import { Component, OnInit, OnDestroy } from '@angular/core';
import { DateRangeService, DateRange } from '../../@core/utils/date-range.service';
import { CacheService } from '../../@core/utils/cache.service';
import { Subscription } from 'rxjs';
import { NbDialogService } from '@nebular/theme';
import { PageInfoModalComponent } from '../../@core/components/page-info-modal/page-info-modal.component';
import { PageInfoService } from '../../@core/data/page-info.service';

@Component({
  selector: 'ngx-sc-portal',
  templateUrl: './sc-portal.component.html',
  styleUrls: ['./sc-portal.component.scss'],
})
export class ScPortalComponent implements OnInit, OnDestroy {
  loading = false;
  dateRange: DateRange;
  lastRefresh: string;
  
  // Time period toggles
  formsTrendPeriod: 'day' | 'week' | 'month' = 'week';
  responseTimePeriod: 'day' | 'week' | 'month' = 'week';
  statusChangePeriod: 'day' | 'week' | 'month' = 'week';
  investigatorResponseTimePeriod: 'day' | 'week' | 'month' = 'week';
  
  // Form type toggles for charts
  statusDistributionFormType: 'PEPs' | 'WU_Beneficiary' | 'Suspicious_Activity' = 'PEPs';
  statusTimelineFormType: 'PEPs' | 'WU_Beneficiary' | 'Suspicious_Activity' = 'PEPs';
  
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

  // Toggle methods
  setFormsTrendPeriod(period: 'day' | 'week' | 'month') {
    this.formsTrendPeriod = period;
  }

  setResponseTimePeriod(period: 'day' | 'week' | 'month') {
    this.responseTimePeriod = period;
  }

  setStatusChangePeriod(period: 'day' | 'week' | 'month') {
    this.statusChangePeriod = period;
  }

  setStatusDistributionFormType(type: 'PEPs' | 'WU_Beneficiary' | 'Suspicious_Activity') {
    this.statusDistributionFormType = type;
  }

  setStatusTimelineFormType(type: 'PEPs' | 'WU_Beneficiary' | 'Suspicious_Activity') {
    this.statusTimelineFormType = type;
  }

  setInvestigatorResponseTimePeriod(period: 'day' | 'week' | 'month') {
    this.investigatorResponseTimePeriod = period;
  }

  openPageInfo() {
    const pageInfo = this.pageInfoService.getPageInfo('sc-portal');
    const dialogRef = this.dialogService.open(PageInfoModalComponent, {
      hasBackdrop: true,
      closeOnBackdropClick: true,
      closeOnEsc: true,
    });
    // Pass data to the component
    dialogRef.componentRef?.instance.setData(pageInfo);
  }
}
