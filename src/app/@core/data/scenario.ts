export interface Scenario {
  scenario_name: string;
  short_code: string;
  category: string;
}

export abstract class ScenariosData {
  abstract data: Scenario[];
  abstract getScenarios(): Scenario[];
  abstract getScenarioByShortCode(shortCode: string): Scenario;
  abstract getScenarioCategories(): string[];
  abstract getScenariosGroupedByCategory(): { category: string; scenarios: Scenario[] }[];
}
