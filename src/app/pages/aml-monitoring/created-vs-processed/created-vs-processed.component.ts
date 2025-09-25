import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { DetectionService } from '../../../@core/mock/detection.service';
import { ScenarioService } from '../../../@core/mock/scenario.service';

@Component({
  selector: 'ngx-created-vs-processed',
  templateUrl: './created-vs-processed.component.html',
  styleUrls: ['./created-vs-processed.component.scss'],
})
export class CreatedVsProcessedComponent implements OnInit, OnChanges {
  @Input() dateRange: DateRange;

  chartData: any = {};
  loading = true;
  options: any;
  
  constructor(
    private detectionService: DetectionService,
    private scenarioService: ScenarioService,
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
            maxBarThickness: 25,
            stacked: true,
            gridLines: {
              display: false,
              color: '#ababb1',
            },
            ticks: {
              fontColor: '#ababb1',
              maxRotation: 45,
              callback: (value: string) => {
                return value.length > 10 ? value.substring(0, 10) + '...' : value;
              },
            },
          },
        ],
        yAxes: [
          {
            stacked: true,
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
      tooltips: {
        callbacks: {
          title: (tooltipItem, data) => {
            return data.labels[tooltipItem[0].index];
          },
        },
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
    
    // Get all scenarios
    const scenarios = this.scenarioService.getScenarios();
    
    // Get all detections within the date range
    const detectionsInRange = this.detectionService.getDetectionsByDateRange(
      this.dateRange.start, 
      this.dateRange.end
    );
    
    // Group detections by scenario and status (NEW vs processed)
    const createdByScenario = new Map<string, number>();
    const processedByScenario = new Map<string, number>();
    
    // Initialize with 0 for all scenarios
    scenarios.forEach(scenario => {
      createdByScenario.set(scenario.short_code, 0);
      processedByScenario.set(scenario.short_code, 0);
    });
    
    // Count created and processed alerts per scenario
    detectionsInRange.forEach(detection => {
      const scenarioShortCode = detection.scenario_name;
      
      if (detection.status === 'New' || detection.status === 'Delayed') {
        // Count as created
        if (createdByScenario.has(scenarioShortCode)) {
          createdByScenario.set(scenarioShortCode, createdByScenario.get(scenarioShortCode) + 1);
        } else {
          createdByScenario.set(scenarioShortCode, 1);
        }
      } else {
        // Count as processed
        if (processedByScenario.has(scenarioShortCode)) {
          processedByScenario.set(scenarioShortCode, processedByScenario.get(scenarioShortCode) + 1);
        } else {
          processedByScenario.set(scenarioShortCode, 1);
        }
      }
    });
    
    // Calculate total detections per scenario for sorting
    const totalByScenario = new Map<string, number>();
    scenarios.forEach(scenario => {
      const created = createdByScenario.get(scenario.short_code) || 0;
      const processed = processedByScenario.get(scenario.short_code) || 0;
      totalByScenario.set(scenario.short_code, created + processed);
    });
    
    // Sort and limit to top 25
    const sortedScenarios = Array.from(totalByScenario.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([code]) => code);
    
    // Prepare chart data
    this.chartData = {
      labels: sortedScenarios,
      datasets: [
        {
          data: sortedScenarios.map(code => createdByScenario.get(code) || 0),
          label: 'Created',
          backgroundColor: '#ff9f40', // Orange as per PRD
        },
        {
          data: sortedScenarios.map(code => processedByScenario.get(code) || 0),
          label: 'Processed',
          backgroundColor: '#36a2eb', // Blue as per PRD
        },
      ],
    };
    
    this.loading = false;
  }
}
