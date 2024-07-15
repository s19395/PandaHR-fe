import { createTheme } from '@mui/material/styles';

const muiDialogTheme = createTheme({
  components: {
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '0px 25px',
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

export default muiDialogTheme;
