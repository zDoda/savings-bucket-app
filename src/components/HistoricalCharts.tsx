import React, { useState } from 'react';
import { formatCurrency } from '../utils/currency';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { SavingsData } from '../types';
import { 
  HistoricalDataPoint, 
  getBucketHistory, 
  formatDateForChart 
} from '../utils/historicalDataProcessor';

interface HistoricalChartsProps {
  data: SavingsData;
  historicalData: HistoricalDataPoint[];
}

const HistoricalCharts: React.FC<HistoricalChartsProps> = ({ data, historicalData }) => {
  const [selectedBucket, setSelectedBucket] = useState<string>(data.buckets[0]?.name || '');
  const [chartType, setChartType] = useState<'total' | 'bucket'>('total');

  if (historicalData.length === 0) {
    return (
      <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Historical Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No historical data available. Start making transactions to see your savings grow over time!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for total balance chart
  const totalBalanceData = historicalData.map(point => ({
    date: formatDateForChart(point.date),
    fullDate: point.date,
    balance: Math.round(point.totalBalance * 100) / 100,
  }));

  // Prepare data for bucket balance chart
  const bucketHistoryData = getBucketHistory(historicalData, selectedBucket).map(point => ({
    date: formatDateForChart(point.date),
    fullDate: point.date,
    balance: Math.round(point.balance * 100) / 100,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {new Date(data.fullDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
          <Typography variant="body2" color="primary.main">
            Balance: ${formatCurrency(payload[0].value)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Grid container spacing={3}>
      {/* Chart Type Toggle */}
      <Grid size={12}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Historical Balance Tracking
                </Typography>
                <ToggleButtonGroup
                  value={chartType}
                  exclusive
                  onChange={(_, value) => value && setChartType(value)}
                  size="small"
                >
                  <ToggleButton value="total">
                    Total Balance
                  </ToggleButton>
                  <ToggleButton value="bucket">
                    Bucket Balance
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {chartType === 'bucket' && (
                <Box sx={{ mb: 3 }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Select Bucket</InputLabel>
                    <Select
                      value={selectedBucket}
                      label="Select Bucket"
                      onChange={(e) => setSelectedBucket(e.target.value)}
                    >
                      {data.buckets.map((bucket) => (
                        <MenuItem key={bucket.id} value={bucket.name}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: bucket.color,
                              }}
                            />
                            {bucket.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartType === 'total' ? totalBalanceData : bucketHistoryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="currentColor"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="currentColor"
                      fontSize={12}
                      tickFormatter={(value) => `$${formatCurrency(value)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke={chartType === 'total' ? '#667eea' : data.buckets.find(b => b.name === selectedBucket)?.color || '#667eea'}
                      strokeWidth={3}
                      dot={{ fill: chartType === 'total' ? '#667eea' : data.buckets.find(b => b.name === selectedBucket)?.color || '#667eea', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: chartType === 'total' ? '#667eea' : data.buckets.find(b => b.name === selectedBucket)?.color || '#667eea', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              {/* Summary Stats */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {chartType === 'total' ? (
                  <>
                    <Chip
                      label={`Current: $${formatCurrency(data.totalBalance)}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`Peak: $${formatCurrency(Math.max(...totalBalanceData.map(d => d.balance)))}`}
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      label={`${totalBalanceData.length} transactions`}
                      color="info"
                      variant="outlined"
                    />
                  </>
                ) : (
                  <>
                    <Chip
                      label={`Current: $${formatCurrency(data.buckets.find(b => b.name === selectedBucket)?.balance || 0)}`}
                      sx={{ 
                        backgroundColor: data.buckets.find(b => b.name === selectedBucket)?.color + '20',
                        color: data.buckets.find(b => b.name === selectedBucket)?.color,
                        borderColor: data.buckets.find(b => b.name === selectedBucket)?.color,
                      }}
                      variant="outlined"
                    />
                    <Chip
                      label={`Peak: $${formatCurrency(Math.max(...bucketHistoryData.map(d => d.balance)))}`}
                      color="success"
                      variant="outlined"
                    />
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    </Grid>
  );
};

export default HistoricalCharts;