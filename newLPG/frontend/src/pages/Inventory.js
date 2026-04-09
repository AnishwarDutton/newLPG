import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, MenuItem, Chip, IconButton, Tooltip,
  Alert, LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TuneIcon from '@mui/icons-material/Tune';
import {
  getInventory, getRestaurants, getCylinders,
  createInventory, updateInventory, adjustInventory, deleteInventory
} from '../api';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY_FORM = { restaurantId: '', cylinderId: '', fullCylinders: 0, emptyCylinders: 0, onOrderCylinders: 0, minimumStockLevel: 3 };
const EMPTY_ADJ = { fullDelta: 0, emptyDelta: 0 };

export default function Inventory() {
  const [rows, setRows] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [adjOpen, setAdjOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adjForm, setAdjForm] = useState(EMPTY_ADJ);
  const [adjId, setAdjId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getInventory(), getRestaurants(), getCylinders()])
      .then(([inv, rest, cyl]) => { setRows(inv.data); setRestaurants(rest.data); setCylinders(cyl.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setError(''); setOpen(true); };
  const openEdit = (row) => {
    setForm({ restaurantId: row.restaurant.id, cylinderId: row.cylinder.id, fullCylinders: row.fullCylinders, emptyCylinders: row.emptyCylinders, onOrderCylinders: row.onOrderCylinders, minimumStockLevel: row.minimumStockLevel });
    setEditId(row.id); setError(''); setOpen(true);
  };
  const openAdj = (row) => { setAdjId(row.id); setAdjForm(EMPTY_ADJ); setAdjOpen(true); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form, fullCylinders: +form.fullCylinders, emptyCylinders: +form.emptyCylinders, onOrderCylinders: +form.onOrderCylinders, minimumStockLevel: +form.minimumStockLevel };
      if (editId) await updateInventory(editId, payload);
      else await createInventory(payload);
      setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleAdjust = async () => {
    setSaving(true);
    try {
      await adjustInventory(adjId, { fullDelta: +adjForm.fullDelta, emptyDelta: +adjForm.emptyDelta });
      setAdjOpen(false); load();
    } catch (e) { alert(e.response?.data?.message || 'Adjust failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteInventory(confirmId); setConfirmId(null); load(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const fa = (k) => (e) => setAdjForm({ ...adjForm, [k]: e.target.value });

  const getStockStatus = (row) => {
    const pct = row.fullCylinders / Math.max(row.minimumStockLevel * 3, 1);
    if (row.fullCylinders <= row.minimumStockLevel) return { label: 'Critical', color: 'error' };
    if (pct < 1.5) return { label: 'Low', color: 'warning' };
    return { label: 'OK', color: 'success' };
  };

  const columns = [
    { key: 'restaurant.name', label: 'Restaurant', render: r => <Typography fontWeight={600} fontSize="0.875rem">{r.restaurant?.name}</Typography> },
    { key: 'cylinder.type', label: 'Cylinder' },
    { key: 'fullCylinders', label: 'Full', render: r => (
      <Stack spacing={0.5}>
        <Typography fontWeight={700} color={r.fullCylinders <= r.minimumStockLevel ? 'error.main' : 'text.primary'}>{r.fullCylinders}</Typography>
        <LinearProgress variant="determinate" value={Math.min(100, (r.fullCylinders / (r.minimumStockLevel * 4)) * 100)} color={getStockStatus(r).color} sx={{ height: 4, borderRadius: 2 }} />
      </Stack>
    )},
    { key: 'emptyCylinders', label: 'Empty' },
    { key: 'onOrderCylinders', label: 'On Order' },
    { key: 'minimumStockLevel', label: 'Min Level' },
    { key: 'status', label: 'Status', render: r => { const s = getStockStatus(r); return <Chip label={s.label} color={s.color} size="small" />; } },
  ];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Inventory</Typography>
          <Typography variant="body2" color="text.secondary">{rows.length} inventory records</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Inventory</Button>
      </Stack>

      <DataTable columns={columns} rows={rows} loading={loading} searchKeys={['restaurant.name', 'cylinder.type']}
        actions={(row) => [
          <Tooltip title="Quick Adjust" key="a"><IconButton size="small" color="primary" onClick={() => openAdj(row)}><TuneIcon fontSize="small" /></IconButton></Tooltip>,
          <Tooltip title="Edit" key="e"><IconButton size="small" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>,
          <Tooltip title="Delete" key="d"><IconButton size="small" color="error" onClick={() => setConfirmId(row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>,
        ]}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Inventory' : 'Add Inventory Entry'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField select label="Restaurant *" fullWidth value={form.restaurantId} onChange={f('restaurantId')} disabled={!!editId}>
                {restaurants.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Cylinder Type *" fullWidth value={form.cylinderId} onChange={f('cylinderId')} disabled={!!editId}>
                {cylinders.map(c => <MenuItem key={c.id} value={c.id}>{c.type}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}><TextField label="Full" type="number" fullWidth value={form.fullCylinders} onChange={f('fullCylinders')} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Empty" type="number" fullWidth value={form.emptyCylinders} onChange={f('emptyCylinders')} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="On Order" type="number" fullWidth value={form.onOrderCylinders} onChange={f('onOrderCylinders')} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Min Level" type="number" fullWidth value={form.minimumStockLevel} onChange={f('minimumStockLevel')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Dialog */}
      <Dialog open={adjOpen} onClose={() => setAdjOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Quick Stock Adjustment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter positive to add, negative to reduce.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField label="Full Δ" type="number" fullWidth value={adjForm.fullDelta} onChange={fa('fullDelta')} /></Grid>
            <Grid item xs={6}><TextField label="Empty Δ" type="number" fullWidth value={adjForm.emptyDelta} onChange={fa('emptyDelta')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAdjOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleAdjust} variant="contained" disabled={saving}>Apply</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(confirmId)} title="Delete Inventory Entry"
        message="Remove this inventory record?"
        onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
    </Box>
  );
}
