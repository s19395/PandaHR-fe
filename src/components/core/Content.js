import React from 'react';
import { Typography, Grid, Paper, Box, Avatar } from '@mui/material';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import WorkingHours from '../../pages/WorkingHours';

const Content = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: '#6D1B7B', width: 60, height: 60, mr: 2 }}>
              <AnnouncementIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h3" gutterBottom sx={{ mt: 2 }}>
              PandaHR
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Powiadomienia
            </Typography>
            <Typography variant="body1">
              Powiadomienia dotyczące pracowników, stanowisk, umów, plików rozliczeniowych i innych.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
            <WorkingHours />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Content;
