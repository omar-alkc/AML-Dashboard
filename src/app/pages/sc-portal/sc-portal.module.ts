import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NbCardModule, NbIconModule, NbButtonModule, NbSpinnerModule, NbInputModule, NbDatepickerModule } from '@nebular/theme';
import { ChartModule } from 'angular2-chartjs';
import { NgxEchartsModule } from 'ngx-echarts';

import { ScPortalComponent } from './sc-portal.component';
import { ScPortalFiltersComponent } from './sc-portal-filters/sc-portal-filters.component';

// KPI Components
import { PepsKpisComponent } from './peps-kpis/peps-kpis.component';
import { WuBeneficiaryKpisComponent } from './wu-beneficiary-kpis/wu-beneficiary-kpis.component';
import { SuspiciousActivityKpisComponent } from './suspicious-activity-kpis/suspicious-activity-kpis.component';
import { OverallSummaryKpisComponent } from './overall-summary-kpis/overall-summary-kpis.component';

// Chart Components
import { FormsSentTimelineComponent } from './forms-sent-timeline/forms-sent-timeline.component';
import { FormsStatusPieComponent } from './forms-status-pie/forms-status-pie.component';
import { CustomerResponseTimeComponent } from './customer-response-time/customer-response-time.component';
import { FormsTypePieComponent } from './forms-type-pie/forms-type-pie.component';
import { InvestigatorPerformanceComponent } from './investigator-performance/investigator-performance.component';
import { InvestigatorResponseTimeComponent } from './employee-response-time/employee-response-time.component';
import { FormStatusTimelineComponent } from './form-status-timeline/form-status-timeline.component';

import { ScPortalRoutingModule } from './sc-portal-routing.module';

@NgModule({
  declarations: [
    ScPortalComponent,
    ScPortalFiltersComponent,
    PepsKpisComponent,
    WuBeneficiaryKpisComponent,
    SuspiciousActivityKpisComponent,
    OverallSummaryKpisComponent,
    FormsSentTimelineComponent,
    FormsStatusPieComponent,
    CustomerResponseTimeComponent,
    FormsTypePieComponent,
    InvestigatorPerformanceComponent,
    InvestigatorResponseTimeComponent,
    FormStatusTimelineComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbSpinnerModule,
    NbInputModule,
    NbDatepickerModule,
    ChartModule,
    NgxEchartsModule,
    ScPortalRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ScPortalModule { }
