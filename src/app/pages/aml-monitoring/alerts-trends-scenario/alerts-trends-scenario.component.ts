import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { DetectionService } from '../../../@core/mock/detection.service';
import { DataProcessingService, TimeseriesDataPoint } from '../../../@core/utils/data-processing.service';

@Component({
  selector: 'ngx-alerts-trends-scenario',
  templateUrl: './alerts-trends-scenario.component.html',
  styleUrls: ['./alerts-trends-scenario.component.scss'],
})
export class AlertsTrendsScenarioComponent implements OnInit, OnChanges {
  @Input() dateRange: DateRange;

  chartData: any = {};
  loading = true;
  options: any;
  bucketSize = 'day';
  
  // Scenario selection
  availableScenarios: { key: string; label: string; color: string }[] = [];
  selectedScenarios: string[] = [];
  dropdownOpen = false;
  
  constructor(
    private detectionService: DetectionService,
    private dataProcessingService: DataProcessingService,
  ) {
    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'bottom',
        labels: {
          fontColor: '#ababb1',
        },
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              unit: 'day',
              tooltipFormat: 'll',
              displayFormats: {
                day: 'MMM D',
                week: 'MMM D',
                month: 'MMM YYYY',
              },
            },
            gridLines: {
              display: false,
              color: '#ababb1',
            },
            ticks: {
              fontColor: '#ababb1',
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: '#ababb1',
            },
            ticks: {
              fontColor: '#ababb1',
              beginAtZero: true,
            },
          },
        ],
      },
    };
  }

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
    
    // Get detections in date range
    const detections = this.detectionService.getDetectionsByDateRange(
      this.dateRange.start, 
      this.dateRange.end
    );
    
    // Get unique scenarios
    const scenarios = [...new Set(detections.map(d => d.scenario_name))];
    
    // Define colors for scenarios (cycling through a palette)
    const colors = [
      '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff',
      '#ff9f40', '#ffcd56', '#c9cbcf', '#4bc0c0', '#ff6384'
    ];
    
    // Initialize available scenarios if not set
    if (this.availableScenarios.length === 0) {
      this.availableScenarios = scenarios.map((scenario, index) => ({
        key: scenario,
        label: scenario,
        color: colors[index % colors.length]
      }));
      this.selectedScenarios = scenarios; // Select all by default
    }
    
    // Filter scenarios based on selection
    const filteredScenarios = scenarios.filter(scenario => 
      this.selectedScenarios.includes(scenario)
    );
    
    // Prepare datasets for each selected scenario
    const datasets = filteredScenarios.map((scenario, index) => {
      // Filter detections for this scenario
      const scenarioDetections = detections.filter(d => d.scenario_name === scenario);
      
      // Prepare data points
      const dataPoints = scenarioDetections.map(d => ({
        date: d.detection_date,
        value: 1
      }));
      
      // Group by time buckets
      const timeseries = this.dataProcessingService.groupTimeseriesByBucket(
        dataPoints, 
        this.bucketSize as any, 
        'value'
      );
      
      return {
        label: scenario,
        data: timeseries.map(item => ({
          t: new Date(item.date),
          y: item.value,
        })),
        fill: false,
        borderColor: colors[index % colors.length],
        pointBackgroundColor: colors[index % colors.length],
        pointRadius: 3,
        pointHoverRadius: 5,
      };
    });
    
    // Get all unique dates from all scenarios for consistent x-axis
    const allDates = new Set<string>();
    datasets.forEach(dataset => {
      dataset.data.forEach((point: any) => {
        allDates.add(point.t.toISOString().split('T')[0]);
      });
    });
    
    // Prepare chart data
    this.chartData = {
      labels: Array.from(allDates).map(date => new Date(date)),
      datasets: datasets,
    };
    
    this.loading = false;
  }

  updateBucketSize(size: 'day' | 'week' | 'month') {
    this.bucketSize = size;
    this.options.scales.xAxes[0].time.unit = size;
    this.loadData();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleScenario(scenarioKey: string) {
    const index = this.selectedScenarios.indexOf(scenarioKey);
    if (index > -1) {
      this.selectedScenarios.splice(index, 1);
    } else {
      this.selectedScenarios.push(scenarioKey);
    }
    this.loadData();
  }

  selectAllScenarios() {
    this.selectedScenarios = this.availableScenarios.map(s => s.key);
    this.loadData();
  }

  deselectAllScenarios() {
    this.selectedScenarios = [];
    this.loadData();
  }

  getSelectedScenariosText(): string {
    if (this.selectedScenarios.length === 0) {
      return 'No scenarios selected';
    } else if (this.selectedScenarios.length === this.availableScenarios.length) {
      return 'All scenarios';
    } else if (this.selectedScenarios.length <= 3) {
      return this.selectedScenarios.join(', ');
    } else {
      return `${this.selectedScenarios.length} scenarios selected`;
    }
  }
}
