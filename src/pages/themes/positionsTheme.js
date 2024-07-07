import { createTheme } from '@mui/material/styles';

const positionsTheme = createTheme({
  components: {
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '3px 5px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          width: '50%',
          maxWidth: 'none'
        }
      }
    }
  }
});

export default positionsTheme;
