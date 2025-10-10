import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { CustomerBehaviorService } from '../../../@core/mock/customer-behavior.service';
import { BehaviorFilters } from '../../../@core/data/customer-behavior';
import { NbThemeService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-hourly-frequency',
  templateUrl: './hourly-frequency.component.html',
  styleUrls: ['./hourly-frequency.component.scss'],
})
export class HourlyFrequencyComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dateRange: DateRange;

  options: any;
  loading = true;
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

    const hourlyData = this.behaviorService.getHourlyDistribution(filters);

    this.theme.getJsTheme()
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        const colors: any = config.variables;
        const echarts: any = config.variables.echarts;

        this.options = {
          backgroundColor: echarts.bg,
          color: [colors.warningLight],
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
          xAxis: [
            {
              type: 'category',
              data: hourlyData.map(d => `${d.hour}:00`),
              axisTick: {
                alignWithLabel: true,
              },
              axisLine: {
                lineStyle: {
                  color: echarts.axisLineColor,
                },
              },
              axisLabel: {
                textStyle: {
                  color: echarts.textColor,
                },
                rotate: 45,
              },
            },
          ],
          yAxis: [
            {
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
          ],
          series: [
            {
              name: 'Transactions',
              type: 'bar',
              barWidth: '60%',
              data: hourlyData.map(d => ({
                value: d.count,
                itemStyle: {
                  color: d.hour >= 9 && d.hour <= 17 ? colors.warning : colors.info,
                },
              })),
            },
          ],
        };

        this.loading = false;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

