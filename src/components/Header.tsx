import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  History as HistoryIcon,
  SwapHoriz as SwapIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  currentView: 'dashboard' | 'buckets' | 'history';
  onViewChange: (view: 'dashboard' | 'buckets' | 'history') => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onReallocate: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onDeposit,
  onWithdraw,
  onReallocate,
}) => {
  const { mode, toggleTheme } = useTheme();
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 0,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            💰 Savings Buckets
          </Typography>
          
          <ToggleButtonGroup
            value={currentView}
            exclusive
            onChange={(_, value) => value && onViewChange(value)}
            size="small"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              '& .MuiToggleButton-root': {
                border: 'none',
                color: 'white',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                },
              },
            }}
          >
            <ToggleButton value="dashboard">
              <DashboardIcon sx={{ mr: 1 }} />
              Dashboard
            </ToggleButton>
            <ToggleButton value="buckets">
              <CategoryIcon sx={{ mr: 1 }} />
              Buckets
            </ToggleButton>
            <ToggleButton value="history">
              <HistoryIcon sx={{ mr: 1 }} />
              History
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onDeposit}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            Deposit
          </Button>
          <Button
            variant="contained"
            startIcon={<RemoveIcon />}
            onClick={onWithdraw}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            Withdraw
          </Button>
          <Button
            variant="contained"
            startIcon={<SwapIcon />}
            onClick={onReallocate}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            Reallocate
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;