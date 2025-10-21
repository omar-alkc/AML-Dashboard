import { Injectable } from '@angular/core';
import { ChartInfo, PageInfo } from '../components/page-info-modal/page-info-modal.component';

@Injectable({
  providedIn: 'root'
})
export class PageInfoService {

  getPageInfo(pageName: string): PageInfo {
    switch (pageName) {
      case 'sc-portal':
        return this.getSCPortalInfo();
      case 'screening':
        return this.getScreeningInfo();
      case 'aml-monitoring':
        return this.getAMLMonitoringInfo();
      case 'customer-behavior':
        return this.getCustomerBehaviorInfo();
      case 'goaml-reports':
        return this.getGoAMLReportsInfo();
      default:
        return this.getDefaultInfo();
    }
  }

  private getSCPortalInfo(): PageInfo {
    return {
      pageTitle: 'SC Portal Dashboard',
      sections: [
        {
          sectionTitle: 'Key Performance Indicators',
          charts: [
            {
              title: 'PEPs KPIs',
              description: 'Politically Exposed Persons (PEPs) key performance indicators showing total forms, completion rates, and average processing times for PEP screening activities.'
            },
            {
              title: 'WU Beneficiary KPIs',
              description: 'Western Union beneficiary screening metrics including total beneficiaries screened, approval rates, and processing efficiency indicators.'
            },
            {
              title: 'Suspicious Activity KPIs',
              description: 'Suspicious activity monitoring metrics tracking total reports filed, investigation completion rates, and average resolution times.'
            }
          ]
        },
        {
          sectionTitle: 'Forms and Processing Analytics',
          charts: [
            {
              title: 'Forms Sent per Time',
              description: 'Timeline visualization showing the volume of forms sent to customers over time, with options to view daily, weekly, or monthly trends.'
            },
            {
              title: 'Status Distribution',
              description: 'Pie chart displaying the distribution of form statuses (pending, completed, rejected) across different form types (PEPs, WU, Suspicious Activity).'
            },
            {
              title: 'Customer Response Time',
              description: 'Trend analysis of customer response times to forms, helping identify bottlenecks and improve customer experience.'
            },
            {
              title: 'Forms by Type',
              description: 'Distribution of different form types showing the proportion of PEPs, WU Beneficiary, and Suspicious Activity forms in the system.'
            }
          ]
        },
        {
          sectionTitle: 'Investigator Performance',
          charts: [
            {
              title: 'Investigator Response Time',
              description: '7-day rolling average of investigator response times, tracking how quickly investigators process and respond to forms.'
            },
            {
              title: 'Investigator Performance Heatmap',
              description: 'Visual heatmap showing investigator workload distribution and performance metrics across different time periods.'
            },
            {
              title: 'Form Status per Time',
              description: 'Timeline showing how form statuses change over time for different form types, helping track processing efficiency.'
            }
          ]
        }
      ]
    };
  }

  private getScreeningInfo(): PageInfo {
    return {
      pageTitle: 'AML Screening Dashboard',
      sections: [
        {
          sectionTitle: 'Screening KPIs',
          charts: [
            {
              title: 'On-boarding KPIs',
              description: 'Key performance indicators for customer onboarding screening processes, including total screenings, completion rates, and average processing times.'
            },
            {
              title: 'Periodic Screening KPIs',
              description: 'Metrics for periodic customer screening activities, tracking regular review cycles and compliance with screening requirements.'
            },
            {
              title: 'WU Add Beneficiary KPIs',
              description: 'Performance indicators for Western Union beneficiary addition screening, monitoring approval rates and processing efficiency.'
            }
          ]
        },
        {
          sectionTitle: 'Screening Work Analytics',
          charts: [
            {
              title: 'Screening Work per Time',
              description: 'Timeline visualization of screening workload over time, showing daily, weekly, or monthly screening activity patterns.'
            },
            {
              title: 'Screening Work by Investigator',
              description: 'Distribution of screening work among investigators, showing workload allocation and individual performance metrics.'
            },
            {
              title: 'Periodic Screening Work per Time',
              description: 'Specific timeline for periodic screening activities, tracking regular review cycles and compliance patterns.'
            },
            {
              title: 'WU Add Beneficiary Screening Work per Time',
              description: 'Timeline analysis of Western Union beneficiary screening activities, monitoring processing volumes and efficiency.'
            }
          ]
        }
      ]
    };
  }

