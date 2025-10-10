import { Component, OnInit } from '@angular/core';
import { DateRangeService, DateRange } from '../../../@core/utils/date-range.service';
import { NbDateService } from '@nebular/theme';

@Component({
  selector: 'ngx-behavior-filters',
  templateUrl: './behavior-filters.component.html',
  styleUrls: ['./behavior-filters.component.scss'],
})
export class BehaviorFiltersComponent implements OnInit {
  dateRange: DateRange;
  startDate: Date;
  endDate: Date;

  walletTypes = [
    { value: 'All', label: 'All Wallet Types' },
    { value: 'Individual Permanent', label: 'Individual Permanent' },
    { value: 'Business', label: 'Business' },
    { value: 'Agent', label: 'Agent' },
    { value: 'Merchant', label: 'Merchant' },
    { value: 'Corporate', label: 'Corporate' },
  ];

  transactionTypes = [
    { value: 'All', label: 'All Transaction Types' },
    { value: 'Domestic Transfer', label: 'Domestic Transfer' },
    { value: 'Western Union Transfer', label: 'Western Union Transfer' },
    { value: 'Cash In', label: 'Cash In' },
    { value: 'Cash Out', label: 'Cash Out' },
    { value: 'Merchant Payment', label: 'Merchant Payment' },
    { value: 'Merchant Payment Gateway', label: 'Merchant Payment Gateway' },
    { value: 'E-goods', label: 'E-goods' },
  ];

  selectedWalletType = 'All';
  selectedTransactionType = 'All';

  constructor(
    private dateRangeService: DateRangeService,
    protected dateService: NbDateService<Date>,
  ) {}

  ngOnInit() {
    this.dateRangeService.dateRange$.subscribe((range) => {
      this.dateRange = range;
      this.startDate = new Date(range.start);
      this.endDate = new Date(range.end);
    });
  }

  onDateRangeChange() {
    if (this.startDate && this.endDate) {
      const range: DateRange = {
        start: this.startDate.toISOString().split('T')[0],
        end: this.endDate.toISOString().split('T')[0],
      };
      this.dateRangeService.setDateRange(range);
    }
  }

  setPresetRange(preset: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter') {
    this.dateRangeService.setPresetRange(preset);
  }

  onWalletTypeChange() {
    // Filter changes will be handled by child components listening to this change
    // You could emit an event here if needed
  }

  onTransactionTypeChange() {
    // Filter changes will be handled by child components listening to this change
    // You could emit an event here if needed
  }
}

