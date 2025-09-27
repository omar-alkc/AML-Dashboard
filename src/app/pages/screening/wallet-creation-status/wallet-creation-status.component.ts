import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { ScreeningService } from '../../../@core/mock/screening.service';
import { NbThemeService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-wallet-creation-status',
  templateUrl: './wallet-creation-status.component.html',
  styleUrls: ['./wallet-creation-status.component.scss'],
})
export class WalletCreationStatusComponent implements OnInit, OnChanges, OnDestroy {
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
    console.log('Loading chart data with dateRange:', this.dateRange, 'timePeriod:', this.timePeriod);
    
    const timeSeriesData = this.screeningService.getOnboardingTimeSeries(
      this.dateRange.start, 
      this.dateRange.end, 
      this.timePeriod
    );

    console.log('Time series data received:', timeSeriesData);

    const isDark = this.currentTheme === 'dark';
    const textColor = isDark ? '#ffffff' : '#333333';
    const gridColor = isDark ? '#404040' : '#e0e0e0';

    this.chartData = {
      labels: timeSeriesData.map(d => d.period),
      datasets: [
        {
          label: 'Total Wallets Created',
          data: timeSeriesData.map(d => d.totalWalletsCreated),
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'New Detections',
          data: timeSeriesData.map(d => d.newDetections),
          borderColor: '#ff6b35',
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'False Positives',
          data: timeSeriesData.map(d => d.falsePositives),
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Wallets Rejected',
          data: timeSeriesData.map(d => d.walletsRejected),
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
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

    console.log('Final chart data:', this.chartData);
    console.log('Final chart options:', this.chartOptions);
    this.loading = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
