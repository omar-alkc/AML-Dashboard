import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateRange } from '../../../@core/utils/date-range.service';
import { GoAmlReportService } from '../../../@core/mock/goaml-report.service';
import { DetectionService } from '../../../@core/mock/detection.service';
import { DataProcessingService } from '../../../@core/utils/data-processing.service';

@Component({
  selector: 'ngx-goaml-work-timeline',
  templateUrl: './goaml-work-timeline.component.html',
  styleUrls: ['./goaml-work-timeline.component.scss'],
})
export class GoamlWorkTimelineComponent implements OnInit, OnChanges {
  @Input() dateRange: DateRange;

  chartData: any = {};
  loading = true;
  options: any;
  bucketSize = 'week';

  constructor(
    private goamlService: GoAmlReportService,
    private detectionService: DetectionService,
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

    // Get data from detection service (Eastnets alerts)
    const allDetections = this.detectionService.getDetectionsByDateRange(
      this.dateRange.start,
      this.dateRange.end
    );

    // Filter for Cashout & SAR scenarios from detection data
    const cashoutSARDetections = allDetections.filter(d => 
      d.scenario_name === 'CO' || d.scenario_name === 'SAR'
    );

    // Prepare data for Cashout & SAR alerts (Eastnets)
    const cashoutSARData = cashoutSARDetections.map(d => ({
      date: d.detection_date,
      value: 1,
    }));

    // Prepare data for Sent SAR alerts (Eastnets) - processed cashout/SAR alerts
    const sentSARDetectionsData = cashoutSARDetections
      .filter(d => d.status === 'SAR Sent' || d.status === 'Suspicious Final')
      .map(d => ({
        date: d.status_change_date || d.detection_date,
        value: 1,
      }));

    // Get goAML reports data
    const reports = this.goamlService.getReportsByDateRange(
      this.dateRange.start,
      this.dateRange.end
    );

    // Prepare data for SAR reports from Google Sheet
    const sarReportsData = reports
      .filter(r => r.report_type === 'SAR' && r.source === 'Google Sheet')
      .map(r => ({
        date: r.submitted_at,
        value: 1,
      }));

    // Prepare data for STR reports from Google Sheet
    const strReportsData = reports
      .filter(r => r.report_type === 'STR' && r.source === 'Google Sheet')
      .map(r => ({
        date: r.submitted_at,
        value: 1,
      }));

    // Prepare data for CTR reports from Google Sheet
    const ctrReportsData = reports
      .filter(r => r.report_type === 'CTR' && r.source === 'Google Sheet')
      .map(r => ({
        date: r.submitted_at,
        value: 1,
      }));

    // Group by time buckets
    const cashoutSARTimeseries = this.dataProcessingService.groupTimeseriesByBucket(
      cashoutSARData,
      this.bucketSize as any,
      'value'
    );

    const sentSARTimeseries = this.dataProcessingService.groupTimeseriesByBucket(
      sentSARDetectionsData,
      this.bucketSize as any,
      'value'
    );

    const sarTimeseries = this.dataProcessingService.groupTimeseriesByBucket(
      sarReportsData,
      this.bucketSize as any,
      'value'
    );

    const strTimeseries = this.dataProcessingService.groupTimeseriesByBucket(
      strReportsData,
      this.bucketSize as any,
      'value'
    );

    const ctrTimeseries = this.dataProcessingService.groupTimeseriesByBucket(
      ctrReportsData,
      this.bucketSize as any,
      'value'
    );

    // Prepare chart datasets
    this.chartData = {
      labels: cashoutSARTimeseries.map(item => new Date(item.date)),
      datasets: [
        {
          label: 'Cashout & SAR alerts (Eastnets)',
          data: cashoutSARTimeseries.map(item => item.value),
          fill: false,
          borderColor: '#ff6384',
          pointBackgroundColor: '#ff6384',
        },
        {
          label: 'Sent SAR alerts (Eastnets)',
          data: sentSARTimeseries.map(item => item.value),
          fill: false,
          borderColor: '#36a2eb',
          pointBackgroundColor: '#36a2eb',
        },
        {
          label: 'SAR reports (Google Sheet)',
          data: sarTimeseries.map(item => item.value),
          fill: false,
          borderColor: '#4bc0c0',
          pointBackgroundColor: '#4bc0c0',
        },
        {
          label: 'STR reports (Google Sheet)',
          data: strTimeseries.map(item => item.value),
          fill: false,
          borderColor: '#ff9f40',
          pointBackgroundColor: '#ff9f40',
        },
        {
          label: 'CTR reports (Google Sheet)',
          data: ctrTimeseries.map(item => item.value),
          fill: false,
          borderColor: '#9966ff',
          pointBackgroundColor: '#9966ff',
        },
      ],
    };

    this.loading = false;
  }

  updateBucketSize(size: 'day' | 'week' | 'month') {
    this.bucketSize = size;
    this.options.scales.xAxes[0].time.unit = size;
    this.loadData();
  }
}