  private getAMLMonitoringInfo(): PageInfo {
    return {
      pageTitle: 'AML Transaction Monitoring Dashboard',
      sections: [
        {
          sectionTitle: 'Monitoring KPIs',
          charts: [
            {
              title: 'AML KPIs',
              description: 'Anti-Money Laundering key performance indicators including total alerts generated, resolution rates, and compliance metrics.'
            }
          ]
        },
        {
          sectionTitle: 'Alert Management',
          charts: [
            {
              title: 'Pending Alerts per Scenario',
              description: 'Current pending alerts categorized by detection scenario, showing workload distribution and priority areas.'
            },
            {
              title: 'Created vs Processed per Scenario',
              description: 'Comparison of alert creation versus processing rates across different detection scenarios, indicating system efficiency.'
            },
            {
              title: 'Alert Trends over Time',
              description: 'Historical analysis of alert generation patterns, helping identify trends and seasonal variations in suspicious activity.'
            },
            {
              title: 'Detection Distribution',
              description: 'Distribution of different types of detections and their current status, providing overview of alert categorization.'
            },
            {
              title: 'Alerts Trends by Scenario',
              description: 'Detailed breakdown of alert trends for each detection scenario, enabling targeted analysis of specific risk areas.'
            },
            {
              title: 'Detection Status per Scenario',
              description: 'Status distribution of detections across different scenarios, showing processing progress and bottlenecks.'
            }
          ]
        },
        {
          sectionTitle: 'Investigator Performance',
          charts: [
            {
              title: 'Investigator Performance',
              description: 'Heatmap visualization of investigator performance metrics, showing workload distribution and efficiency across the team.'
            },
            {
              title: 'Delayed Alerts by Investigator',
              description: 'Analysis of delayed alerts by investigator, helping identify training needs and workload optimization opportunities.'
            }
          ]
        },
        {
          sectionTitle: 'Detection Analysis',
          charts: [
            {
              title: 'Detection Classification per Time',
              description: 'Timeline analysis of detection classifications over time, tracking how different types of detections are categorized and processed.'
            },
            {
              title: 'Detection Classification',
              description: 'Current distribution of detection classifications, showing the breakdown of different types of identified risks.'
            },
            {
              title: 'Cash Out Changed Profiles per Time',
              description: 'Timeline tracking of cash out profile changes, monitoring customer behavior modifications that may indicate suspicious activity.'
            },
            {
              title: 'Cash Out Profiles Distribution',
              description: 'Distribution of different cash out profile types, providing insights into customer transaction patterns and risk profiles.'
            }
          ]
        }
      ]
    };
  }

  private getCustomerBehaviorInfo(): PageInfo {
    return {
      pageTitle: 'Customer Behavior Analytics',
      sections: [
        {
          sectionTitle: 'Behavior KPIs',
          charts: [
            {
              title: 'Behavior KPIs',
              description: 'Customer behavior analytics key performance indicators including transaction volumes, frequency metrics, and behavioral pattern indicators.'
            }
          ]
        },
        {
          sectionTitle: 'Transaction Analytics',
          charts: [
            {
              title: 'Transaction Trends',
              description: 'Historical analysis of transaction patterns over time, showing volume trends and identifying seasonal or cyclical behaviors.'
            },
            {
              title: 'Cumulative Transaction Trend',
              description: 'Cumulative view of transaction activity, providing insights into overall growth patterns and long-term behavioral trends.'
            },
            {
              title: 'Transaction Amount Distribution',
              description: 'Distribution analysis of transaction amounts, helping identify typical spending patterns and outlier transactions.'
            },
            {
              title: 'Hourly Transaction Frequency',
              description: 'Analysis of transaction timing patterns throughout the day, identifying peak usage hours and customer behavior patterns.'
            }
          ]
        },
        {
          sectionTitle: 'Geographic Analysis',
          charts: [
            {
              title: 'Top Governorates (Creditor)',
              description: 'Geographic distribution of creditor transactions by governorate, showing regional transaction patterns and economic activity.'
            },
            {
              title: 'Top Governorates (Debtor)',
              description: 'Geographic distribution of debtor transactions by governorate, providing insights into regional payment patterns and economic flows.'
            }
          ]
        }
      ]
    };
  }

  private getGoAMLReportsInfo(): PageInfo {
    return {
      pageTitle: 'GoAML Reports Dashboard',
      sections: [
        {
          sectionTitle: 'Reporting KPIs',
          charts: [
            {
              title: 'GoAML KPIs',
              description: 'GoAML reporting key performance indicators including total reports filed, submission rates, and compliance metrics for regulatory reporting.'
            }
          ]
        },
        {
          sectionTitle: 'Reporting Analytics',
          charts: [
            {
              title: 'GoAML Reporting Work per Time',
              description: 'Timeline analysis of GoAML reporting activities, showing submission patterns and workload distribution over time.'
            },
            {
              title: 'Sent GoAML Reports by Reporter',
              description: 'Distribution of GoAML reports by reporter, showing individual contribution levels and workload allocation across the team.'
            },
            {
              title: 'Report Reasons Distribution',
              description: 'Breakdown of report submission reasons, categorizing the types of suspicious activities being reported to regulatory authorities.'
            },
            {
              title: 'Reported Wallet Type Distribution',
              description: 'Distribution of wallet types involved in reported transactions, providing insights into the types of financial instruments being monitored.'
            }
          ]
        }
      ]
    };
  }

  private getDefaultInfo(): PageInfo {
    return {
      pageTitle: 'Dashboard Information',
      sections: [
        {
          sectionTitle: 'General Information',
          charts: [
            {
              title: 'Dashboard Overview',
              description: 'This dashboard provides comprehensive analytics and monitoring capabilities for AML (Anti-Money Laundering) operations.'
            }
          ]
        }
      ]
    };
  }
}
