import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbAuthModule, NbDummyAuthStrategy } from '@nebular/auth';
import { NbSecurityModule, NbRoleProvider } from '@nebular/security';
import { NbThemeModule, NbCardModule, NbIconModule, NbButtonModule, NbDialogModule } from '@nebular/theme';
import { of as observableOf } from 'rxjs';

import { throwIfAlreadyLoaded } from './module-import-guard';
import {
  AnalyticsService,
  LayoutService,
  PlayerService,
  SeoService,
  StateService,
  CacheService,
  DateRangeService,
  DataProcessingService,
} from './utils';
import { UserData } from './data/users';
import { ElectricityData } from './data/electricity';
import { SmartTableData } from './data/smart-table';
import { UserActivityData } from './data/user-activity';
import { OrdersChartData } from './data/orders-chart';
import { ProfitChartData } from './data/profit-chart';
import { TrafficListData } from './data/traffic-list';
import { EarningData } from './data/earning';
import { OrdersProfitChartData } from './data/orders-profit-chart';
import { TrafficBarData } from './data/traffic-bar';
import { ProfitBarAnimationChartData } from './data/profit-bar-animation-chart';
import { TemperatureHumidityData } from './data/temperature-humidity';
import { SolarData } from './data/solar';
import { TrafficChartData } from './data/traffic-chart';
import { StatsBarData } from './data/stats-bar';
import { CountryOrderData } from './data/country-order';
import { StatsProgressBarData } from './data/stats-progress-bar';
import { VisitorsAnalyticsData } from './data/visitors-analytics';
import { SecurityCamerasData } from './data/security-cameras';

import { UserService } from './mock/users.service';
import { ElectricityService } from './mock/electricity.service';
import { SmartTableService } from './mock/smart-table.service';
import { UserActivityService } from './mock/user-activity.service';
import { OrdersChartService } from './mock/orders-chart.service';
import { ProfitChartService } from './mock/profit-chart.service';
import { TrafficListService } from './mock/traffic-list.service';
import { EarningService } from './mock/earning.service';
import { OrdersProfitChartService } from './mock/orders-profit-chart.service';
import { TrafficBarService } from './mock/traffic-bar.service';
import { ProfitBarAnimationChartService } from './mock/profit-bar-animation-chart.service';
import { TemperatureHumidityService } from './mock/temperature-humidity.service';
import { SolarService } from './mock/solar.service';
import { TrafficChartService } from './mock/traffic-chart.service';
import { StatsBarService } from './mock/stats-bar.service';
import { CountryOrderService } from './mock/country-order.service';
import { StatsProgressBarService } from './mock/stats-progress-bar.service';
import { VisitorsAnalyticsService } from './mock/visitors-analytics.service';
import { SecurityCamerasService } from './mock/security-cameras.service';
import { MockDataModule } from './mock/mock-data.module';

// Page Info Modal Component
import { PageInfoModalComponent } from './components/page-info-modal/page-info-modal.component';
import { PageInfoService } from './data/page-info.service';

// AML Data Abstracts
import { DetectionsData } from './data/detection';
import { ScreeningData } from './data/screening';
import { GoAmlReportData } from './data/goaml-report';

// AML Mock Services
import { DetectionService } from './mock/detection.service';
import { ScreeningService } from './mock/screening.service';
import { GoAmlReportService } from './mock/goaml-report.service';
import { ScPortalService } from './mock/sc-portal.service';

// AML HTTP Services
import { HttpDetectionService } from './services/http/http-detection.service';
import { HttpScreeningService } from './services/http/http-screening.service';
import { HttpGoAmlReportService } from './services/http/http-goaml-report.service';

// Data Source Provider
import { DataSourceProvider } from './services/data-source-provider.service';
import { environment } from '../../environments/environment';

const socialLinks = [
  {
    url: 'https://github.com/akveo/nebular',
    target: '_blank',
    icon: 'github',
  },
  {
    url: 'https://www.facebook.com/akveo/',
    target: '_blank',
    icon: 'facebook',
  },
  {
    url: 'https://twitter.com/akveo_inc',
    target: '_blank',
    icon: 'twitter',
  },
];

