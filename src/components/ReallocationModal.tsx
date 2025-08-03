import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/currency';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { SavingsData } from '../types';

interface ReallocationModalProps {
  open: boolean;
  onClose: () => void;
  data: SavingsData;
  onReallocate: (fromBucket: string, toBucket: string, amount: number) => void;
}

const ReallocationModal: React.FC<ReallocationModalProps> = ({
  open,
  onClose,
  data,
  onReallocate,
}) => {
  const [fromBucket, setFromBucket] = useState<string>('');
  const [toBucket, setToBucket] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [preview, setPreview] = useState<{ fromBalance: number; toBalance: number } | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (data.buckets.length > 0) {
      setFromBucket(data.buckets[0].name);
      setToBucket(data.buckets.length > 1 ? data.buckets[1].name : data.buckets[0].name);
    }
  }, [data.buckets, open]);

  useEffect(() => {
    if (fromBucket && toBucket && amount && parseFloat(amount) > 0) {
      const fromBucketData = data.buckets.find(b => b.name === fromBucket);
      const toBucketData = data.buckets.find(b => b.name === toBucket);
      
      if (fromBucketData && toBucketData) {
        const numericAmount = parseFloat(amount);
        setPreview({
          fromBalance: fromBucketData.balance - numericAmount,
          toBalance: toBucketData.balance + numericAmount,
        });
      }
    } else {
      setPreview(null);
    }
  }, [fromBucket, toBucket, amount, data.buckets]);

  const handleReallocate = () => {
    const numericAmount = parseFloat(amount);
    
    if (!fromBucket || !toBucket) {
      setError('Please select both source and destination buckets');
      return;
    }
    
    if (fromBucket === toBucket) {
      setError('Source and destination buckets must be different');
      return;
    }
    
    if (!amount || numericAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    const fromBucketData = data.buckets.find(b => b.name === fromBucket);
    if (!fromBucketData || fromBucketData.balance < numericAmount) {
      setError('Insufficient funds in source bucket');
      return;
    }
    
    onReallocate(fromBucket, toBucket, numericAmount);
    handleClose();
  };

  const handleClose = () => {
    setFromBucket('');
    setToBucket('');
    setAmount('');
    setPreview(null);
    setError('');
    onClose();
  };

  const getBucketBalance = (bucketName: string) => {
    const bucket = data.buckets.find(b => b.name === bucketName);
    return bucket ? bucket.balance : 0;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Reallocate Funds
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          <FormControl fullWidth>
            <InputLabel>From Bucket</InputLabel>
            <Select
              value={fromBucket}
              onChange={(e) => setFromBucket(e.target.value)}
              label="From Bucket"
            >
              {data.buckets.map((bucket) => (
                <MenuItem key={bucket.id} value={bucket.name}>
                  {bucket.name} (${formatCurrency(bucket.balance)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>To Bucket</InputLabel>
            <Select
              value={toBucket}
              onChange={(e) => setToBucket(e.target.value)}
              label="To Bucket"
            >
              {data.buckets
                .filter(bucket => bucket.name !== fromBucket)
                .map((bucket) => (
                  <MenuItem key={bucket.id} value={bucket.name}>
                    {bucket.name} (${formatCurrency(bucket.balance)})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            label="Amount to Reallocate"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: '$',
            }}
            helperText={`Available: $${formatCurrency(getBucketBalance(fromBucket))}`}
          />

          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card sx={{ 
                  mt: 2, 
                  backgroundColor: 'grey.50',
                  '@media (prefers-color-scheme: dark)': {
                    backgroundColor: '#424242',
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Preview
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {fromBucket} new balance:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        ${formatCurrency(preview.fromBalance)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        {toBucket} new balance:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        ${formatCurrency(preview.toBalance)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleReallocate} 
          variant="contained"
          disabled={!amount || parseFloat(amount) <= 0 || !fromBucket || !toBucket}
        >
          Reallocate Funds
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReallocationModal;