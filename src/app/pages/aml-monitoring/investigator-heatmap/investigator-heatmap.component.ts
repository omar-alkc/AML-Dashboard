import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { DateRange } from '../../../@core/utils/date-range.service';
import { DetectionService } from '../../../@core/mock/detection.service';
import { InvestigatorService } from '../../../@core/mock/investigator.service';
import { ScenarioService } from '../../../@core/mock/scenario.service';
import { DataProcessingService } from '../../../@core/utils/data-processing.service';

@Component({
  selector: 'ngx-investigator-heatmap',
  templateUrl: './investigator-heatmap.component.html',
  styleUrls: ['./investigator-heatmap.component.scss'],
})
export class InvestigatorHeatmapComponent implements OnInit, OnChanges {
  @Input() dateRange: DateRange;

  chartOptions: any = {};
  loading = true;
  echartsInstance: any;
  
  constructor(
    private detectionService: DetectionService,
    private investigatorService: InvestigatorService,
    private scenarioService: ScenarioService,
    private dataProcessingService: DataProcessingService,
    private themeService: NbThemeService,
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

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  loadData() {
    this.loading = true;
    
    // Get processed detections in date range (status not NEW or DELAYED)
    const detections = this.detectionService.getDetectionsByDateRange(
      this.dateRange.start, 
      this.dateRange.end
    ).filter(d => d.status !== 'New' && d.status !== 'Delayed');
    
    // Create heatmap data structure using the DataProcessingService
    const heatmapData = this.dataProcessingService.createHeatmapData(
      detections,
      'modified_by',
      'scenario_name'
    );
    
    // Get display names for investigators
    const investigatorDisplayNames = {};
    heatmapData.rows.forEach(login => {
      const investigator = this.investigatorService.getInvestigatorByLogin(login);
      investigatorDisplayNames[login] = investigator ? investigator.full_name : login;
    });
    
    // Prepare ECharts heatmap data
    const data = heatmapData.data.map(item => {
      return [
        heatmapData.columns.indexOf(item.col),
        heatmapData.rows.indexOf(item.row),
        item.value
      ];
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
          const scenarioName = heatmapData.columns[params.data[0]];
          const investigatorLogin = heatmapData.rows[params.data[1]];
          const investigatorName = investigatorDisplayNames[investigatorLogin];
          return `${investigatorName}<br/>Scenario: ${scenarioName}<br/>Processed: ${params.data[2]}`;
        }
      },
      animation: false,
      grid: {
        height: '70%',
        top: '10%',
      },
      xAxis: {
        type: 'category',
        data: heatmapData.columns,
        splitArea: {
          show: true
        },
        axisLabel: {
          rotate: 45,
          color: textColor,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 12,
          formatter: (value) => {
            return value.length > 10 ? value.substring(0, 10) + '...' : value;
          }
        }
      },
      yAxis: {
        type: 'category',
        data: heatmapData.rows.map(login => investigatorDisplayNames[login]),
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
        name: 'Processed Detections',
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
