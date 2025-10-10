import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { CustomerBehaviorService } from '../../../@core/mock/customer-behavior.service';
import { BehaviorFilters } from '../../../@core/data/customer-behavior';
import { NbThemeService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-top-governorates-creditor',
  templateUrl: './top-governorates-creditor.component.html',
  styleUrls: ['./top-governorates-creditor.component.scss'],
})
export class TopGovernoratesCreditorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dateRange: DateRange;

  options: any;
  loading = true;
  metric: 'count' | 'amount' = 'count';
  private destroy$ = new Subject<void>();

  constructor(
    private behaviorService: CustomerBehaviorService,
    private theme: NbThemeService,
  ) {}

  ngOnInit() {
    if (this.dateRange) {
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dateRange && this.dateRange) {
      this.loadData();
    }
  }

  loadData() {
    this.loading = true;

    const filters: BehaviorFilters = {
      walletType: 'All',
      transactionType: 'All',
      startDate: this.dateRange.start,
      endDate: this.dateRange.end,
    };

    const topGovernorates = this.behaviorService.getTopGovernorates(filters, 'creditor', this.metric);

    this.theme.getJsTheme()
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        const colors: any = config.variables;
        const echarts: any = config.variables.echarts;

        this.options = {
          backgroundColor: echarts.bg,
          color: [colors.successLight],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: echarts.axisLineColor,
              },
            },
            splitLine: {
              lineStyle: {
                color: echarts.splitLineColor,
              },
            },
            axisLabel: {
              textStyle: {
                color: echarts.textColor,
              },
            },
          },
          yAxis: {
            type: 'category',
            data: topGovernorates.map(d => d.governorate).reverse(),
            axisLine: {
              lineStyle: {
                color: echarts.axisLineColor,
              },
            },
            axisLabel: {
              textStyle: {
                color: echarts.textColor,
              },
            },
          },
          series: [
            {
              name: this.metric === 'count' ? 'Transaction Count' : 'Transaction Amount',
              type: 'bar',
              data: topGovernorates.map(d => d.value).reverse(),
              itemStyle: {
                normal: {
                  color: colors.success,
                },
              },
            },
          ],
        };

        this.loading = false;
      });
  }

  updateMetric(metric: 'count' | 'amount') {
    this.metric = metric;
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

