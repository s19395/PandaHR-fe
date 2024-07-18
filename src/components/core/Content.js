import React from 'react';
import { Typography, Grid, Paper, Box, Avatar } from '@mui/material';

import AnnouncementIcon from '@mui/icons-material/Announcement';

const Content = () => {
  return (
    <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: '#1976d2', width: 60, height: 60, mr: 2 }}>
              <AnnouncementIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h3" gutterBottom sx={{ mt: 2 }}>
              PandaHR
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: '#ffffff', height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Pomocne linki
            </Typography>
            <Typography variant="body1">Przydatne linki, informacje etc</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: '#ffffff', height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Powiadomienia
            </Typography>
            <Typography variant="body1">
              Powiadomienia dotyczące pracowników, stanowisk, umów, plików rozliczeniowych i innych.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Content;
