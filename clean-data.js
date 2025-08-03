#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to round to nearest cent
const roundToCents = (value) => Math.round(value * 100) / 100;

// Clean data files
const cleanDataFile = (filePath) => {
  console.log(`Cleaning ${filePath}...`);
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Clean bucket balances
    if (data.buckets) {
      Object.keys(data.buckets).forEach(bucketName => {
        const originalBalance = data.buckets[bucketName];
        data.buckets[bucketName] = roundToCents(originalBalance);
        console.log(`  ${bucketName}: ${originalBalance} → ${data.buckets[bucketName]}`);
      });
    }
    
    // Clean transaction amounts and allocations
    if (data.transactions) {
      data.transactions.forEach((transaction, index) => {
        // Clean main amount
        if (transaction.amount) {
          transaction.amount = roundToCents(transaction.amount);
        }
        
        // Clean allocations
        if (transaction.allocations) {
          Object.keys(transaction.allocations).forEach(bucketName => {
            transaction.allocations[bucketName] = roundToCents(transaction.allocations[bucketName]);
          });
        }
        
        // Clean impact values
        if (transaction.impact) {
          Object.keys(transaction.impact).forEach(bucketName => {
            transaction.impact[bucketName] = roundToCents(transaction.impact[bucketName]);
          });
        }
      });
    }
    
    // Recalculate total balance from cleaned bucket balances
    if (data.buckets) {
      const newTotalBalance = Object.values(data.buckets).reduce((sum, balance) => sum + balance, 0);
      const originalTotal = data.total_balance;
      data.total_balance = roundToCents(newTotalBalance);
      console.log(`  Total balance: ${originalTotal} → ${data.total_balance}`);
    }
    
    // Write cleaned data back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Successfully cleaned ${filePath}`);
    
    return data;
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return null;
  }
};

// Main execution
console.log('🧹 Starting data cleaning process...\n');

// Clean both data files
const publicDataPath = path.join(__dirname, 'public', 'savings_data.json');
const rootDataPath = path.join(__dirname, 'savings_data.json');

const cleanedPublicData = cleanDataFile(publicDataPath);
const cleanedRootData = cleanDataFile(rootDataPath);

// Verify the cleaning worked
if (cleanedPublicData) {
  const totalFromBuckets = Object.values(cleanedPublicData.buckets).reduce((sum, balance) => sum + balance, 0);
  console.log(`\n📊 Verification for public/savings_data.json:`);
  console.log(`  Sum of bucket balances: $${totalFromBuckets.toFixed(2)}`);
  console.log(`  Stored total balance: $${cleanedPublicData.total_balance.toFixed(2)}`);
  console.log(`  Match: ${totalFromBuckets === cleanedPublicData.total_balance ? '✅' : '❌'}`);
}

if (cleanedRootData) {
  const totalFromBuckets = Object.values(cleanedRootData.buckets).reduce((sum, balance) => sum + balance, 0);
  console.log(`\n📊 Verification for savings_data.json:`);
  console.log(`  Sum of bucket balances: $${totalFromBuckets.toFixed(2)}`);
  console.log(`  Stored total balance: $${cleanedRootData.total_balance.toFixed(2)}`);
  console.log(`  Match: ${totalFromBuckets === cleanedRootData.total_balance ? '✅' : '❌'}`);
}

console.log('\n🎉 Data cleaning complete!');