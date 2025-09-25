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
import { AmlMonitoringComponent } from './aml-monitoring.component';
import { AmlKpisComponent } from './aml-kpis/aml-kpis.component';
import { AmlFiltersComponent } from './aml-filters/aml-filters.component';
import { PendingAlertsComponent } from './pending-alerts/pending-alerts.component';
import { CreatedVsProcessedComponent } from './created-vs-processed/created-vs-processed.component';
import { TimeTrendComponent } from './time-trend/time-trend.component';
import { StatusDistributionComponent } from './status-distribution/status-distribution.component';
import { StatusPerScenarioComponent } from './status-per-scenario/status-per-scenario.component';
import { AlertsTrendsScenarioComponent } from './alerts-trends-scenario/alerts-trends-scenario.component';
import { InvestigatorHeatmapComponent } from './investigator-heatmap/investigator-heatmap.component';
import { DelayedAlertsComponent } from './delayed-alerts/delayed-alerts.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ThemeModule,
    RouterModule.forChild([
      {
        path: '',
        component: AmlMonitoringComponent,
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
    AmlMonitoringComponent,
    AmlKpisComponent,
    AmlFiltersComponent,
    PendingAlertsComponent,
    CreatedVsProcessedComponent,
    TimeTrendComponent,
    StatusDistributionComponent,
    StatusPerScenarioComponent,
    AlertsTrendsScenarioComponent,
    InvestigatorHeatmapComponent,
    DelayedAlertsComponent,
  ],
})
export class AmlMonitoringModule { }
