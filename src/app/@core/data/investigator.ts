export interface Investigator {
  login: string;
  full_name: string;
  team: string;
}

export abstract class InvestigatorData {
  abstract data: Investigator[];
  abstract getInvestigators(): Investigator[];
  abstract getInvestigatorByLogin(login: string): Investigator;
  abstract getInvestigatorsByTeam(team: string): Investigator[];
  abstract getTeams(): string[];
}
