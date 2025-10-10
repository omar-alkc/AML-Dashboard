import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbButtonModule,
  NbSelectModule,
  NbDatepickerModule,
  NbTabsetModule,
  NbAccordionModule,
  NbSpinnerModule,
  NbAlertModule,
  NbBadgeModule,
  NbTooltipModule,
} from '@nebular/theme';
import { ChartModule } from 'angular2-chartjs';
import { NgxEchartsModule } from 'ngx-echarts';
import { ThemeModule } from '../../@theme/theme.module';

// Components
import { GoamlReportsComponent } from './goaml-reports.component';
import { GoamlFiltersComponent } from './goaml-filters/goaml-filters.component';
import { GoamlKpisComponent } from './goaml-kpis/goaml-kpis.component';
import { GoamlWorkTimelineComponent } from './goaml-work-timeline/goaml-work-timeline.component';
import { ReportsByReporterComponent } from './reports-by-reporter/reports-by-reporter.component';
import { ReportReasonsPieComponent } from './report-reasons-pie/report-reasons-pie.component';
import { WalletTypePieComponent } from './wallet-type-pie/wallet-type-pie.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ThemeModule,
    RouterModule.forChild([
      {
        path: '',
        component: GoamlReportsComponent,
      },
    ]),
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbDatepickerModule,
    NbTabsetModule,
    NbAccordionModule,
    NbSpinnerModule,
    NbAlertModule,
    NbBadgeModule,
    NbTooltipModule,
    ChartModule,
    NgxEchartsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    GoamlReportsComponent,
    GoamlFiltersComponent,
    GoamlKpisComponent,
    GoamlWorkTimelineComponent,
    ReportsByReporterComponent,
    ReportReasonsPieComponent,
    WalletTypePieComponent,
  ],
})
export class GoamlReportsModule {
}
