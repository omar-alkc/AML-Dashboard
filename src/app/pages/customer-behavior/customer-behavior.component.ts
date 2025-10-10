import { Component, OnInit, OnDestroy } from '@angular/core';
import { DateRangeService, DateRange } from '../../@core/utils/date-range.service';
import { CacheService } from '../../@core/utils/cache.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-customer-behavior',
  templateUrl: './customer-behavior.component.html',
  styleUrls: ['./customer-behavior.component.scss'],
})
export class CustomerBehaviorComponent implements OnInit, OnDestroy {
  loading = false;
  dateRange: DateRange;
  lastRefresh: string;
  private subscriptions: Subscription[] = [];

  constructor(
    private dateRangeService: DateRangeService,
    private cacheService: CacheService,
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
}

