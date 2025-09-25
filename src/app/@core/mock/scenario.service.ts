import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { Scenario, ScenariosData } from '../data/scenario';

@Injectable()
export class ScenarioService implements ScenariosData {
  data: Scenario[] = [];

  constructor(private http: HttpClient) {
    this.loadScenarios();
  }

  private loadScenarios() {
    this.http.get<Scenario[]>('assets/mock-data/scenarios.json')
      .subscribe((scenarios) => {
        this.data = scenarios;
      });
  }

  getScenarios(): Scenario[] {
    return this.data;
  }

  getScenarioByShortCode(shortCode: string): Scenario {
    return this.data.find((scenario) => scenario.short_code === shortCode);
  }

  getScenarioCategories(): string[] {
    const categories = this.data.map((scenario) => scenario.category);
    return [...new Set(categories)]; // Remove duplicates
  }

  getScenariosGroupedByCategory(): { category: string; scenarios: Scenario[] }[] {
    const categories = this.getScenarioCategories();
    
    return categories.map((category) => {
      return {
        category: category,
        scenarios: this.data.filter((scenario) => scenario.category === category),
      };
    });
  }
}
