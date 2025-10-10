import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CustomerBehaviorData, CustomerTransaction, BehaviorFilters, BehaviorKPIs } from '../data/customer-behavior';

@Injectable()
export class CustomerBehaviorService extends CustomerBehaviorData {
  private transactions: CustomerTransaction[] = [];

  constructor() {
    super();
    this.generateMockData();
  }

  private generateMockData() {
    const walletTypes = ['Individual Permanent', 'Business', 'Agent', 'Merchant', 'Corporate'];
    const transactionTypes = [
      'Domestic Transfer',
      'Western Union Transfer',
      'Cash In',
      'Cash Out',
      'Merchant Payment',
      'Merchant Payment Gateway',
      'E-goods',
    ];
    const governorates = [
      'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea',
      'Beheira', 'Fayoum', 'Gharbia', 'Ismailia', 'Monufia',
      'Minya', 'Qalyubia', 'New Valley', 'Suez', 'Aswan',
    ];

    // Generate transactions for the last 90 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    let id = 1;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Vary transaction count by day (weekends less busy)
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const transactionsPerDay = isWeekend ? 5 + Math.floor(Math.random() * 5) : 10 + Math.floor(Math.random() * 10);

      for (let i = 0; i < transactionsPerDay; i++) {
        const walletType = walletTypes[Math.floor(Math.random() * walletTypes.length)];
        const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        
        // Generate realistic amounts based on wallet type
        let amount: number;
        switch (walletType) {
          case 'Individual Permanent':
            amount = Math.floor(Math.random() * 5000) + 100;
            break;
          case 'Business':
            amount = Math.floor(Math.random() * 50000) + 5000;
            break;
          case 'Agent':
            amount = Math.floor(Math.random() * 10000) + 1000;
            break;
          case 'Merchant':
            amount = Math.floor(Math.random() * 3000) + 100;
            break;
          case 'Corporate':
            amount = Math.floor(Math.random() * 200000) + 10000;
            break;
          default:
            amount = 1000;
        }

        // Generate realistic transaction time (business hours more common)
        const hour = Math.random() < 0.7 
          ? 9 + Math.floor(Math.random() * 9) // 9 AM - 5 PM (70% of transactions)
          : Math.floor(Math.random() * 24);   // Any time (30% of transactions)
        
        const minute = Math.floor(Math.random() * 60);
        const second = Math.floor(Math.random() * 60);
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

        const transaction: CustomerTransaction = {
          id: `TXN${id.toString().padStart(5, '0')}`,
          wallet_id: `W${Math.floor(Math.random() * 100).toString().padStart(4, '0')}`,
          wallet_type: walletType as any,
          transaction_type: transactionType as any,
          amount: amount,
          transaction_date: d.toISOString().split('T')[0],
          transaction_time: time,
          creditor_governorate: governorates[Math.floor(Math.random() * governorates.length)],
          debtor_governorate: governorates[Math.floor(Math.random() * governorates.length)],
        };

        this.transactions.push(transaction);
        id++;
      }
    }
  }

  getTransactions(startDate: string, endDate: string): CustomerTransaction[] {
    return this.transactions.filter(t => 
      t.transaction_date >= startDate && t.transaction_date <= endDate
    );
  }

  getTransactionsByFilters(filters: BehaviorFilters): CustomerTransaction[] {
    return this.transactions.filter(t => {
      const dateMatch = t.transaction_date >= filters.startDate && t.transaction_date <= filters.endDate;
      const walletMatch = !filters.walletType || filters.walletType === 'All' || t.wallet_type === filters.walletType;
      const transactionMatch = !filters.transactionType || filters.transactionType === 'All' || t.transaction_type === filters.transactionType;
      
      return dateMatch && walletMatch && transactionMatch;
    });
  }

  getKPIs(filters: BehaviorFilters): BehaviorKPIs {
    const transactions = this.getTransactionsByFilters(filters);
    
    // Separate by transaction direction (credit = Cash In, debit = Cash Out, Transfer)
    const creditTypes = ['Cash In', 'Domestic Transfer', 'Western Union Transfer'];
    const debitTypes = ['Cash Out', 'Merchant Payment', 'Merchant Payment Gateway', 'E-goods'];
    
    const creditTransactions = transactions.filter(t => creditTypes.includes(t.transaction_type));
    const debitTransactions = transactions.filter(t => debitTypes.includes(t.transaction_type));

    const avgCreditAmount = creditTransactions.length > 0
      ? creditTransactions.reduce((sum, t) => sum + t.amount, 0) / creditTransactions.length
      : 0;

    const avgDebitAmount = debitTransactions.length > 0
      ? debitTransactions.reduce((sum, t) => sum + t.amount, 0) / debitTransactions.length
      : 0;

    const maxCreditAmount = creditTransactions.length > 0
      ? Math.max(...creditTransactions.map(t => t.amount))
      : 0;

    const maxDebitAmount = debitTransactions.length > 0
      ? Math.max(...debitTransactions.map(t => t.amount))
      : 0;

    return {
      avgCreditAmount: Math.round(avgCreditAmount),
      avgCreditCount: creditTransactions.length,
      maxCreditAmount: maxCreditAmount,
      avgDebitAmount: Math.round(avgDebitAmount),
      avgDebitCount: debitTransactions.length,
      maxDebitAmount: maxDebitAmount,
    };
  }

  getHourlyDistribution(filters: BehaviorFilters): { hour: number; count: number }[] {
    const transactions = this.getTransactionsByFilters(filters);
    const hourly = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));

    transactions.forEach(t => {
      const hour = parseInt(t.transaction_time.split(':')[0]);
      hourly[hour].count++;
    });

    return hourly;
  }

  getAmountDistribution(filters: BehaviorFilters): { range: string; count: number }[] {
    const transactions = this.getTransactionsByFilters(filters);
    
    if (transactions.length === 0) {
      return [];
    }

    // Define amount ranges
    const ranges = [
      { min: 0, max: 500, label: '0-500' },
      { min: 500, max: 1000, label: '500-1K' },
      { min: 1000, max: 5000, label: '1K-5K' },
      { min: 5000, max: 10000, label: '5K-10K' },
      { min: 10000, max: 25000, label: '10K-25K' },
      { min: 25000, max: 50000, label: '25K-50K' },
      { min: 50000, max: 100000, label: '50K-100K' },
      { min: 100000, max: Infinity, label: '100K+' },
    ];

    return ranges.map(range => ({
      range: range.label,
      count: transactions.filter(t => t.amount >= range.min && t.amount < range.max).length,
    }));
  }

  getTopGovernorates(filters: BehaviorFilters, type: 'creditor' | 'debtor', metric: 'count' | 'amount'): any[] {
    const transactions = this.getTransactionsByFilters(filters);
    const field = type === 'creditor' ? 'creditor_governorate' : 'debtor_governorate';
    
    const governorateMap = new Map<string, { count: number; amount: number }>();

    transactions.forEach(t => {
      const gov = t[field];
      if (!governorateMap.has(gov)) {
        governorateMap.set(gov, { count: 0, amount: 0 });
      }
      const data = governorateMap.get(gov)!;
      data.count++;
      data.amount += t.amount;
    });

    const result = Array.from(governorateMap.entries())
      .map(([gov, data]) => ({
        governorate: gov,
        value: metric === 'count' ? data.count : data.amount,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return result;
  }

  getCumulativeTransactionTrend(filters: BehaviorFilters, aggregation: 'daily' | 'weekly' | 'monthly'): any[] {
    const transactions = this.getTransactionsByFilters(filters);
    
    // Sort by date
    transactions.sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());

    const dataMap = new Map<string, number>();
    let cumulativeAmount = 0;

    transactions.forEach(t => {
      let key: string;
      const date = new Date(t.transaction_date);
      
      if (aggregation === 'daily') {
        key = t.transaction_date;
      } else if (aggregation === 'weekly') {
        // Get week start (Monday)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
        key = weekStart.toISOString().split('T')[0];
      } else {
        // Monthly
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-01`;
      }

      cumulativeAmount += t.amount;
      dataMap.set(key, cumulativeAmount);
    });

    return Array.from(dataMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

