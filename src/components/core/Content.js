import React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import WorkingHours from '../../pages/WorkingHours';

const Content = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AnnouncementIcon
              color={'primary'}
              sx={{ mb: 2, fontSize: 55, transform: 'scaleX(-1)' }}
            />
            <Typography variant="h3" gutterBottom sx={{ mt: 2 }}>
              <Typography color={'primary'} variant="h3" gutterBottom sx={{ mt: 2 }}>
                <span style={{ color: '#cdcbc9' }}>Panda</span>
                <span style={{ color: 'primary', fontWeight: 'bold' }}>HR</span>
              </Typography>
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
          <WorkingHours />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Content;
