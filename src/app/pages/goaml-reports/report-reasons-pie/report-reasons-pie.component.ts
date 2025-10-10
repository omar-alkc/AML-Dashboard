import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { GoAmlReportService } from '../../../@core/mock/goaml-report.service';

@Component({
  selector: 'ngx-report-reasons-pie',
  templateUrl: './report-reasons-pie.component.html',
  styleUrls: ['./report-reasons-pie.component.scss'],
})
export class ReportReasonsPieComponent implements OnInit, OnChanges {
  @Input() dateRange: DateRange;

  chartData: any = {};
  loading = true;
  options: any;

  constructor(private goamlService: GoAmlReportService) {
    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'right',
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
          label: (tooltipItem, data) => {
            const dataset = data.datasets[tooltipItem.datasetIndex];
            const value = dataset.data[tooltipItem.index];
            const total = dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = Math.round((value / total) * 100);
            const label = data.labels[tooltipItem.index];
            return `${label}: ${value} (${percentage}%)`;
          },
          afterLabel: (tooltipItem, data) => {
            // Show breakdown by report type
            const reasonDistribution = this.reasonDistribution;
            const reason = data.labels[tooltipItem.index];
            if (reasonDistribution[reason] && reasonDistribution[reason].byType) {
              const breakdown = [];
              for (const type in reasonDistribution[reason].byType) {
                breakdown.push(`  ${type}: ${reasonDistribution[reason].byType[type]}`);
              }
              return breakdown;
            }
            return '';
          },
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
      },
    };
  }

  reasonDistribution: any = {};

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

    this.reasonDistribution = this.goamlService.getReasonDistribution(
      this.dateRange.start,
      this.dateRange.end
    );

    const reasons = Object.keys(this.reasonDistribution);
    const totals = reasons.map(reason => this.reasonDistribution[reason].total);

    // Colors for different reasons
    const colors = [
      '#ff6384',
      '#36a2eb',
      '#ffce56',
      '#4bc0c0',
      '#9966ff',
      '#ff9f40',
      '#c9cbcf',
    ];

    this.chartData = {
      labels: reasons,
      datasets: [
        {
          data: totals,
          backgroundColor: colors.slice(0, reasons.length),
          borderWidth: 0,
        },
      ],
    };

    this.loading = false;
  }
}

