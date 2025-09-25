import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { DetectionService } from '../../../@core/mock/detection.service';
import { DataProcessingService, TimeseriesDataPoint } from '../../../@core/utils/data-processing.service';

@Component({
  selector: 'ngx-time-trend',
  templateUrl: './time-trend.component.html',
  styleUrls: ['./time-trend.component.scss'],
})
export class TimeTrendComponent implements OnInit, OnChanges {
  @Input() dateRange: DateRange;

  chartData: any = {};
  loading = true;
  options: any;
  bucketSize = 'day';
  
  // Always show all series (Created, Processed, Pending)
  
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
    const allDetections = this.detectionService.getDetectionsByDateRange(
      this.dateRange.start, 
      this.dateRange.end
    );
    
    // Initialize available scenarios if not set
    if (this.availableScenarios.length === 0) {
      const scenarios = [...new Set(allDetections.map(d => d.scenario_name))];
      const colors = [
        '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff',
        '#ff9f40', '#ffcd56', '#c9cbcf', '#4bc0c0', '#ff6384'
      ];
      
      this.availableScenarios = scenarios.map((scenario, index) => ({
        key: scenario,
        label: scenario,
        color: colors[index % colors.length]
      }));
      this.selectedScenarios = scenarios; // Select all by default
    }
    
    // Filter detections by selected scenarios
    const detections = allDetections.filter(d => 
      this.selectedScenarios.includes(d.scenario_name)
    );
    
    // Prepare data for created series
    const createdData = detections.map(d => {
      return { date: d.detection_date, value: 1 };
    });
    
    // Prepare data for processed series
    const processedData = detections
      .filter(d => d.status !== 'New' && d.status !== 'Delayed' && d.status_change_date)
      .map(d => {
        return { date: d.status_change_date, value: 1 };
      });
    
    // Group by time buckets
    const createdTimeseries = this.dataProcessingService.groupTimeseriesByBucket(
      createdData, 
      this.bucketSize as any, 
      'value'
    );
    
    const processedTimeseries = this.dataProcessingService.groupTimeseriesByBucket(
      processedData, 
      this.bucketSize as any, 
      'value'
    );
    
    // Calculate pending (created - processed) as per PRD
    const pendingTimeseries = this.dataProcessingService.calculateDerivedTimeseries(
      createdTimeseries,
      processedTimeseries,
      'subtract'
    );
    
    // Prepare all datasets
    const allDatasets = [
      {
        key: 'created',
        label: 'Created',
        data: createdTimeseries.map(item => ({
          t: new Date(item.date),
          y: item.value,
        })),
        fill: false,
        borderColor: '#ff9f40', // Orange as per PRD
        pointBackgroundColor: '#ff9f40',
      },
      {
        key: 'processed',
        label: 'Processed',
        data: processedTimeseries.map(item => ({
          t: new Date(item.date),
          y: item.value,
        })),
        fill: false,
        borderColor: '#36a2eb', // Blue as per PRD
        pointBackgroundColor: '#36a2eb',
      },
      {
        key: 'pending',
        label: 'Pending',
        data: pendingTimeseries.map(item => ({
          t: new Date(item.date),
          y: item.value,
        })),
        fill: false,
        borderColor: '#ff6384', // Red for pending
        pointBackgroundColor: '#ff6384',
      },
    ];

    // Always show all datasets (Created, Processed, Pending)
    this.chartData = {
      labels: createdTimeseries.map(item => new Date(item.date)),
      datasets: allDatasets,
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