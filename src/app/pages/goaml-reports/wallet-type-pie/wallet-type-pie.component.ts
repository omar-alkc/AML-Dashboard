import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { GoAmlReportService } from '../../../@core/mock/goaml-report.service';

@Component({
  selector: 'ngx-wallet-type-pie',
  templateUrl: './wallet-type-pie.component.html',
  styleUrls: ['./wallet-type-pie.component.scss'],
})
export class WalletTypePieComponent implements OnInit, OnChanges {
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
            const walletTypeDistribution = this.walletTypeDistribution;
            const walletType = data.labels[tooltipItem.index];
            if (walletTypeDistribution[walletType] && walletTypeDistribution[walletType].byType) {
              const breakdown = [];
              for (const type in walletTypeDistribution[walletType].byType) {
                breakdown.push(`  ${type}: ${walletTypeDistribution[walletType].byType[type]}`);
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

  walletTypeDistribution: any = {};

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

    this.walletTypeDistribution = this.goamlService.getWalletTypeDistribution(
      this.dateRange.start,
      this.dateRange.end
    );

    const walletTypes = Object.keys(this.walletTypeDistribution);
    const totals = walletTypes.map(type => this.walletTypeDistribution[type].total);

    // Colors for different wallet types
    const colors = [
      '#4bc0c0',
      '#ff9f40',
      '#9966ff',
      '#36a2eb',
      '#ff6384',
    ];

    this.chartData = {
      labels: walletTypes,
      datasets: [
        {
          data: totals,
          backgroundColor: colors.slice(0, walletTypes.length),
          borderWidth: 0,
        },
      ],
    };

    this.loading = false;
  }
}

