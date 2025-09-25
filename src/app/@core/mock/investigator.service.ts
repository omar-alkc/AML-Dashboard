import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { Investigator, InvestigatorData } from '../data/investigator';

@Injectable()
export class InvestigatorService implements InvestigatorData {
  data: Investigator[] = [];

  constructor(private http: HttpClient) {
    this.loadInvestigators();
  }

  private loadInvestigators() {
    this.http.get<Investigator[]>('assets/mock-data/investigators.json')
      .subscribe((investigators) => {
        this.data = investigators;
      });
  }

  getInvestigators(): Investigator[] {
    return this.data;
  }

  getInvestigatorByLogin(login: string): Investigator {
    return this.data.find((investigator) => investigator.login === login);
  }

  getInvestigatorsByTeam(team: string): Investigator[] {
    return this.data.filter((investigator) => investigator.team === team);
  }

  getTeams(): string[] {
    const teams = this.data.map((investigator) => investigator.team);
    return [...new Set(teams)]; // Remove duplicates
  }

  // Helper method to get display name with fallback to login
  getInvestigatorDisplayName(login: string): string {
    const investigator = this.getInvestigatorByLogin(login);
    return investigator ? investigator.full_name : login;
  }
}
