import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { GoAmlReportService } from '../../../@core/mock/goaml-report.service';

@Component({
  selector: 'ngx-reports-by-reporter',
  templateUrl: './reports-by-reporter.component.html',
  styleUrls: ['./reports-by-reporter.component.scss'],
})
export class ReportsByReporterComponent implements OnInit, OnChanges {
  @Input() dateRange: DateRange;

  chartData: any = {};
  loading = true;
  options: any;

  constructor(private goamlService: GoAmlReportService) {
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

    const reportsByReporter = this.goamlService.getReportsByReporter(
      this.dateRange.start,
      this.dateRange.end
    );

    // Get unique report types and reporters
    const reportTypes = ['SAR', 'STR', 'CTR'];
    const reporters = Object.keys(reportsByReporter);

    // Colors for different reporters
    const colors = [
      '#ff6384',
      '#36a2eb',
      '#ffce56',
      '#4bc0c0',
      '#9966ff',
      '#ff9f40',
    ];

    // Create datasets for each reporter
    const datasets = reporters.map((reporter, index) => {
      return {
        label: reporter,
        data: reportTypes.map(type => reportsByReporter[reporter][type] || 0),
        backgroundColor: colors[index % colors.length],
      };
    });

    this.chartData = {
      labels: reportTypes,
      datasets: datasets,
    };

    this.loading = false;
  }
}

