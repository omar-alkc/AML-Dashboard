import { Component, OnInit } from '@angular/core';
import { DateRangeService, DateRange } from '../../../@core/utils/date-range.service';
import { NbDateService } from '@nebular/theme';

@Component({
  selector: 'ngx-goaml-filters',
  templateUrl: './goaml-filters.component.html',
  styleUrls: ['./goaml-filters.component.scss'],
})
export class GoamlFiltersComponent implements OnInit {
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
    this.dateRangeService.setPresetRange(preset);
  }
}

