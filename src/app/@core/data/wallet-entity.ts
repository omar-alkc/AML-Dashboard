export type WalletType = 'actor' | 'merchant' | 'agent' | 'company';

export interface Wallet {
  id: number;
  wallet_type: WalletType;
  created_at: string;
}

export abstract class WalletData {
  abstract data: Wallet[];
  abstract getWallets(): Wallet[];
  abstract getWalletsByType(type: WalletType): Wallet[];
  abstract getWalletsByDateRange(start: string, end: string): Wallet[];
  abstract getWalletCount(start: string, end: string): number;
  abstract getWalletCountByType(start: string, end: string): { [key in WalletType]: number };
}
