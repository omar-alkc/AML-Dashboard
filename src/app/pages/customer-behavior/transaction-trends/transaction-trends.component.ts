import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { CustomerBehaviorService } from '../../../@core/mock/customer-behavior.service';
import { BehaviorFilters } from '../../../@core/data/customer-behavior';
import { DataProcessingService } from '../../../@core/utils/data-processing.service';

@Component({
  selector: 'ngx-transaction-trends',
  templateUrl: './transaction-trends.component.html',
  styleUrls: ['./transaction-trends.component.scss'],
})
export class TransactionTrendsComponent implements OnInit, OnChanges {
  @Input() dateRange: DateRange;

  chartData: any = {};
  loading = true;
  options: any;
  
  metric = 'amount'; // 'amount' or 'count'
  aggregation = 'weekly'; // 'weekly' or 'monthly'

  constructor(
    private behaviorService: CustomerBehaviorService,
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
              unit: 'week',
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

    const filters: BehaviorFilters = {
      walletType: 'All',
      transactionType: 'All',
      startDate: this.dateRange.start,
      endDate: this.dateRange.end,
    };

    const transactions = this.behaviorService.getTransactionsByFilters(filters);

    // Separate credit and debit transactions
    const creditTypes = ['Cash In', 'Domestic Transfer', 'Western Union Transfer'];
    const debitTypes = ['Cash Out', 'Merchant Payment', 'Merchant Payment Gateway', 'E-goods'];

    const creditTransactions = transactions.filter(t => creditTypes.includes(t.transaction_type));
    const debitTransactions = transactions.filter(t => debitTypes.includes(t.transaction_type));

    // Prepare data points
    const creditData = creditTransactions.map(t => ({
      date: t.transaction_date,
      value: this.metric === 'amount' ? t.amount : 1,
    }));

    const debitData = debitTransactions.map(t => ({
      date: t.transaction_date,
      value: this.metric === 'amount' ? t.amount : 1,
    }));

    // Group by time buckets
    const bucketSize = this.aggregation === 'weekly' ? 'week' : 'month';
    const creditTimeseries = this.dataProcessingService.groupTimeseriesByBucket(
      creditData,
      bucketSize as any,
      'value',
    );

    const debitTimeseries = this.dataProcessingService.groupTimeseriesByBucket(
      debitData,
      bucketSize as any,
      'value',
    );

    // Calculate averages
    const creditAvg = creditTimeseries.map(item => ({
      ...item,
      value: this.metric === 'count' ? item.value : item.value,
    }));

    const debitAvg = debitTimeseries.map(item => ({
      ...item,
      value: this.metric === 'count' ? item.value : item.value,
    }));

    // Prepare datasets
    this.chartData = {
      datasets: [
        {
          label: this.metric === 'amount' ? 'Avg. Credit Amount' : 'Credit Count',
          data: creditAvg.map(item => ({
            t: new Date(item.date),
            y: item.value,
          })),
          fill: false,
          borderColor: '#00d68f',
          pointBackgroundColor: '#00d68f',
        },
        {
          label: this.metric === 'amount' ? 'Avg. Debit Amount' : 'Debit Count',
          data: debitAvg.map(item => ({
            t: new Date(item.date),
            y: item.value,
          })),
          fill: false,
          borderColor: '#ff3d71',
          pointBackgroundColor: '#ff3d71',
        },
      ],
    };

    this.loading = false;
  }

  updateMetric(metric: 'amount' | 'count') {
    this.metric = metric;
    this.loadData();
  }

  updateAggregation(aggregation: 'weekly' | 'monthly') {
    this.aggregation = aggregation;
    this.options.scales.xAxes[0].time.unit = aggregation === 'weekly' ? 'week' : 'month';
    this.loadData();
  }
}

