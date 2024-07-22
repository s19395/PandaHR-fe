import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth } from '../../helper/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../helper/AlertProvider';
import AnnouncementIcon from '@mui/icons-material/Announcement';

export default function Navbar() {
  const { setToken } = useAuth();
  const { setAlert } = useAlert();

  const navigate = useNavigate();

  const handleLogout = () => {
    // remove token from local storage because backend isn't smart enough yet
    localStorage.removeItem('token');
    setToken();
    setAlert({ open: true, message: 'Logged out', severity: 'success' });
    navigate('/', { replace: true });
  };

  function myFunction() {
    navigate('/', { replace: true });
  }

  return (
    <>
      <AppBar
        position="fixed"
        color="primary"
        enableColorOnDark
        sx={{
          backgroundColor: 'primary.dark',
          backgroundImage: 'none',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}>
        <Toolbar>
          <Typography component="div" variant="h5" sx={{ flexGrow: 1 }} onClick={myFunction}>
            <Typography component="div" variant="h5">
              <AnnouncementIcon sx={{ fontSize: 25, transform: 'scaleX(-1)' }} />
              <span style={{ color: '#cdcbc9' }}>Panda</span>
              <span style={{ color: 'primary', fontWeight: 'bold' }}>HR</span>
            </Typography>
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Wyloguj
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
}
