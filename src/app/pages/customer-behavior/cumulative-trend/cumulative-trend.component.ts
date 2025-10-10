import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { CustomerBehaviorService } from '../../../@core/mock/customer-behavior.service';
import { BehaviorFilters } from '../../../@core/data/customer-behavior';

@Component({
  selector: 'ngx-cumulative-trend',
  templateUrl: './cumulative-trend.component.html',
  styleUrls: ['./cumulative-trend.component.scss'],
})
export class CumulativeTrendComponent implements OnInit, OnChanges {
  @Input() dateRange: DateRange;

  chartData: any = {};
  loading = true;
  options: any;
  
  aggregation: 'daily' | 'weekly' | 'monthly' = 'daily';

  constructor(
    private behaviorService: CustomerBehaviorService,
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
              callback: function(value) {
                return value.toLocaleString();
              },
            },
          },
        ],
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            const label = data.datasets[tooltipItem.datasetIndex].label || '';
            return label + ': ' + tooltipItem.yLabel.toLocaleString();
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

    const filters: BehaviorFilters = {
      walletType: 'All',
      transactionType: 'All',
      startDate: this.dateRange.start,
      endDate: this.dateRange.end,
    };

    const cumulativeData = this.behaviorService.getCumulativeTransactionTrend(filters, this.aggregation);

    this.chartData = {
      datasets: [
        {
          label: 'Cumulative Transaction Amount',
          data: cumulativeData.map(item => ({
            t: new Date(item.date),
            y: item.amount,
          })),
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: '#36a2eb',
          pointBackgroundColor: '#36a2eb',
        },
      ],
    };

    this.loading = false;
  }

  updateAggregation(aggregation: 'daily' | 'weekly' | 'monthly') {
    this.aggregation = aggregation;
    const unit = aggregation === 'daily' ? 'day' : aggregation === 'weekly' ? 'week' : 'month';
    this.options.scales.xAxes[0].time.unit = unit;
    this.loadData();
  }
}

