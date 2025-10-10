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
  NbSpinnerModule,
  NbTooltipModule,
} from '@nebular/theme';
import { ChartModule } from 'angular2-chartjs';
import { NgxEchartsModule } from 'ngx-echarts';
import { ThemeModule } from '../../@theme/theme.module';

// Components
import { CustomerBehaviorComponent } from './customer-behavior.component';
import { BehaviorFiltersComponent } from './behavior-filters/behavior-filters.component';
import { BehaviorKpisComponent } from './behavior-kpis/behavior-kpis.component';
import { TransactionTrendsComponent } from './transaction-trends/transaction-trends.component';
import { CumulativeTrendComponent } from './cumulative-trend/cumulative-trend.component';
import { AmountDistributionComponent } from './amount-distribution/amount-distribution.component';
import { HourlyFrequencyComponent } from './hourly-frequency/hourly-frequency.component';
import { TopGovernoratesCreditorComponent } from './top-governorates-creditor/top-governorates-creditor.component';
import { TopGovernoratesDebtorComponent } from './top-governorates-debtor/top-governorates-debtor.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ThemeModule,
    RouterModule.forChild([
      {
        path: '',
        component: CustomerBehaviorComponent,
      },
    ]),
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbButtonModule,
    NbSelectModule,
    NbDatepickerModule,
    NbSpinnerModule,
    NbTooltipModule,
    ChartModule,
    NgxEchartsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    CustomerBehaviorComponent,
    BehaviorFiltersComponent,
    BehaviorKpisComponent,
    TransactionTrendsComponent,
    CumulativeTrendComponent,
    AmountDistributionComponent,
    HourlyFrequencyComponent,
    TopGovernoratesCreditorComponent,
    TopGovernoratesDebtorComponent,
  ],
})
export class CustomerBehaviorModule { }

