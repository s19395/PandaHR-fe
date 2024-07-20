import React, { useState, useEffect } from 'react';
import { Typography, Paper, Grid, Box, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import 'dayjs/locale/pl';
import TextField from '@mui/material/TextField';
import FileUpload from '../components/common/FileUpload';
import 'filepond/dist/filepond.min.css';

dayjs.locale('pl');

const WorkingHours = () => {
  const [selectedYear, setSelectedYear] = useState(dayjs());
  const [loading, setLoading] = useState(false);

  const workingHours = {
    '2024-01': 168,
    '2024-02': 160,
    '2024-03': 176,
    '2024-04': 168,
    '2024-05': 160,
    '2024-06': 168,
    '2024-07': 176,
    '2024-08': 160,
    '2024-09': 168,
    '2024-10': 176,
    '2024-11': 160,
    '2024-12': 168
  };

  const start = dayjs(selectedYear).startOf('year');
  const end = dayjs(selectedYear).endOf('year');

  const months = [];
  let current = start;
  while (current.isBefore(end, 'month') || current.isSame(end, 'month')) {
    months.push(current);
    current = current.add(1, 'month');
  }

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500); // Simulate data loading delay
  }, [selectedYear]);

  const hasData = months.some((month) => workingHours[month.format('YYYY-MM')] !== undefined);

  return (
    <Paper
      sx={{ p: 3, bgcolor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom>
        Wymiar czasu pracy
      </Typography>
      <DatePicker
        views={['year']}
        value={selectedYear}
        onChange={(newDate) => setSelectedYear(newDate)}
        renderInput={(params) => <TextField {...params} fullWidth />}
      />

      <Box sx={{ mt: 2, flexGrow: 1 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }}>
            <CircularProgress />
          </Box>
        ) : hasData ? (
          <Grid container spacing={3}>
            {months.map((month) => {
              const formattedMonth = month.format('YYYY-MM');
              const hours = workingHours[formattedMonth];

              return (
                <Grid item xs={12} sm={6} md={3} key={formattedMonth}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {month.format('MMMM')}
                    </Typography>
                    <Typography variant="body1" color="primary">
                      {hours !== undefined ? `${hours}h` : 'No data'}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              flexDirection: 'column'
            }}>
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              Brak danych dostępnych o wymiarze czasu pracy dla wybranego roku
            </Typography>
            <FileUpload />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default WorkingHours;
