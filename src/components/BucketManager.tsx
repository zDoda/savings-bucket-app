import React, { useState } from 'react';
import { formatCurrency } from '../utils/currency';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { SavingsData, Bucket } from '../types';

interface BucketManagerProps {
  data: SavingsData;
  onAddBucket: (name: string, allocation: number, goal?: number) => void;
  onUpdateBucket: (id: string, updates: Partial<Bucket>) => void;
  onDeleteBucket: (id: string) => void;
}

const BucketManager: React.FC<BucketManagerProps> = ({
  data,
  onAddBucket,
  onUpdateBucket,
  onDeleteBucket,
}) => {
  const [open, setOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<Bucket | null>(null);
  const [formData, setFormData] = useState({ name: '', allocation: 0, goal: 0 });

  const totalAllocation = data.buckets.reduce((sum, bucket) => sum + bucket.allocation, 0);

  const handleSubmit = () => {
    const goalValue = formData.goal || (100000 * (formData.allocation / 100));
    if (editingBucket) {
      onUpdateBucket(editingBucket.id, { ...formData, goal: goalValue });
    } else {
      onAddBucket(formData.name, formData.allocation, goalValue);
    }
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBucket(null);
    setFormData({ name: '', allocation: 0, goal: 0 });
  };

  const handleEdit = (bucket: Bucket) => {
    setEditingBucket(bucket);
    setFormData({ name: bucket.name, allocation: bucket.allocation, goal: bucket.goal || 0 });
    setOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Manage Buckets
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            Add Bucket
          </Button>
        </Box>

        {totalAllocation !== 100 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Total allocation should equal 100%. Current: {totalAllocation}%
          </Alert>
        )}

        <Grid container spacing={3}>
          {data.buckets.map((bucket, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={bucket.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    borderLeft: `4px solid ${bucket.color}`,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {bucket.name}
                      </Typography>
                      <Box>
                        <IconButton onClick={() => handleEdit(bucket)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => onDeleteBucket(bucket.id)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                      ${formatCurrency(bucket.balance)}
                    </Typography>

                    {bucket.goal && (
                      <Box sx={{ mb: 2 }}>
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

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Allocation
                      </Typography>
                      <Chip
                        label={`${bucket.allocation}%`}
                        size="small"
                        sx={{
                          backgroundColor: bucket.color,
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBucket ? 'Edit Bucket' : 'Add New Bucket'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Bucket Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Allocation %"
              type="number"
              value={formData.allocation}
              onChange={(e) => {
                const allocation = Number(e.target.value);
                const autoGoal = 100000 * (allocation / 100);
                setFormData({ 
                  ...formData, 
                  allocation,
                  goal: formData.goal === 0 ? autoGoal : formData.goal
                });
              }}
              inputProps={{ min: 0, max: 100 }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Goal Amount ($)"
              type="number"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: Number(e.target.value) })}
              inputProps={{ min: 0 }}
              helperText={`Auto-calculated: $${formatCurrency(100000 * (formData.allocation / 100))}`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || formData.allocation <= 0}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            {editingBucket ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BucketManager;