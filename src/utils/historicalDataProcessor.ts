import { Transaction } from '../types';

export interface HistoricalDataPoint {
  date: string;
  totalBalance: number;
  bucketBalances: { [bucketName: string]: number };
}

export interface BucketHistoryPoint {
  date: string;
  balance: number;
}

export const processHistoricalData = (transactions: Transaction[]): HistoricalDataPoint[] => {
  const dataPoints: HistoricalDataPoint[] = [];
  const bucketBalances: { [bucketName: string]: number } = {};
  
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Initialize all buckets to 0
  const allBuckets = new Set<string>();
  sortedTransactions.forEach(transaction => {
    if (transaction.type === 'deposit' && transaction.allocations) {
      Object.keys(transaction.allocations).forEach(bucket => allBuckets.add(bucket));
    }
    if (transaction.type === 'reallocation') {
      if (transaction.fromBucket) allBuckets.add(transaction.fromBucket);
      if (transaction.toBucket) allBuckets.add(transaction.toBucket);
    }
    if (transaction.type === 'bucket_withdrawal' && transaction.bucket) {
      allBuckets.add(transaction.bucket);
    }
    if (transaction.type === 'withdrawal' && transaction.impact) {
      Object.keys(transaction.impact).forEach(bucket => allBuckets.add(bucket));
    }
  });

  allBuckets.forEach(bucket => {
    bucketBalances[bucket] = 0;
  });

  // Process each transaction
  sortedTransactions.forEach(transaction => {
    switch (transaction.type) {
      case 'deposit':
        if (transaction.allocations) {
          Object.entries(transaction.allocations).forEach(([bucket, amount]) => {
            bucketBalances[bucket] = (bucketBalances[bucket] || 0) + amount;
          });
        }
        break;
      
      case 'reallocation':
        if (transaction.fromBucket && transaction.toBucket) {
          bucketBalances[transaction.fromBucket] -= transaction.amount;
          bucketBalances[transaction.toBucket] += transaction.amount;
        }
        break;
      
      case 'bucket_withdrawal':
        if (transaction.bucket) {
          bucketBalances[transaction.bucket] -= transaction.amount;
        }
        break;
      
      case 'withdrawal':
        if (transaction.impact) {
          Object.entries(transaction.impact).forEach(([bucket, amount]) => {
            bucketBalances[bucket] -= amount;
          });
        }
        break;
    }

    // Calculate total balance
    const totalBalance = Object.values(bucketBalances).reduce((sum, balance) => sum + balance, 0);

    // Add data point
    dataPoints.push({
      date: transaction.date,
      totalBalance,
      bucketBalances: { ...bucketBalances }
    });
  });

  return dataPoints;
};

export const getBucketHistory = (
  historicalData: HistoricalDataPoint[], 
  bucketName: string
): BucketHistoryPoint[] => {
  return historicalData.map(point => ({
    date: point.date,
    balance: point.bucketBalances[bucketName] || 0
  }));
};

export const formatDateForChart = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
};