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
  ],
})
export class ScreeningModule {
}
