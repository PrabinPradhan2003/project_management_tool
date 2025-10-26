import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' }, // blue
    secondary: { main: '#7b1fa2' }, // purple
    background: {
      default: '#fafafa',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiAppBar: { defaultProps: { elevation: 1 } },
    MuiCard: { defaultProps: { elevation: 1 } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiButton: { defaultProps: { size: 'medium' } },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiSelect: { defaultProps: { size: 'small' } },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
