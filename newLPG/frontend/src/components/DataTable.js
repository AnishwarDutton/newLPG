import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, InputAdornment, Box, Typography, Stack,
  TablePagination, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function DataTable({ columns, rows, loading, searchKeys = [], actions, emptyText = 'No records found' }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = rows.filter(row =>
    searchKeys.length === 0 || searchKeys.some(key => {
      const val = key.split('.').reduce((o, k) => o?.[k], row);
      return String(val ?? '').toLowerCase().includes(query.toLowerCase());
    })
  );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {searchKeys.length > 0 && (
        <TextField
          size="small"
          placeholder="Search…"
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
          sx={{ mb: 2, width: 280 }}
        />
      )}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.key} sx={{ width: col.width }}>{col.label}</TableCell>
              ))}
              {actions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary" variant="body2">{emptyText}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, i) => (
                <TableRow key={row.id ?? i}>
                  {columns.map(col => (
                    <TableCell key={col.key} sx={{ py: 1.2 }}>
                      {col.render ? col.render(row) : (col.key.split('.').reduce((o, k) => o?.[k], row) ?? '—')}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell align="right" sx={{ py: 1 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {actions(row)}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
        rowsPerPageOptions={[10, 25, 50]}
        sx={{ mt: 1 }}
      />
    </Box>
  );
}
