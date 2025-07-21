import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { SavingsData } from '../types';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  data: SavingsData;
  onAddTransaction: (transaction: any) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  open,
  onClose,
  type,
  data,
  onAddTransaction,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('');
  const [transactionType, setTransactionType] = useState<'general' | 'specific'>('general');

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    if (type === 'deposit') {
      const allocations: Record<string, number> = {};
      const totalAllocation = data.buckets.reduce((sum, bucket) => sum + bucket.allocation, 0);
      
      data.buckets.forEach(bucket => {
        const scaledAllocation = (bucket.allocation / totalAllocation) * 100;
        allocations[bucket.name] = numAmount * (scaledAllocation / 100);
      });

      onAddTransaction({
        type: 'deposit',
        amount: numAmount,
        allocations,
      });
    } else {
      if (transactionType === 'general') {
        const impact: Record<string, number> = {};
        data.buckets.forEach(bucket => {
          const proportion = bucket.balance / data.totalBalance;
          impact[bucket.name] = numAmount * proportion;
        });

        onAddTransaction({
          type: 'withdrawal',
          amount: numAmount,
          impact,
        });
      } else {
        onAddTransaction({
          type: 'bucket_withdrawal',
          amount: numAmount,
          bucket: selectedBucket,
        });
      }
    }

    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setSelectedBucket('');
    setTransactionType('general');
    onClose();
  };

  const isValidAmount = () => {
    const numAmount = parseFloat(amount);
    if (type === 'withdraw' && transactionType === 'general') {
      return numAmount > 0 && numAmount <= data.totalBalance;
    }
    if (type === 'withdraw' && transactionType === 'specific' && selectedBucket) {
      const bucket = data.buckets.find(b => b.name === selectedBucket);
      return numAmount > 0 && bucket && numAmount <= bucket.balance;
    }
    return numAmount > 0;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {type === 'deposit' ? '💰 Make a Deposit' : '💸 Withdraw Funds'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {type === 'withdraw' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Withdrawal Type
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="General Withdrawal"
                  variant={transactionType === 'general' ? 'filled' : 'outlined'}
                  onClick={() => setTransactionType('general')}
                  color="primary"
                />
                <Chip
                  label="From Specific Bucket"
                  variant={transactionType === 'specific' ? 'filled' : 'outlined'}
                  onClick={() => setTransactionType('specific')}
                  color="primary"
                />
              </Box>
            </Box>
          )}

          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{ startAdornment: '$' }}
            sx={{ mb: 2 }}
          />

          {type === 'withdraw' && transactionType === 'specific' && (
            <FormControl fullWidth>
              <InputLabel>Select Bucket</InputLabel>
              <Select
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value)}
                label="Select Bucket"
              >
                {data.buckets.map((bucket) => (
                  <MenuItem key={bucket.id} value={bucket.name}>
                    {bucket.name} - ${bucket.balance.toLocaleString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <AnimatePresence>
            {amount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Preview
                  </Typography>
                  {type === 'deposit' && (
                    <Box>
                      {data.buckets.map((bucket) => {
                        const totalAllocation = data.buckets.reduce((sum, b) => sum + b.allocation, 0);
                        const scaledAllocation = (bucket.allocation / totalAllocation) * 100;
                        const allocationAmount = parseFloat(amount) * (scaledAllocation / 100);
                        return (
                          <Box key={bucket.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{bucket.name}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              +${allocationAmount.toFixed(2)}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                  {type === 'withdraw' && transactionType === 'general' && (
                    <Typography variant="body2">
                      Will withdraw proportionally from all buckets
                    </Typography>
                  )}
                  {type === 'withdraw' && transactionType === 'specific' && selectedBucket && (
                    <Typography variant="body2">
                      Will withdraw from {selectedBucket}
                    </Typography>
                  )}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {type === 'withdraw' && transactionType === 'general' && parseFloat(amount) > data.totalBalance && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Insufficient funds. Available: ${data.totalBalance.toLocaleString()}
            </Alert>
          )}
          {type === 'withdraw' && transactionType === 'specific' && selectedBucket && parseFloat(amount) > 0 && (
            (() => {
              const bucket = data.buckets.find(b => b.name === selectedBucket);
              return bucket && parseFloat(amount) > bucket.balance ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Insufficient funds in {selectedBucket}. Available: ${bucket.balance.toLocaleString()}
                </Alert>
              ) : null;
            })()
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!amount || !isValidAmount()}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          {type === 'deposit' ? 'Deposit' : 'Withdraw'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionModal;