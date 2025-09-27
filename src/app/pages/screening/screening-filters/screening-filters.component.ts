import { Component, OnInit } from '@angular/core';
import { DateRangeService, DateRange } from '../../../@core/utils/date-range.service';
import { NbDateService } from '@nebular/theme';

@Component({
  selector: 'ngx-screening-filters',
  templateUrl: './screening-filters.component.html',
  styleUrls: ['./screening-filters.component.scss'],
})
export class ScreeningFiltersComponent implements OnInit {
  dateRange: DateRange;
  startDate: Date;
  endDate: Date;
  
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
    console.log('Setting preset range:', preset);
    this.dateRangeService.setPresetRange(preset);
  }
}
