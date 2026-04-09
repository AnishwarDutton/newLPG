import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, MenuItem, Chip, IconButton, Tooltip, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY = { name: '', city: '', address: '', contact: '', email: '', licenseNumber: '', status: 'ACTIVE', notes: '' };

export default function Suppliers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); getSuppliers().then(r => setRows(r.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(''); setOpen(true); };
  const openEdit = (row) => { setForm({ ...row }); setEditId(row.id); setError(''); setOpen(true); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (editId) await updateSupplier(editId, form);
      else await createSupplier(form);
      setOpen(false); load();
    } catch (e) { setError(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteSupplier(confirmId); setConfirmId(null); load(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const columns = [
    { key: 'name', label: 'Supplier Name', render: r => <Typography fontWeight={600} fontSize="0.875rem">{r.name}</Typography> },
    { key: 'city', label: 'City' },
    { key: 'contact', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'licenseNumber', label: 'License' },
    { key: 'status', label: 'Status', render: r => <Chip label={r.status} color={r.status === 'ACTIVE' ? 'success' : 'default'} size="small" /> },
  ];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Suppliers</Typography>
          <Typography variant="body2" color="text.secondary">{rows.length} suppliers registered</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Supplier</Button>
      </Stack>

      <DataTable columns={columns} rows={rows} loading={loading} searchKeys={['name', 'city', 'contact']}
        actions={(row) => [
          <Tooltip title="Edit" key="e"><IconButton size="small" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>,
          <Tooltip title="Delete" key="d"><IconButton size="small" color="error" onClick={() => setConfirmId(row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>,
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}><TextField label="Name *" fullWidth value={form.name} onChange={f('name')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="City *" fullWidth value={form.city} onChange={f('city')} /></Grid>
            <Grid item xs={12}><TextField label="Address" fullWidth value={form.address} onChange={f('address')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Contact *" fullWidth value={form.contact} onChange={f('contact')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Email" fullWidth value={form.email} onChange={f('email')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="License Number" fullWidth value={form.licenseNumber} onChange={f('licenseNumber')} /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Status" fullWidth value={form.status} onChange={f('status')}>
                {['ACTIVE','INACTIVE'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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

      <ConfirmDialog open={Boolean(confirmId)} title="Delete Supplier"
        message="Delete this supplier? Existing orders referencing it will be affected."
        onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
    </Box>
  );
}
