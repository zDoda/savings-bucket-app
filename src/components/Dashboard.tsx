import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Fade,
  CircularProgress,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { SavingsData } from '../types';
import { HistoricalDataPoint } from '../utils/historicalDataProcessor';
import { formatCurrency } from '../utils/currency';
import HistoricalCharts from './HistoricalCharts';

interface DashboardProps {
  data: SavingsData;
  historicalData: HistoricalDataPoint[];
  isLoading: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
  onManageBuckets: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, historicalData, isLoading, onDeposit, onWithdraw, onManageBuckets }) => {
  const chartData = data.buckets.map(bucket => ({
    name: bucket.name,
    value: bucket.balance,
    color: bucket.color,
  }));

  const totalAllocation = data.buckets.reduce((sum, bucket) => sum + bucket.allocation, 0);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Savings Dashboard
          </Typography>
        </motion.div>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Total Balance Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
                borderRadius: 4,
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Total Balance
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ${formatCurrency(data.totalBalance)}
                  </Typography>
                  <Chip 
                    label={`${data.buckets.length} Buckets`} 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 'bold'
                    }} 
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Pie Chart */}
          <Grid size={{ xs: 12, md: 8 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card sx={{ borderRadius: 4, boxShadow: 3, height: 400 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Portfolio Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${formatCurrency(value)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Buckets Grid */}
          <Grid size={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
              Your Buckets
            </Typography>
            <Grid container spacing={3}>
              {data.buckets.map((bucket, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={bucket.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <Card 
                      sx={{ 
                        borderRadius: 3, 
                        boxShadow: 3,
                        borderLeft: `4px solid ${bucket.color}`,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-2px)' }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {bucket.name}
                          </Typography>
                          <Chip 
                            label={`${bucket.allocation}%`} 
                            size="small" 
                            sx={{ 
                              backgroundColor: bucket.color, 
                              color: 'white',
                              fontWeight: 'bold'
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                          ${formatCurrency(bucket.balance)}
                        </Typography>
                        
                        {bucket.goal && (
                          <Box sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Goal Progress
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ${formatCurrency(bucket.goal)}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min((bucket.balance / bucket.goal) * 100, 100)}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: bucket.color,
                                  borderRadius: 4,
                                },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              {Math.round((bucket.balance / bucket.goal) * 100)}% complete
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Historical Charts */}
          <Grid size={12}>
            <HistoricalCharts data={data} historicalData={historicalData} />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Dashboard;