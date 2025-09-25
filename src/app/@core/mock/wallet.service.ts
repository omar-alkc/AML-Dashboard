import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { Wallet, WalletData, WalletType } from '../data/wallet-entity';

@Injectable()
export class WalletService implements WalletData {
  data: Wallet[] = [];

  constructor(private http: HttpClient) {
    this.loadWallets();
  }

  private loadWallets() {
    this.http.get<Wallet[]>('assets/mock-data/wallets.json')
      .subscribe((wallets) => {
        this.data = wallets;
      });
  }

  getWallets(): Wallet[] {
    return this.data;
  }

  getWalletsByType(type: WalletType): Wallet[] {
    return this.data.filter((wallet) => wallet.wallet_type === type);
  }

  getWalletsByDateRange(start: string, end: string): Wallet[] {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return this.data.filter((wallet) => {
      const creationDate = new Date(wallet.created_at);
      return creationDate >= startDate && creationDate <= endDate;
    });
  }

  getWalletCount(start: string, end: string): number {
    return this.getWalletsByDateRange(start, end).length;
  }

  getWalletCountByType(start: string, end: string): { [key in WalletType]: number } {
    const filtered = this.getWalletsByDateRange(start, end);
    
    const result: { [key in WalletType]: number } = {
      actor: 0,
      merchant: 0,
      agent: 0,
      company: 0,
    };
    
    filtered.forEach(wallet => {
      result[wallet.wallet_type]++;
    });
    
    return result;
  }
}
