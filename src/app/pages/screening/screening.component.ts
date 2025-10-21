import { Component, OnInit, OnDestroy } from '@angular/core';
import { DateRangeService, DateRange } from '../../@core/utils/date-range.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NbDialogService } from '@nebular/theme';
import { PageInfoModalComponent } from '../../@core/components/page-info-modal/page-info-modal.component';
import { PageInfoService } from '../../@core/data/page-info.service';

@Component({
  selector: 'ngx-screening',
  templateUrl: './screening.component.html',
  styleUrls: ['./screening.component.scss'],
})
export class ScreeningComponent implements OnInit, OnDestroy {
  dateRange: DateRange;
  lastRefresh: Date;
  onboardingTimePeriod: 'day' | 'week' | 'month' = 'week';
  periodicTimePeriod: 'day' | 'week' | 'month' = 'week';
  wuTimePeriod: 'day' | 'week' | 'month' = 'week';
  
  private destroy$ = new Subject<void>();

  constructor(
    private dateRangeService: DateRangeService,
    private dialogService: NbDialogService,
    private pageInfoService: PageInfoService,
  ) {}

  ngOnInit() {
    this.dateRangeService.dateRange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((range) => {
        console.log('Screening component received date range:', range);
        this.dateRange = range;
      });
    
    this.lastRefresh = new Date();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRefreshClicked() {
    this.lastRefresh = new Date();
    // Trigger data refresh for all child components
    // This will be handled by the individual components listening to dateRange changes
  }

  setOnboardingTimePeriod(period: 'day' | 'week' | 'month') {
    this.onboardingTimePeriod = period;
  }

  setPeriodicTimePeriod(period: 'day' | 'week' | 'month') {
    this.periodicTimePeriod = period;
  }

  setWUTimePeriod(period: 'day' | 'week' | 'month') {
    this.wuTimePeriod = period;
  }

  openPageInfo() {
    const pageInfo = this.pageInfoService.getPageInfo('screening');
    const dialogRef = this.dialogService.open(PageInfoModalComponent, {
      hasBackdrop: true,
      closeOnBackdropClick: true,
      closeOnEsc: true,
    });
    // Pass data to the component
    dialogRef.componentRef?.instance.setData(pageInfo);
  }
}