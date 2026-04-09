import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, IconButton, Tooltip, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getCylinders, createCylinder, updateCylinder, deleteCylinder } from '../api';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY = { type: '', weightKg: '', brand: '', description: '' };

export default function Cylinders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); getCylinders().then(r => setRows(r.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(''); setOpen(true); };
  const openEdit = (row) => { setForm({ ...row }); setEditId(row.id); setError(''); setOpen(true); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form, weightKg: parseFloat(form.weightKg) };
      if (editId) await updateCylinder(editId, payload);
      else await createCylinder(payload);
      setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteCylinder(confirmId); setConfirmId(null); load(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const columns = [
    { key: 'type', label: 'Type', render: r => <Typography fontWeight={600} fontSize="0.875rem">{r.type}</Typography> },
    { key: 'weightKg', label: 'Weight (kg)', render: r => `${r.weightKg} kg` },
    { key: 'brand', label: 'Brand' },
    { key: 'description', label: 'Description' },
  ];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Cylinder Types</Typography>
          <Typography variant="body2" color="text.secondary">{rows.length} types configured</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Cylinder Type</Button>
      </Stack>

      <DataTable columns={columns} rows={rows} loading={loading} searchKeys={['type', 'brand']}
        actions={(row) => [
          <Tooltip title="Edit" key="e"><IconButton size="small" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>,
          <Tooltip title="Delete" key="d"><IconButton size="small" color="error" onClick={() => setConfirmId(row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>,
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Cylinder Type' : 'Add Cylinder Type'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}><TextField label="Type *" fullWidth value={form.type} onChange={f('type')} placeholder="e.g. Commercial 19kg" /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Weight (kg) *" fullWidth type="number" value={form.weightKg} onChange={f('weightKg')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Brand" fullWidth value={form.brand} onChange={f('brand')} /></Grid>
            <Grid item xs={12}><TextField label="Description" fullWidth value={form.description} onChange={f('description')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(confirmId)} title="Delete Cylinder Type"
        message="Delete this cylinder type? Inventory entries using it may be affected."
        onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
    </Box>
  );
}
