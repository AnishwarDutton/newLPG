import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './utils/theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import Suppliers from './pages/Suppliers';
import Cylinders from './pages/Cylinders';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import GasUsage from './pages/GasUsage';
import Critical from './pages/Critical';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/suppliers"   element={<Suppliers />} />
            <Route path="/cylinders"   element={<Cylinders />} />
            <Route path="/inventory"   element={<Inventory />} />
            <Route path="/orders"      element={<Orders />} />
            <Route path="/gas-usage"   element={<GasUsage />} />
            <Route path="/critical"    element={<Critical />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
