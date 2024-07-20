import React, { useState, useEffect } from 'react';
import { Typography, Paper, Grid, Box, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import 'dayjs/locale/pl';
import TextField from '@mui/material/TextField';
import FileUpload from '../components/common/FileUpload';
import { useRequestWithNotification } from '../helper/AxiosHelper';

const localeData = require('dayjs/plugin/localeData');
dayjs.locale('pl');
dayjs.extend(localeData);

const WorkingHours = () => {
  const [selectedYear, setSelectedYear] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [workingHours, setWorkingHours] = useState({});
  const requestWithNotification = useRequestWithNotification();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await requestWithNotification(
        'get',
        `/workingHours?year=${dayjs(selectedYear).year()}`
      );
      setWorkingHours(data);
      setLoading(false);
    };
    fetchData();
  }, [selectedYear]);

  const monthNames = dayjs.months();

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
        ) : workingHours.length > 0 ? (
          <Grid container spacing={3}>
            {workingHours.map(({ month, hours }) => {
              const monthName = monthNames[month - 1];

              return (
                <Grid item xs={12} sm={6} md={3} key={`${selectedYear.year()}-${month}`}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {monthName}
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
            <FileUpload
              maxFiles={1}
              url={`/workingHours/upload?year=${dayjs(selectedYear).year()}`}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default WorkingHours;
