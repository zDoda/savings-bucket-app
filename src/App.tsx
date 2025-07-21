import React, { useState } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import BucketManager from './components/BucketManager';
import TransactionModal from './components/TransactionModal';
import ReallocationModal from './components/ReallocationModal';
import TransactionHistory from './components/TransactionHistory';
import Header from './components/Header';
import { useSavingsData } from './hooks/useSavingsData';
import { CustomThemeProvider } from './contexts/ThemeContext';

function App() {
  const { data, historicalData, isLoading, addBucket, updateBucket, deleteBucket, addTransaction } = useSavingsData();
  const [currentView, setCurrentView] = useState<'dashboard' | 'buckets' | 'history'>('dashboard');
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [reallocationModalOpen, setReallocationModalOpen] = useState(false);

  const handleOpenTransactionModal = (type: 'deposit' | 'withdraw') => {
    setTransactionType(type);
    setTransactionModalOpen(true);
  };

  const handleReallocate = (fromBucket: string, toBucket: string, amount: number) => {
    addTransaction({
      type: 'reallocation',
      amount,
      fromBucket,
      toBucket,
    });
  };

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <CustomThemeProvider>
      <Box sx={{ minHeight: '100vh' }}>
        <Header 
          currentView={currentView}
          onViewChange={setCurrentView}
          onDeposit={() => handleOpenTransactionModal('deposit')}
          onWithdraw={() => handleOpenTransactionModal('withdraw')}
          onReallocate={() => setReallocationModalOpen(true)}
        />
        
        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.3 }}
              >
                <Dashboard
                  data={data}
                  historicalData={historicalData}
                  isLoading={isLoading}
                  onDeposit={() => handleOpenTransactionModal('deposit')}
                  onWithdraw={() => handleOpenTransactionModal('withdraw')}
                  onManageBuckets={() => setCurrentView('buckets')}
                />
              </motion.div>
            ) : currentView === 'buckets' ? (
              <motion.div
                key="buckets"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.3 }}
              >
                <BucketManager
                  data={data}
                  onAddBucket={addBucket}
                  onUpdateBucket={updateBucket}
                  onDeleteBucket={deleteBucket}
                />
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.3 }}
              >
                <TransactionHistory
                  data={data}
                  onBack={() => setCurrentView('dashboard')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        <TransactionModal
          open={transactionModalOpen}
          onClose={() => setTransactionModalOpen(false)}
          type={transactionType}
          data={data}
          onAddTransaction={addTransaction}
        />
        <ReallocationModal
          open={reallocationModalOpen}
          onClose={() => setReallocationModalOpen(false)}
          data={data}
          onReallocate={handleReallocate}
        />
      </Box>
    </CustomThemeProvider>
  );
}

export default App;