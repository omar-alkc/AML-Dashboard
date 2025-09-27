import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { ScreeningService } from '../../../@core/mock/screening.service';
import { NbThemeService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-onboarding-investigator-pie',
  templateUrl: './onboarding-investigator-pie.component.html',
  styleUrls: ['./onboarding-investigator-pie.component.scss'],
})
export class OnboardingInvestigatorPieComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dateRange: DateRange;

  investigatorData: any[] = [];
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
          this.loadData();
        }
      });

    if (this.dateRange) {
      this.loadData();
    }
  }

  ngOnChanges() {
    if (this.dateRange) {
      this.loadData();
    }
  }

  loadData() {
    this.loading = true;
    this.investigatorData = this.screeningService.getInvestigatorPerformance(
      'onboarding',
      this.dateRange.start,
      this.dateRange.end
    );

    const isDark = this.currentTheme === 'dark';
    const textColor = isDark ? '#ffffff' : '#333333';

    this.chartData = {
      labels: this.investigatorData.map(d => d.investigator),
      datasets: [{
        data: this.investigatorData.map(d => d.workload),
        backgroundColor: [
          '#007bff',
          '#28a745',
          '#ffc107',
          '#dc3545',
          '#6f42c1'
        ],
        borderWidth: 2,
        borderColor: isDark ? '#2a2a2a' : '#ffffff'
      }]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
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
          borderColor: isDark ? '#404040' : '#e0e0e0',
          borderWidth: 1,
          callbacks: {
            label: (context: any) => {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} cases (${percentage}%)`;
            }
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
