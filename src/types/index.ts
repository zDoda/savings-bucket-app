export interface Bucket {
  id: string;
  name: string;
  balance: number;
  allocation: number;
  color: string;
  goal: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'reallocation' | 'bucket_withdrawal';
  amount: number;
  details?: string;
  fromBucket?: string;
  toBucket?: string;
  bucket?: string;
  allocations?: Record<string, number>;
  impact?: Record<string, number>;
}

export interface SavingsData {
  totalBalance: number;
  buckets: Bucket[];
  transactions: Transaction[];
}