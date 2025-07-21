import { useState, useEffect } from 'react';
import { SavingsData, Bucket, Transaction } from '../types';
import { processHistoricalData, HistoricalDataPoint } from '../utils/historicalDataProcessor';

const STORAGE_KEY = 'savings-bucket-data';

const generateId = () => Math.random().toString(36).substring(2, 11);

// Load historical data from JSON file
const loadHistoricalData = async (): Promise<SavingsData | null> => {
  try {
    const response = await fetch('/savings_data.json');
    if (!response.ok) return null;
    
    const historicalData = await response.json();
    
    // Convert historical format to current format
    const buckets: Bucket[] = Object.entries(historicalData.buckets).map(([name, balance], index) => ({
      id: generateId(),
      name,
      balance: balance as number,
      allocation: 10, // Default allocation, will be updated from config
      color: `hsl(${(index * 360) / Object.keys(historicalData.buckets).length}, 70%, 60%)`,
      goal: 100000 * 0.1 // Default goal based on 10% allocation
    }));

    // Convert transactions to current format
    const transactions: Transaction[] = historicalData.transactions.map((tx: any) => ({
      id: generateId(),
      date: tx.date,
      type: tx.type,
      amount: tx.amount,
      fromBucket: tx.from_bucket,
      toBucket: tx.to_bucket,
      bucket: tx.bucket,
      allocations: tx.allocations,
      impact: tx.impact
    }));

    return {
      totalBalance: historicalData.total_balance,
      buckets,
      transactions
    };
  } catch (error) {
    console.error('Failed to load historical data:', error);
    return null;
  }
};

// Load allocation config
const loadAllocationConfig = async (): Promise<{ allocations: Record<string, number>; goals: Record<string, number> } | null> => {
  try {
    const response = await fetch('/savings_config.json');
    if (!response.ok) return null;
    const config = await response.json();
    return {
      allocations: config.allocations,
      goals: config.goals || {}
    };
  } catch (error) {
    console.error('Failed to load allocation config:', error);
    return null;
  }
};

const defaultData: SavingsData = {
  totalBalance: 0,
  buckets: [],
  transactions: [],
};

export const useSavingsData = () => {
  const [data, setData] = useState<SavingsData>(defaultData);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      // Try to load from localStorage first
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          // Add backward compatibility for goal property
          const updatedData = {
            ...parsedData,
            buckets: parsedData.buckets.map((bucket: any) => ({
              ...bucket,
              goal: bucket.goal || (100000 * (bucket.allocation / 100))
            }))
          };
          setData(updatedData);
          setHistoricalData(processHistoricalData(updatedData.transactions));
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Failed to parse saved data:', error);
        }
      }

      // Load historical data from JSON files
      const [loadedData, config] = await Promise.all([
        loadHistoricalData(),
        loadAllocationConfig()
      ]);

      if (loadedData) {
        // Update allocations and goals if config is available
        if (config) {
          loadedData.buckets = loadedData.buckets.map(bucket => {
            const allocation = config.allocations[bucket.name] || 10;
            const configGoal = config.goals[bucket.name];
            return {
              ...bucket,
              allocation,
              goal: configGoal || (100000 * (allocation / 100))
            };
          });
        }
        
        setData(loadedData);
        setHistoricalData(processHistoricalData(loadedData.transactions));
      } else {
        setData(defaultData);
        setHistoricalData([]);
      }
      
      setIsLoading(false);
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setHistoricalData(processHistoricalData(data.transactions));
    }
  }, [data, isLoading]);

  const addBucket = (name: string, allocation: number, goal?: number) => {
    const newBucket: Bucket = {
      id: generateId(),
      name,
      balance: 0,
      allocation,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      goal: goal || (100000 * (allocation / 100)),
    };
    setData(prev => ({
      ...prev,
      buckets: [...prev.buckets, newBucket],
    }));
  };

  const updateBucket = (id: string, updates: Partial<Bucket>) => {
    setData(prev => ({
      ...prev,
      buckets: prev.buckets.map(bucket =>
        bucket.id === id ? { ...bucket, ...updates } : bucket
      ),
    }));
  };

  const deleteBucket = (id: string) => {
    setData(prev => ({
      ...prev,
      buckets: prev.buckets.filter(bucket => bucket.id !== id),
    }));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      date: new Date().toISOString(),
    };

    setData(prev => {
      let newTotalBalance = prev.totalBalance;
      let newBuckets = [...prev.buckets];

      if (transaction.type === 'deposit') {
        newTotalBalance += transaction.amount;
        if (transaction.allocations) {
          newBuckets = newBuckets.map(bucket => ({
            ...bucket,
            balance: bucket.balance + (transaction.allocations![bucket.name] || 0),
          }));
        }
      } else if (transaction.type === 'withdrawal') {
        newTotalBalance -= transaction.amount;
        if (transaction.impact) {
          newBuckets = newBuckets.map(bucket => ({
            ...bucket,
            balance: bucket.balance - (transaction.impact![bucket.name] || 0),
          }));
        }
      } else if (transaction.type === 'bucket_withdrawal' && transaction.bucket) {
        newTotalBalance -= transaction.amount;
        newBuckets = newBuckets.map(bucket =>
          bucket.name === transaction.bucket
            ? { ...bucket, balance: bucket.balance - transaction.amount }
            : bucket
        );
      } else if (transaction.type === 'reallocation' && transaction.fromBucket && transaction.toBucket) {
        newBuckets = newBuckets.map(bucket => {
          if (bucket.name === transaction.fromBucket) {
            return { ...bucket, balance: bucket.balance - transaction.amount };
          }
          if (bucket.name === transaction.toBucket) {
            return { ...bucket, balance: bucket.balance + transaction.amount };
          }
          return bucket;
        });
      }

      return {
        totalBalance: newTotalBalance,
        buckets: newBuckets,
        transactions: [newTransaction, ...prev.transactions],
      };
    });
  };

  return {
    data,
    historicalData,
    isLoading,
    addBucket,
    updateBucket,
    deleteBucket,
    addTransaction,
  };
};