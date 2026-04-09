import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, MenuItem, Chip, IconButton, Tooltip, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { getGasUsage, getRestaurants, getCylinders, createGasUsage, deleteGasUsage } from '../api';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

const MEAL_PERIODS = ['BREAKFAST', 'LUNCH', 'DINNER', 'ALL_DAY'];
const MEAL_COLORS = { BREAKFAST: '#F59E0B', LUNCH: '#10B981', DINNER: '#3B82F6', ALL_DAY: '#8B5CF6' };
const EMPTY = { restaurantId: '', cylinderId: '', cylindersUsed: 1, usageDate: '', mealPeriod: 'ALL_DAY', coversServed: 0, notes: '' };

export default function GasUsage() {
  const [rows, setRows] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getGasUsage(), getRestaurants(), getCylinders()])
      .then(([u, r, c]) => { setRows(u.data); setRestaurants(r.data); setCylinders(c.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await createGasUsage({ ...form, cylindersUsed: +form.cylindersUsed, coversServed: +form.coversServed, cylinderId: form.cylinderId || null, usageDate: form.usageDate || null });
      setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteGasUsage(confirmId); setConfirmId(null); load(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const columns = [
    { key: 'restaurant.name', label: 'Restaurant', render: r => <Typography fontWeight={600} fontSize="0.875rem">{r.restaurant?.name}</Typography> },
    { key: 'usageDate', label: 'Date' },
    { key: 'mealPeriod', label: 'Period', render: r => r.mealPeriod
        ? <Chip label={r.mealPeriod} size="small" sx={{ background: MEAL_COLORS[r.mealPeriod] + '22', color: MEAL_COLORS[r.mealPeriod], fontWeight: 600 }} />
        : '—'
    },
    { key: 'cylindersUsed', label: 'Cylinders Used', render: r => <Typography fontWeight={700} color="primary.main">{r.cylindersUsed}</Typography> },
    { key: 'cylinder.type', label: 'Cylinder Type', render: r => r.cylinder?.type ?? '—' },
    { key: 'coversServed', label: 'Covers Served' },
    { key: 'notes', label: 'Notes', render: r => r.notes ? <Typography variant="caption" noWrap sx={{ maxWidth: 160, display: 'block' }}>{r.notes}</Typography> : '—' },
  ];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Gas Usage Log</Typography>
          <Typography variant="body2" color="text.secondary">{rows.length} usage records</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(EMPTY); setError(''); setOpen(true); }}>Log Usage</Button>
      </Stack>

      <DataTable columns={columns} rows={rows} loading={loading} searchKeys={['restaurant.name']}
        actions={(row) => [
          <Tooltip title="Delete" key="d"><IconButton size="small" color="error" onClick={() => setConfirmId(row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>,
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Gas Usage</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField select label="Restaurant *" fullWidth value={form.restaurantId} onChange={f('restaurantId')}>
                {restaurants.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Cylinder Type" fullWidth value={form.cylinderId} onChange={f('cylinderId')}>
                <MenuItem value="">— None —</MenuItem>
                {cylinders.map(c => <MenuItem key={c.id} value={c.id}>{c.type}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}><TextField label="Cylinders Used *" type="number" fullWidth value={form.cylindersUsed} onChange={f('cylindersUsed')} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Covers Served" type="number" fullWidth value={form.coversServed} onChange={f('coversServed')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Usage Date" type="date" fullWidth value={form.usageDate} onChange={f('usageDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Meal Period" fullWidth value={form.mealPeriod} onChange={f('mealPeriod')}>
                {MEAL_PERIODS.map(p => <MenuItem key={p} value={p}>{p.replace('_', ' ')}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}><TextField label="Notes" fullWidth multiline rows={2} value={form.notes} onChange={f('notes')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(confirmId)} title="Delete Usage Record"
        message="Remove this gas usage record? Note: inventory will NOT be reversed automatically."
        onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
    </Box>
  );
}
