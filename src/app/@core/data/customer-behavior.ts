export interface CustomerTransaction {
  id: string;
  wallet_id: string;
  wallet_type: 'Individual Permanent' | 'Business' | 'Agent' | 'Merchant' | 'Corporate';
  transaction_type: 'Domestic Transfer' | 'Western Union Transfer' | 'Cash In' | 'Cash Out' | 'Merchant Payment' | 'Merchant Payment Gateway' | 'E-goods';
  amount: number;
  transaction_date: string;
  transaction_time: string;
  creditor_governorate: string;
  debtor_governorate: string;
}

export interface BehaviorFilters {
  walletType?: string;
  transactionType?: string;
  startDate: string;
  endDate: string;
}

export interface BehaviorKPIs {
  avgCreditAmount: number;
  avgCreditCount: number;
  maxCreditAmount: number;
  avgDebitAmount: number;
  avgDebitCount: number;
  maxDebitAmount: number;
}

export abstract class CustomerBehaviorData {
  abstract getTransactions(startDate: string, endDate: string): CustomerTransaction[];
  abstract getTransactionsByFilters(filters: BehaviorFilters): CustomerTransaction[];
  abstract getKPIs(filters: BehaviorFilters): BehaviorKPIs;
}

