import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, AppBar, Typography, IconButton, Divider, Chip, Badge, Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PropaneTankIcon from '@mui/icons-material/PropaneTank';
import InventoryIcon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPendingOrders, getCriticalInventory } from '../api';

const DRAWER_WIDTH = 252;
const COLLAPSED_WIDTH = 68;

const NAV_ITEMS = [
  { label: 'Dashboard',      path: '/',            icon: <DashboardIcon />,     badge: null },
  { label: 'Restaurants',    path: '/restaurants', icon: <RestaurantIcon />,    badge: null },
  { label: 'Suppliers',      path: '/suppliers',   icon: <LocalShippingIcon />, badge: null },
  { label: 'Cylinders',      path: '/cylinders',   icon: <PropaneTankIcon />,   badge: null },
  { label: 'Inventory',      path: '/inventory',   icon: <InventoryIcon />,     badge: null },
  { label: 'Orders',         path: '/orders',      icon: <ShoppingCartIcon />,  badge: 'pending' },
  { label: 'Gas Usage',      path: '/gas-usage',   icon: <WhatshotIcon />,      badge: null },
  { label: 'Critical Stock', path: '/critical',    icon: <WarningAmberIcon />,  badge: 'critical' },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    const poll = () => {
      getPendingOrders().then(r => setPendingCount(r.data.length)).catch(() => {});
      getCriticalInventory().then(r => setCriticalCount(r.data.length)).catch(() => {});
    };
    poll();
    const id = setInterval(poll, 60000);
    return () => clearInterval(id);
  }, []);

  const getBadgeCount = (badge) => {
    if (badge === 'pending') return pendingCount;
    if (badge === 'critical') return criticalCount;
    return 0;
  };

  const drawerContent = (isCollapsed) => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#111', overflow: 'hidden' }}>
      
      {/* Logo + Toggle */}
      <Box sx={{
        px: isCollapsed ? 1 : 2,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        minHeight: 64,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2, flexShrink: 0,
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LocalFireDepartmentIcon sx={{ color: '#0A0A0A', fontSize: 20 }} />
          </Box>
          {!isCollapsed && (
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} noWrap>LPG Manager</Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1} noWrap>Restaurant System</Typography>
            </Box>
          )}
        </Box>

        {/* Toggle button — always visible */}
        <Tooltip title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            size="small"
            sx={{
              ml: isCollapsed ? 0 : 1,
              flexShrink: 0,
              color: 'rgba(255,255,255,0.4)',
              '&:hover': { color: '#F59E0B', background: 'rgba(245,158,11,0.1)' },
            }}
          >
            {isCollapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Nav Items */}
      <List sx={{ px: isCollapsed ? 0.75 : 1.5, py: 1.5, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const count = getBadgeCount(item.badge);

          const button = (
            <ListItemButton
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                borderRadius: 2,
                px: isCollapsed ? 1 : 1.5,
                py: 1,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                background: active ? 'rgba(245,158,11,0.12)' : 'transparent',
                '&:hover': { background: active ? 'rgba(245,158,11,0.16)' : 'rgba(255,255,255,0.05)' },
              }}
            >
              <ListItemIcon sx={{
                minWidth: isCollapsed ? 0 : 36,
                color: active ? '#F59E0B' : 'rgba(255,255,255,0.5)',
                '& svg': { fontSize: 20 },
                justifyContent: 'center',
              }}>
                {count > 0
                  ? <Badge badgeContent={count} color={item.badge === 'critical' ? 'error' : 'warning'} max={99}>
                      {item.icon}
                    </Badge>
                  : item.icon
                }
              </ListItemIcon>

              {!isCollapsed && (
                <>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 400,
                      color: active ? '#F59E0B' : 'rgba(255,255,255,0.75)',
                    }}
                  />
                  {count > 0 && (
                    <Chip
                      label={count}
                      size="small"
                      color={item.badge === 'critical' ? 'error' : 'warning'}
                      sx={{ height: 18, fontSize: '0.65rem', ml: 0.5 }}
                    />
                  )}
                </>
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              {isCollapsed
                ? <Tooltip title={item.label} placement="right" arrow>{button}</Tooltip>
                : button
              }
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      <Box sx={{ p: isCollapsed ? 1 : 2, display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
        {!isCollapsed && (
          <Typography variant="caption" color="text.secondary">DBMS Mini Project · 2026</Typography>
        )}
      </Box>
    </Box>
  );

  const currentDrawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const transitionStyle = (theme) => theme.transitions.create(['width', 'margin', 'flex-shrink'], {
    easing: theme.transitions.easing.sharp,
    duration: 280,
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* Mobile AppBar */}
      <AppBar
        position="fixed"
        sx={{ display: { sm: 'none' }, background: '#111', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Toolbar>
          <IconButton color="inherit" onClick={() => setMobileOpen(true)} edge="start" sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <LocalFireDepartmentIcon sx={{ color: '#F59E0B', mr: 1 }} />
          <Typography variant="h6" fontWeight={700}>LPG Manager</Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
        }}
      >
        {drawerContent(false)}
      </Drawer>

      {/* Desktop Drawer — animates open/closed */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: currentDrawerWidth,
          flexShrink: 0,
          transition: transitionStyle,
          '& .MuiDrawer-paper': {
            width: currentDrawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflowX: 'hidden',
            transition: transitionStyle,
          },
        }}
      >
        {drawerContent(collapsed)}
      </Drawer>

      {/* Main Content — expands when sidebar collapses */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: { xs: 7, md: 0 },
          minHeight: '100vh',
          background: '#0D0D0D',
          overflow: 'auto',
          minWidth: 0,
          transition: transitionStyle,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
