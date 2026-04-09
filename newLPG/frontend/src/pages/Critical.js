import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, Grid,
  Alert, Chip, LinearProgress, Button
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getCriticalInventory } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Critical() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getCriticalInventory().then(r => setItems(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const urgency = (item) => {
    if (item.fullCylinders === 0) return { label: 'OUT OF STOCK', color: '#EF4444', bg: '#EF444415' };
    if (item.fullCylinders === 1) return { label: 'EXTREMELY LOW', color: '#F97316', bg: '#F9731615' };
    return { label: 'LOW STOCK', color: '#F59E0B', bg: '#F59E0B15' };
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <WarningAmberIcon sx={{ color: 'error.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>Critical Stock Alerts</Typography>
            <Typography variant="body2" color="text.secondary">Restaurants below minimum stock level</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<RefreshIcon />} onClick={load} variant="outlined" color="inherit">Refresh</Button>
          <Button variant="contained" onClick={() => navigate('/orders')}>Place Orders</Button>
        </Stack>
      </Stack>

      {!loading && items.length === 0 && (
        <Alert severity="success" sx={{ fontSize: '0.9rem' }}>
          🎉 All restaurants have sufficient stock. No critical alerts at this time.
        </Alert>
      )}

      <Grid container spacing={2}>
        {items.map(item => {
          const u = urgency(item);
          const pct = Math.min(100, (item.fullCylinders / (item.minimumStockLevel * 3)) * 100);
          return (
            <Grid item xs={12} sm={6} lg={4} key={item.id}>
              <Card sx={{ border: `1px solid ${u.color}40`, background: u.bg }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{item.restaurant?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.restaurant?.city}</Typography>
                    </Box>
                    <Chip label={u.label} size="small" sx={{ background: u.color + '22', color: u.color, fontWeight: 700, fontSize: '0.65rem' }} />
                  </Stack>

                  <Typography variant="caption" color="text.secondary">Cylinder: {item.cylinder?.type}</Typography>

                  <Stack direction="row" alignItems="baseline" spacing={0.5} my={1}>
                    <Typography variant="h3" fontWeight={800} fontFamily="Syne, sans-serif" sx={{ color: u.color, lineHeight: 1 }}>
                      {item.fullCylinders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">/ {item.minimumStockLevel} min</Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{ height: 6, borderRadius: 3, mb: 1.5, '& .MuiLinearProgress-bar': { background: u.color } }}
                  />

                  <Stack direction="row" spacing={2}>
                    <Box><Typography variant="caption" color="text.secondary">Empty</Typography><Typography variant="body2" fontWeight={600}>{item.emptyCylinders}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">On Order</Typography><Typography variant="body2" fontWeight={600}>{item.onOrderCylinders}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">Min Level</Typography><Typography variant="body2" fontWeight={600}>{item.minimumStockLevel}</Typography></Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
