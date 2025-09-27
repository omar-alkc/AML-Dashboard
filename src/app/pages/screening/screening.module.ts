import { NgModule } from '@angular/core';
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
import { ScreeningComponent } from './screening.component';
import { OnboardingKpisComponent } from './onboarding-kpis/onboarding-kpis.component';
import { PeriodicKpisComponent } from './periodic-kpis/periodic-kpis.component';
import { WuKpisComponent } from './wu-kpis/wu-kpis.component';
import { WalletCreationStatusComponent } from './wallet-creation-status/wallet-creation-status.component';
import { OnboardingInvestigatorPieComponent } from './onboarding-investigator-pie/onboarding-investigator-pie.component';
import { PeriodicScreeningTrendsComponent } from './periodic-screening-trends/periodic-screening-trends.component';
import { PeriodicInvestigatorPieComponent } from './periodic-investigator-pie/periodic-investigator-pie.component';
import { WuScreeningTrendsComponent } from './wu-screening-trends/wu-screening-trends.component';
import { WuInvestigatorPieComponent } from './wu-investigator-pie/wu-investigator-pie.component';
import { ScreeningFiltersComponent } from './screening-filters/screening-filters.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ThemeModule,
    RouterModule.forChild([
      {
        path: '',
        component: ScreeningComponent,
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
  declarations: [
    ScreeningComponent,
    OnboardingKpisComponent,
    PeriodicKpisComponent,
    WuKpisComponent,
    WalletCreationStatusComponent,
    OnboardingInvestigatorPieComponent,
    PeriodicScreeningTrendsComponent,
    PeriodicInvestigatorPieComponent,
    WuScreeningTrendsComponent,
    WuInvestigatorPieComponent,
    ScreeningFiltersComponent,
  ],
})
export class ScreeningModule {
}