import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { DetectionService } from '../../../@core/mock/detection.service';
import { ScenarioService } from '../../../@core/mock/scenario.service';

@Component({
  selector: 'ngx-pending-alerts',
  templateUrl: './pending-alerts.component.html',
  styleUrls: ['./pending-alerts.component.scss'],
})
export class PendingAlertsComponent implements OnInit, OnChanges {
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
    
    // Get all pending alerts
    const pendingAlerts = this.detectionService.getDetectionsByStatus('New');
    
    // Group pending alerts by scenario
    const pendingByScenario = new Map<string, number>();
    
    // Initialize with 0 for all scenarios
    scenarios.forEach(scenario => {
      pendingByScenario.set(scenario.short_code, 0);
    });
    
    // Count pending alerts per scenario
    pendingAlerts.forEach(alert => {
      const scenarioShortCode = alert.scenario_name;
      if (pendingByScenario.has(scenarioShortCode)) {
        pendingByScenario.set(scenarioShortCode, pendingByScenario.get(scenarioShortCode) + 1);
      } else {
        pendingByScenario.set(scenarioShortCode, 1);
      }
    });
    
    // Sort and limit to top 25
    const sortedScenarios = Array.from(pendingByScenario.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25);
    
    // Prepare chart data
    this.chartData = {
      labels: sortedScenarios.map(([scenarioCode]) => scenarioCode),
      datasets: [
        {
          data: sortedScenarios.map(([, count]) => count),
          label: 'Pending Alerts',
          backgroundColor: '#ff9f40', // Orange as per PRD
        },
      ],
    };
    
    this.loading = false;
  }
}
