import React, { useEffect, useState } from 'react';
import {
  Grid, Typography, Card, CardContent, Box, Stack,
  List, ListItem, ListItemText, ListItemIcon, Chip, Divider, Alert
} from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PropaneTankIcon from '@mui/icons-material/PropaneTank';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { getDashboardKpis, getMonthlyTrend, getCriticalInventory } from '../api';

const fmt = (n) => n?.toLocaleString('en-IN') ?? '0';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [trend, setTrend] = useState([]);
  const [critical, setCritical] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardKpis(),
      getMonthlyTrend(),
      getCriticalInventory(),
    ]).then(([k, t, c]) => {
      setKpis(k.data);
      setTrend(t.data.map(d => ({
        month: d.month?.slice(0, 7) ?? '',
        cylinders: Number(d.total) || 0,
      })));
      setCritical(c.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = kpis ? [
    { title: 'Active Restaurants', value: kpis.activeRestaurants, subtitle: `${kpis.totalRestaurants} total`, icon: <RestaurantIcon />, color: '#F59E0B' },
    { title: 'Full Cylinders', value: fmt(kpis.totalFullCylinders), subtitle: 'Across all locations', icon: <PropaneTankIcon />, color: '#10B981' },
    { title: 'Pending Orders', value: kpis.pendingOrders, subtitle: 'Awaiting delivery', icon: <ShoppingCartIcon />, color: kpis.pendingOrders > 0 ? '#F97316' : '#10B981' },
    { title: 'Weekly Gas Usage', value: fmt(kpis.weeklyGasUsage), subtitle: `${fmt(kpis.monthlyGasUsage)} this month`, icon: <WhatshotIcon />, color: '#3B82F6' },
    { title: 'Critical Alerts', value: kpis.criticalStockCount, subtitle: 'Below minimum stock', icon: <WarningAmberIcon />, color: kpis.criticalStockCount > 0 ? '#EF4444' : '#10B981' },
    { title: 'Monthly Spend', value: `₹${fmt(kpis.monthlySpend)}`, subtitle: 'This month orders', icon: <CurrencyRupeeIcon />, color: '#8B5CF6' },
  ] : [];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
      </Stack>

      {/* KPI Cards */}
      <Grid container spacing={2} mb={3}>
        {loading
          ? Array(6).fill(0).map((_, i) => (
              <Grid item xs={12} sm={6} lg={4} key={i}>
                <Card sx={{ height: 110 }} />
              </Grid>
            ))
          : cards.map((c) => (
              <Grid item xs={12} sm={6} lg={4} key={c.title}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                      <Box>
                        <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em" fontWeight={600}>
                          {c.title}
                        </Typography>
                        <Typography variant="h4" fontWeight={800} fontFamily="Syne, sans-serif" sx={{ mt: 0.5, lineHeight: 1.1 }}>
                          {c.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {c.subtitle}
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: 44, height: 44, borderRadius: 2.5,
                        background: `${c.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: c.color, flexShrink: 0,
                      }}>
                        {c.icon}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
        }
      </Grid>

      <Grid container spacing={3}>
        {/* Usage Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Gas Usage Trend (6 months)</Typography>
              {trend.length === 0
                ? <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No usage data yet</Typography>
                  </Box>
                : <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={trend}>
                      <defs>
                        <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <RechartTooltip
                        contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                        labelStyle={{ color: '#F5F5F5' }}
                      />
                      <Area type="monotone" dataKey="cylinders" stroke="#F59E0B" strokeWidth={2} fill="url(#usageGrad)" name="Cylinders Used" />
                    </AreaChart>
                  </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Critical Alerts Panel */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <WarningAmberIcon sx={{ color: 'error.main', fontSize: 20 }} />
                <Typography variant="h6" fontWeight={600}>Critical Stock</Typography>
                {critical.length > 0 && (
                  <Chip label={critical.length} color="error" size="small" sx={{ ml: 'auto' }} />
                )}
              </Stack>
              {critical.length === 0
                ? <Alert severity="success" sx={{ fontSize: '0.8rem' }}>
                    All inventory levels are healthy ✓
                  </Alert>
                : <List dense disablePadding>
                    {critical.map((inv, i) => (
                      <React.Fragment key={inv.id}>
                        {i > 0 && <Divider sx={{ my: 0.5 }} />}
                        <ListItem disablePadding sx={{ py: 0.8 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <WarningAmberIcon sx={{ color: 'error.main', fontSize: 18 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={inv.restaurant?.name}
                            secondary={`${inv.fullCylinders} left · min ${inv.minimumStockLevel} · ${inv.cylinder?.type}`}
                            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                            secondaryTypographyProps={{ fontSize: '0.75rem' }}
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
