import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { DetectionService } from '../../../@core/mock/detection.service';
import { StatusService, StatusGroup } from '../../../@core/mock/status.service';
import { ScenarioService } from '../../../@core/mock/scenario.service';

@Component({
  selector: 'ngx-status-per-scenario',
  templateUrl: './status-per-scenario.component.html',
  styleUrls: ['./status-per-scenario.component.scss'],
})
export class StatusPerScenarioComponent implements OnInit, OnChanges {
  @Input() dateRange: DateRange;

  chartData: any = {};
  loading = true;
  options: any;
  viewMode: 'category' | 'scenario' = 'scenario';
  
  constructor(
    private detectionService: DetectionService,
    private statusService: StatusService,
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
    
    // Get detections in date range
    const detections = this.detectionService.getDetectionsByDateRange(
      this.dateRange.start, 
      this.dateRange.end
    );
    
    // Get status groups
    const statusGroups = this.statusService.getStatusGroups();
    
    // Colors for status groups (can be customized per requirements)
    const colors = {
      [StatusGroup.NEW]: '#36a2eb', // Blue
      [StatusGroup.DELAYED]: '#ff9f40', // Orange
      [StatusGroup.WAITING_FOR_EVIDENCE]: '#ffcd56', // Yellow
      [StatusGroup.SUSPICIOUS_INITIAL]: '#ff6384', // Red
      [StatusGroup.FALSE_POSITIVE_INITIAL]: '#4bc0c0', // Turquoise
      [StatusGroup.UNDER_INVESTIGATION]: '#9966ff', // Purple
      [StatusGroup.SUSPICIOUS_FINAL]: '#c9302c', // Dark Red
      [StatusGroup.FALSE_POSITIVE_FINAL]: '#5cb85c', // Green
      [StatusGroup.SENT_SAR]: '#0275d8', // Dark Blue
    };
    
    let labels: string[];
    let dataCount: any;
    
    if (this.viewMode === 'category') {
      // Group by category and status
      const categoryStatusCount = {};
      const categoryMapping = {};
      
      // Initialize category counts and mapping
      detections.forEach(detection => {
        const scenario = this.scenarioService.getScenarioByShortCode(detection.scenario_name);
        if (scenario) {
          const category = scenario.category;
          categoryMapping[detection.scenario_name] = category;
          
          if (!categoryStatusCount[category]) {
            categoryStatusCount[category] = {};
            statusGroups.forEach(group => {
              categoryStatusCount[category][group.group] = 0;
            });
          }
        }
      });
      
      // Count detections by category and status group
      detections.forEach(detection => {
        const category = categoryMapping[detection.scenario_name];
        if (category) {
          const statusGroup = this.statusService.getStatusGroupForStatus(detection.status);
          if (statusGroup && categoryStatusCount[category][statusGroup] !== undefined) {
            categoryStatusCount[category][statusGroup]++;
          }
        }
      });
      
      // Calculate total counts per category for sorting
      const categoryTotals = {};
      Object.keys(categoryStatusCount).forEach(category => {
        categoryTotals[category] = Object.values(categoryStatusCount[category]).reduce((a: number, b: number) => a + b, 0);
      });
      
      // Sort categories by total count
      const topCategories = Object.keys(categoryTotals)
        .sort((a, b) => categoryTotals[b] - categoryTotals[a]);
      
      labels = topCategories;
      dataCount = categoryStatusCount;
    } else {
      // Original scenario-based logic
      const scenarioStatusCount = {};
      
      // Initialize scenario counts
      detections.forEach(detection => {
        if (!scenarioStatusCount[detection.scenario_name]) {
          scenarioStatusCount[detection.scenario_name] = {};
          statusGroups.forEach(group => {
            scenarioStatusCount[detection.scenario_name][group.group] = 0;
          });
        }
      });
      
      // Count detections by scenario and status group
      detections.forEach(detection => {
        const statusGroup = this.statusService.getStatusGroupForStatus(detection.status);
        if (statusGroup && scenarioStatusCount[detection.scenario_name][statusGroup] !== undefined) {
          scenarioStatusCount[detection.scenario_name][statusGroup]++;
        }
      });
      
      // Calculate total counts per scenario for sorting
      const scenarioTotals = {};
      Object.keys(scenarioStatusCount).forEach(scenario => {
        scenarioTotals[scenario] = Object.values(scenarioStatusCount[scenario]).reduce((a: number, b: number) => a + b, 0);
      });
      
      // Sort scenarios by total count and limit to top 20
      const topScenarios = Object.keys(scenarioTotals)
        .sort((a, b) => scenarioTotals[b] - scenarioTotals[a])
        .slice(0, 20);
      
      labels = topScenarios;
      dataCount = scenarioStatusCount;
    }
    
    // Prepare chart datasets
    const datasets = statusGroups.map(group => {
      return {
        label: group.group,
        data: labels.map(label => dataCount[label][group.group] || 0),
        backgroundColor: colors[group.group] || '#777777',
      };
    });
    
    // Filter out empty datasets
    const filteredDatasets = datasets.filter(dataset => 
      dataset.data.some(value => value > 0)
    );
    
    this.chartData = {
      labels: labels,
      datasets: filteredDatasets,
    };
    
    this.loading = false;
  }

  updateViewMode(mode: 'category' | 'scenario') {
    this.viewMode = mode;
    this.loadData();
  }
}
