import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { DetectionService } from '../../../@core/mock/detection.service';
import { InvestigatorService } from '../../../@core/mock/investigator.service';

@Component({
  selector: 'ngx-delayed-alerts',
  templateUrl: './delayed-alerts.component.html',
  styleUrls: ['./delayed-alerts.component.scss'],
})
export class DelayedAlertsComponent implements OnInit, OnChanges {
  @Input() dateRange: DateRange;

  chartData: any = {};
  loading = true;
  options: any;
  
  constructor(
    private detectionService: DetectionService,
    private investigatorService: InvestigatorService,
  ) {
    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
              color: '#ababb1',
            },
            ticks: {
              fontColor: '#ababb1',
              beginAtZero: true,
            },
          },
        ],
        yAxes: [
          {
            maxBarThickness: 20,
            gridLines: {
              display: false,
            },
            ticks: {
              fontColor: '#ababb1',
              callback: (value: string) => {
                return value.length > 15 ? value.substring(0, 15) + '...' : value;
              },
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
    
    // Get all delayed alerts
    const delayedAlerts = this.detectionService.getDetectionsByStatus('Delayed');
    
    // Group by investigator
    const delayedByInvestigator = new Map<string, number>();
    
    // Count delayed alerts by investigator
    delayedAlerts.forEach(alert => {
      if (alert.modified_by) {
        if (!delayedByInvestigator.has(alert.modified_by)) {
          delayedByInvestigator.set(alert.modified_by, 0);
        }
        delayedByInvestigator.set(alert.modified_by, delayedByInvestigator.get(alert.modified_by) + 1);
      }
    });
    
    // Sort by count descending
    const sortedData = Array.from(delayedByInvestigator.entries())
      .sort((a, b) => b[1] - a[1]);
    
    // Prepare labels using display names
    const labels = sortedData.map(([login]) => {
      const investigator = this.investigatorService.getInvestigatorByLogin(login);
      return investigator ? investigator.full_name : login;
    });
    
    // Prepare chart data
    this.chartData = {
      labels: labels,
      datasets: [
        {
          data: sortedData.map(([, count]) => count),
          backgroundColor: '#ff9f40', // Orange as per PRD
          borderWidth: 0,
        },
      ],
    };
    
    this.loading = false;
  }
}
