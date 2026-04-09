import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, MenuItem, Chip, IconButton, Tooltip,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getOrders, getRestaurants, getSuppliers, getCylinders, createOrder, updateOrderStatus, deleteOrder } from '../api';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED'];
const STATUS_COLORS = { PENDING: 'warning', CONFIRMED: 'info', DISPATCHED: 'primary', DELIVERED: 'success', CANCELLED: 'error' };
const EMPTY = { restaurantId: '', supplierId: '', cylinderId: '', quantity: 1, pricePerUnit: '', orderDate: '', expectedDeliveryDate: '', notes: '' };

export default function Orders() {
  const [rows, setRows] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getOrders(), getRestaurants(), getSuppliers(), getCylinders()])
      .then(([o, r, s, c]) => { setRows(o.data); setRestaurants(r.data); setSuppliers(s.data); setCylinders(c.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await createOrder({ ...form, quantity: +form.quantity, pricePerUnit: form.pricePerUnit ? +form.pricePerUnit : null, cylinderId: form.cylinderId || null, orderDate: form.orderDate || null, expectedDeliveryDate: form.expectedDeliveryDate || null });
      setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleAdvanceStatus = async (row) => {
    const idx = STATUS_FLOW.indexOf(row.status);
    if (idx < STATUS_FLOW.length - 1) {
      try { await updateOrderStatus(row.id, STATUS_FLOW[idx + 1]); load(); }
      catch (e) { alert(e.response?.data?.message || 'Update failed'); }
    }
  };

  const handleDelete = async () => {
    try { await deleteOrder(confirmId); setConfirmId(null); load(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const columns = [
    { key: 'restaurant.name', label: 'Restaurant', render: r => <Typography fontWeight={600} fontSize="0.875rem">{r.restaurant?.name}</Typography> },
    { key: 'supplier.name', label: 'Supplier' },
    { key: 'cylinder.type', label: 'Cylinder', render: r => r.cylinder?.type ?? '—' },
    { key: 'quantity', label: 'Qty' },
    { key: 'totalAmount', label: 'Total', render: r => r.totalAmount ? `₹${Number(r.totalAmount).toLocaleString('en-IN')}` : '—' },
    { key: 'orderDate', label: 'Order Date' },
    { key: 'expectedDeliveryDate', label: 'Expected', render: r => r.expectedDeliveryDate ?? '—' },
    { key: 'status', label: 'Status', render: r => <Chip label={r.status} color={STATUS_COLORS[r.status] || 'default'} size="small" /> },
  ];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Cylinder Orders</Typography>
          <Typography variant="body2" color="text.secondary">{rows.filter(r => r.status === 'PENDING').length} pending · {rows.length} total</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(EMPTY); setError(''); setOpen(true); }}>New Order</Button>
      </Stack>

      <DataTable columns={columns} rows={rows} loading={loading} searchKeys={['restaurant.name', 'supplier.name']}
        actions={(row) => [
          row.status !== 'DELIVERED' && row.status !== 'CANCELLED'
            ? <Tooltip title={`Advance to ${STATUS_FLOW[STATUS_FLOW.indexOf(row.status) + 1]}`} key="adv">
                <IconButton size="small" color="primary" onClick={() => handleAdvanceStatus(row)}>
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            : null,
          <Tooltip title="Delete" key="d"><IconButton size="small" color="error" onClick={() => setConfirmId(row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>,
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Cylinder Order</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField select label="Restaurant *" fullWidth value={form.restaurantId} onChange={f('restaurantId')}>
                {restaurants.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Supplier *" fullWidth value={form.supplierId} onChange={f('supplierId')}>
                {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Cylinder Type" fullWidth value={form.cylinderId} onChange={f('cylinderId')}>
                <MenuItem value="">— None —</MenuItem>
                {cylinders.map(c => <MenuItem key={c.id} value={c.id}>{c.type}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}><TextField label="Quantity *" type="number" fullWidth value={form.quantity} onChange={f('quantity')} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Price/Unit ₹" type="number" fullWidth value={form.pricePerUnit} onChange={f('pricePerUnit')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Order Date" type="date" fullWidth value={form.orderDate} onChange={f('orderDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Expected Delivery" type="date" fullWidth value={form.expectedDeliveryDate} onChange={f('expectedDeliveryDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField label="Notes" fullWidth multiline rows={2} value={form.notes} onChange={f('notes')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Placing…' : 'Place Order'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(confirmId)} title="Delete Order"
        message="Delete this order record permanently?"
        onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
    </Box>
  );
}