const DATA_SERVICES = [
  { provide: UserData, useClass: UserService },
  { provide: ElectricityData, useClass: ElectricityService },
  { provide: SmartTableData, useClass: SmartTableService },
  { provide: UserActivityData, useClass: UserActivityService },
  { provide: OrdersChartData, useClass: OrdersChartService },
  { provide: ProfitChartData, useClass: ProfitChartService },
  { provide: TrafficListData, useClass: TrafficListService },
  { provide: EarningData, useClass: EarningService },
  { provide: OrdersProfitChartData, useClass: OrdersProfitChartService },
  { provide: TrafficBarData, useClass: TrafficBarService },
  { provide: ProfitBarAnimationChartData, useClass: ProfitBarAnimationChartService },
  { provide: TemperatureHumidityData, useClass: TemperatureHumidityService },
  { provide: SolarData, useClass: SolarService },
  { provide: TrafficChartData, useClass: TrafficChartService },
  { provide: StatsBarData, useClass: StatsBarService },
  { provide: CountryOrderData, useClass: CountryOrderService },
  { provide: StatsProgressBarData, useClass: StatsProgressBarService },
  { provide: VisitorsAnalyticsData, useClass: VisitorsAnalyticsService },
  { provide: SecurityCamerasData, useClass: SecurityCamerasService },
];

// AML Data Services with Factory Providers (switch between mock and HTTP)
const AML_DATA_SERVICES = [
  // Detection Service Factory
  {
    provide: DetectionsData,
    useFactory: (provider: DataSourceProvider, httpService: HttpDetectionService, mockService: DetectionService) => {
      provider.logConfiguration();
      return provider.useBackend ? httpService : mockService;
    },
    deps: [DataSourceProvider, HttpDetectionService, DetectionService],
  },
  // Screening Service Factory
  {
    provide: ScreeningData,
    useFactory: (provider: DataSourceProvider, httpService: HttpScreeningService, mockService: ScreeningService) => {
      return provider.useBackend ? httpService : mockService;
    },
    deps: [DataSourceProvider, HttpScreeningService, ScreeningService],
  },
  // GoAML Report Service Factory
  {
    provide: GoAmlReportData,
    useFactory: (provider: DataSourceProvider, httpService: HttpGoAmlReportService, mockService: GoAmlReportService) => {
      return provider.useBackend ? httpService : mockService;
    },
    deps: [DataSourceProvider, HttpGoAmlReportService, GoAmlReportService],
  },
  // HTTP Services (needed as dependencies)
  HttpDetectionService,
  HttpScreeningService,
  HttpGoAmlReportService,
  // Mock Services (needed as dependencies)
  DetectionService,
  ScreeningService,
  GoAmlReportService,
  ScPortalService,
  // Data Source Provider
  DataSourceProvider,
];

export class NbSimpleRoleProvider extends NbRoleProvider {
  getRole() {
    // here you could provide any role based on any auth flow
    return observableOf('guest');
  }
}

export const NB_CORE_PROVIDERS = [
  ...MockDataModule.forRoot().providers,
  ...DATA_SERVICES,
  ...AML_DATA_SERVICES,
  ...NbAuthModule.forRoot({

    strategies: [
      NbDummyAuthStrategy.setup({
        name: 'email',
        delay: 3000,
      }),
    ],
    forms: {
      login: {
        socialLinks: socialLinks,
      },
      register: {
        socialLinks: socialLinks,
      },
    },
  }).providers,

  NbSecurityModule.forRoot({
    accessControl: {
      guest: {
        view: '*',
      },
      user: {
        parent: 'guest',
        create: '*',
        edit: '*',
        remove: '*',
      },
    },
  }).providers,

  {
    provide: NbRoleProvider, useClass: NbSimpleRoleProvider,
  },
  AnalyticsService,
  LayoutService,
  PlayerService,
  SeoService,
  StateService,
  CacheService,
  DateRangeService,
  DataProcessingService,
  PageInfoService,
];

@NgModule({
  imports: [
    CommonModule,
    NbThemeModule,
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbDialogModule,
  ],
  exports: [
    NbAuthModule,
    PageInfoModalComponent,
  ],
  declarations: [
    PageInfoModalComponent,
  ],
  entryComponents: [
    PageInfoModalComponent,
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }

  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        ...NB_CORE_PROVIDERS,
      ],
    };
  }
}
