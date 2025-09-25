import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { DetectionService } from '../../../@core/mock/detection.service';
import { StatusService, StatusGroup } from '../../../@core/mock/status.service';
import { ScenarioService } from '../../../@core/mock/scenario.service';

@Component({
  selector: 'ngx-status-distribution',
  templateUrl: './status-distribution.component.html',
  styleUrls: ['./status-distribution.component.scss'],
})
export class StatusDistributionComponent implements OnInit, OnChanges {
  @Input() dateRange: DateRange;

  chartData: any = {};
  loading = true;
  options: any;
  viewMode: 'category' | 'status' = 'status';
  
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
          padding: 20,
          usePointStyle: true,
        },
      },
      cutoutPercentage: 50,
      tooltips: {
        enabled: true,
        callbacks: {
          label: function(tooltipItem, data) {
            const dataset = data.datasets[tooltipItem.datasetIndex];
            const value = dataset.data[tooltipItem.index];
            const total = dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = Math.round((value / total) * 100);
            return data.labels[tooltipItem.index] + ': ' + value + ' (' + percentage + '%)';
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
      }
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
    
    console.log('Detection Distribution - Detections found:', detections.length);
    console.log('Detection Distribution - Date range:', this.dateRange);
    console.log('Detection Distribution - View mode:', this.viewMode);
    
    let counts = {};
    let labels: string[] = [];
    
    if (this.viewMode === 'category') {
      // Count detections by category
      const categoryCounts = {};
      const categoryMapping = {};
      
      // Map scenarios to categories
      detections.forEach(detection => {
        const scenario = this.scenarioService.getScenarioByShortCode(detection.scenario_name);
        if (scenario) {
          const category = scenario.category;
          categoryMapping[detection.scenario_name] = category;
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });
      
      counts = categoryCounts;
      labels = Object.keys(categoryCounts)
        .filter(category => categoryCounts[category] > 0)
        .sort((a, b) => categoryCounts[b] - categoryCounts[a]);
        
      console.log('Detection Distribution - Category counts:', categoryCounts);
    } else {
      // Count detections by status (original logic)
      const statusCounts = {};
      
      detections.forEach(detection => {
        const status = detection.status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      counts = statusCounts;
      labels = Object.keys(statusCounts)
        .filter(status => statusCounts[status] > 0)
        .sort((a, b) => statusCounts[b] - statusCounts[a]);
        
      console.log('Detection Distribution - Status counts:', statusCounts);
    }
    
    console.log('Detection Distribution - Filtered labels:', labels);
    
    // If no data, show a placeholder
    if (labels.length === 0) {
      this.chartData = {
        labels: ['No Data'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#cccccc'],
            borderWidth: 0,
          },
        ],
      };
    } else {
      // Colors for different categories/statuses
      const colors = [
        '#36a2eb', // Blue
        '#ff9f40', // Orange
        '#ffcd56', // Yellow
        '#ff6384', // Red
        '#4bc0c0', // Turquoise
        '#9966ff', // Purple
        '#c9302c', // Dark Red
        '#5cb85c', // Green
        '#0275d8', // Dark Blue
        '#777777', // Gray
      ];
      
      this.chartData = {
        labels: labels,
        datasets: [
          {
            data: labels.map(label => counts[label]),
            backgroundColor: labels.map((label, index) => colors[index % colors.length]),
            borderWidth: 0,
          },
        ],
      };
    }
    
    console.log('Detection Distribution - Final chart data:', this.chartData);
    this.loading = false;
  }

  updateViewMode(mode: 'category' | 'status') {
    this.viewMode = mode;
    this.loadData();
  }
}
