import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { ScreeningService } from '../../../@core/mock/screening.service';
import { NbThemeService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-periodic-screening-trends',
  templateUrl: './periodic-screening-trends.component.html',
  styleUrls: ['./periodic-screening-trends.component.scss'],
})
export class PeriodicScreeningTrendsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dateRange: DateRange;
  @Input() timePeriod: 'day' | 'week' | 'month' = 'week';

  chartData: any = {};
  chartOptions: any = {};
  loading = true;
  currentTheme = 'dark';
  private destroy$ = new Subject<void>();

  constructor(
    private screeningService: ScreeningService,
    private themeService: NbThemeService
  ) {}

  ngOnInit() {
    this.themeService.getJsTheme()
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme.name;
        if (this.dateRange) {
          this.loadChartData();
        }
      });

    if (this.dateRange) {
      this.loadChartData();
    }
  }

  ngOnChanges() {
    if (this.dateRange) {
      this.loadChartData();
    }
  }

  loadChartData() {
    this.loading = true;
    const timeSeriesData = this.screeningService.getPeriodicTimeSeries(
      this.dateRange.start, 
      this.dateRange.end, 
      this.timePeriod
    );

    const isDark = this.currentTheme === 'dark';
    const textColor = isDark ? '#ffffff' : '#333333';
    const gridColor = isDark ? '#404040' : '#e0e0e0';

    this.chartData = {
      labels: timeSeriesData.map(d => d.period),
      datasets: [
        {
          label: 'Scanned wallets',
          data: timeSeriesData.map(d => d.scannedWallets),
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Created Alerts',
          data: timeSeriesData.map(d => d.createdAlerts),
          borderColor: '#ff6b35',
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Manually Processed Alerts',
          data: timeSeriesData.map(d => d.manuallyProcessedAlerts),
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Automatically released alerts (clean)',
          data: timeSeriesData.map(d => d.automaticallyReleasedAlerts),
          borderColor: '#6f42c1',
          backgroundColor: 'rgba(111, 66, 193, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        },
        y: {
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        }
      }
    };

    this.loading = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
