import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { ScPortalService } from '../../../@core/mock/sc-portal.service';
import { NbThemeService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-investigator-performance',
  templateUrl: './investigator-performance.component.html',
  styleUrls: ['./investigator-performance.component.scss'],
})
export class InvestigatorPerformanceComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dateRange: DateRange;

  chartOptions: any = {};
  loading = true;
  echartsInstance: any;
  private destroy$ = new Subject<void>();

  constructor(
    private scPortalService: ScPortalService,
    private themeService: NbThemeService
  ) {}

  ngOnInit() {
    if (this.dateRange) {
      this.loadData();
    }
  }

  ngOnChanges() {
    if (this.dateRange) {
      this.loadData();
    }
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.loading = true;
    
    const heatmapData = this.scPortalService.getInvestigatorHeatmapData(
      this.dateRange.start,
      this.dateRange.end
    );

    const investigators = heatmapData.investigators;
    const statuses = ['Sent Forms', 'Accepted', 'Rejected', 'Suspended'];
    
    // Prepare ECharts heatmap data
    const data = [];
    investigators.forEach((investigator, investigatorIndex) => {
      statuses.forEach((status, statusIndex) => {
        const statusKey = status.toLowerCase().replace(' ', '');
        const value = heatmapData.data[investigator][statusKey] || 0;
        data.push([statusIndex, investigatorIndex, value]);
      });
    });
    
    // Get current theme
    const currentTheme = this.themeService.currentTheme;
    const isDark = currentTheme === 'dark';
    
    // Theme-aware colors
    const heatmapColors = isDark ? [
      '#2d3748', // Dark gray
      '#4a5568', // Medium gray
      '#68d391', // Light green
      '#38a169', // Medium green
      '#2f855a'  // Dark green
    ] : [
      '#ebedf0', 
      '#c6e48b', 
      '#7bc96f', 
      '#239a3b', 
      '#196127'
    ];
    
    const textColor = isDark ? '#e2e8f0' : '#2d3748';
    const backgroundColor = isDark ? '#1a202c' : '#ffffff';
    
    // Configure chart options
    this.chartOptions = {
      backgroundColor: backgroundColor,
      tooltip: {
        position: 'top',
        backgroundColor: isDark ? '#2d3748' : '#ffffff',
        borderColor: isDark ? '#4a5568' : '#e2e8f0',
        textStyle: {
          color: textColor
        },
        formatter: (params) => {
          const statusName = statuses[params.data[0]];
          const investigatorName = investigators[params.data[1]];
          return `${investigatorName}<br/>Status: ${statusName}<br/>Count: ${params.data[2]}`;
        }
      },
      animation: false,
      grid: {
        height: '70%',
        top: '10%',
      },
      xAxis: {
        type: 'category',
        data: statuses,
        splitArea: {
          show: true
        },
        axisLabel: {
          rotate: 45,
          color: textColor,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 12
        }
      },
      yAxis: {
        type: 'category',
        data: investigators,
        splitArea: {
          show: true
        },
        axisLabel: {
          color: textColor,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 12
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.map(item => item[2])),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        textStyle: {
          color: textColor,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 12
        },
        inRange: {
          color: heatmapColors
        }
      },
      series: [{
        name: 'Form Count',
        type: 'heatmap',
        data: data,
        label: {
          show: true,
          color: textColor,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 11
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
    
    this.loading = false;
  }
}
