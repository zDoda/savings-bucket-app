import React from 'react';
import { formatCurrency } from '../utils/currency';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Paper,
  Fade,
} from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowUpward, ArrowDownward, SwapHoriz, History } from '@mui/icons-material';
import { Transaction, SavingsData } from '../types';

interface TransactionHistoryProps {
  data: SavingsData;
  onBack: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ data, onBack }) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpward sx={{ color: '#4caf50' }} />;
      case 'withdrawal':
      case 'bucket_withdrawal':
        return <ArrowDownward sx={{ color: '#f44336' }} />;
      case 'reallocation':
        return <SwapHoriz sx={{ color: '#ff9800' }} />;
      default:
        return <History sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'success';
      case 'withdrawal':
      case 'bucket_withdrawal':
        return 'error';
      case 'reallocation':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatTransactionDetails = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return 'Deposited to various buckets';
      case 'withdrawal':
        return 'Withdrawn proportionally from all buckets';
      case 'bucket_withdrawal':
        return `Withdrawn from ${transaction.bucket}`;
      case 'reallocation':
        return `Moved from ${transaction.fromBucket} to ${transaction.toBucket}`;
      default:
        return transaction.details || '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <History sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Transaction History
            </Typography>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Box sx={{ py: 4, color: 'text.secondary' }}>
                            <History sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6">No transactions yet</Typography>
                            <Typography variant="body2">
                              Your transaction history will appear here
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.transactions.map((transaction, index) => (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getTransactionIcon(transaction.type)}
                              <Chip
                                label={transaction.type.replace('_', ' ').toUpperCase()}
                                size="small"
                                color={getTransactionColor(transaction.type) as any}
                                variant="outlined"
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                color: transaction.type.includes('withdrawal') ? 'error.main' : 'success.main',
                                fontWeight: 'bold',
                              }}
                            >
                              {transaction.type.includes('withdrawal') ? '-' : '+'}$
                              {formatCurrency(transaction.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatTransactionDetails(transaction)}</TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Fade>
  );
};

export default TransactionHistory;