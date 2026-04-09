import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: '#F59E0B', light: '#FCD34D', dark: '#D97706', contrastText: '#0A0A0A' },
    secondary: { main: '#10B981', light: '#34D399', dark: '#059669', contrastText: '#fff' },
    error:     { main: '#EF4444' },
    warning:   { main: '#F97316' },
    success:   { main: '#10B981' },
    background: { default: '#0D0D0D', paper: '#161616' },
    text:       { primary: '#F5F5F5', secondary: '#9CA3AF' },
    divider:    'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: '"DM Sans", "Inter", system-ui, sans-serif',
    h1: { fontFamily: '"Syne", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: '0.02em' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0D0D0D; }
        ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 3px; }
      `,
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.06)',
          transition: 'border-color 0.2s',
          '&:hover': { borderColor: 'rgba(245,158,11,0.25)' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
        containedPrimary: { color: '#0A0A0A' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            background: '#1A1A1A',
            color: '#9CA3AF',
            fontWeight: 600,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { background: 'rgba(245,158,11,0.04)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, fontSize: '0.7rem' } },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiSelect: {
      defaultProps: { size: 'small' },
    },
  },
});

export default theme;
