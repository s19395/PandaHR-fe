import React from 'react';
import FileUpload from '../components/common/FileUpload';
import { useMemo, useState, useEffect } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRequestWithNotification } from '../helper/AxiosHelper';
import { MRT_Localization_PL } from 'material-react-table/locales/pl';
import Typography from '@mui/material/Typography';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import EmployeeSearch from './EmployeeSearch';
import { DatePicker } from '@mui/x-date-pickers';

export default function Timesheet() {
  const [validationErrors, setValidationErrors] = useState({});
  const [fetchedTimesheets, setFetchedTimesheets] = useState([]);
  const [isLoadingTimesheets, setIsLoadingTimesheets] = useState(true);
  const [isLoadingTimesheetsError, setIsLoadingTimesheetsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const requestWithNotification = useRequestWithNotification();

  setUpDayJs();

  const fetchTimesheets = async () => {
    try {
      setIsLoadingTimesheets(true);
      const data = await requestWithNotification('get', '/timesheet/findAll');
      setFetchedTimesheets(data);
      setIsLoadingTimesheets(false);
    } catch (error) {
      setIsLoadingTimesheetsError(true);
      setIsLoadingTimesheets(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => (row.timesheetDto ? row.timesheetDto.id : ''),
        id: 'id',
        header: '',
        editable: false
      },
      {
        accessorFn: (row) => (row.employeeDto ? row.employeeDto.lastName : ''),
        id: 'lastName',
        header: 'Last Name',
        editable: false,
        filterVariant: 'multi-select'
      },
      {
        accessorFn: (row) => (row.employeeDto ? row.employeeDto.firstName : ''),
        id: 'firstName',
        header: 'First Name',
        editable: false,
        filterVariant: 'multi-select'
      },
      {
        accessorFn: (row) =>
          row.timesheetDto ? dayjs(row.timesheetDto.date).format('MMMM').toString() : '',
        id: 'month',
        header: 'Miesiąc',
        editable: false,
        filterVariant: 'multi-select'
      },
      {
        accessorFn: (row) =>
          row.timesheetDto ? dayjs(row.timesheetDto.date).year().toString() : '',
        id: 'year',
        header: 'Rok',
        editable: false,
        filterVariant: 'multi-select'
      },
      {
        accessorFn: (row) => (row.timesheetDto ? row.timesheetDto.workedHours : ''),
        id: 'workedHours',
        header: 'Godziny',
        filterVariant: 'range'
      },
      {
        accessorFn: (row) => (row.timesheetDto ? row.timesheetDto.workedWeekends : ''),
        id: 'workedWeekends',
        header: 'Dni weekendowe',
        filterVariant: 'range'
      }
    ],
    [validationErrors]
  );

  const handleSaveTimesheet = async ({ row, values, table }) => {
    console.log('values', values);
    const newValidationErrors = validateTimesheet(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);
    try {
      const timesheetDto = {
        id: row.original.timesheetDto.id,
        date: dayjs(`${values.year} ${values.month}`, 'YYYY MMMM', 'pl').add(1, 'month').toDate(),
        workedHours: values.workedHours,
        workedWeekends: values.workedWeekends
      };
      console.log(timesheetDto);
      await requestWithNotification('put', `/timesheet`, timesheetDto, true);
      table.setEditingRow(null);
    } catch (error) {
      // Error handling is done in requestWithNotification
    }
    setIsSaving(false);
    fetchTimesheets();
  };

  const openDeleteConfirmModal = (row) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      handleDeleteTimesheet(row.original.timesheetDto.id);
    }
  };

  const handleDeleteTimesheet = async (timesheetId) => {
    setIsSaving(true);
    console.log(timesheetId);
    try {
      await requestWithNotification('delete', `/timesheet/${timesheetId}`, {}, true);
      fetchTimesheets();
    } catch (error) {
      // Error handling is done in requestWithNotification
    }
    setIsSaving(false);
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedTimesheets,
    enableGrouping: true,
    enableGlobalFilter: false,
    enableFacetedValues: true,
    createDisplayMode: 'modal',
    editDisplayMode: 'row',
    enableColumnPinning: true,
    enableDensityToggle: false,
    enableEditing: true,
    enableFullScreenToggle: false,
    enableRowNumbers: true,
    initialState: {
      columnPinning: { left: [], right: ['mrt-row-actions'] }
    },
    localization: MRT_Localization_PL,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px'
      }
    },
    muiToolbarAlertBannerProps: isLoadingTimesheetsError
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    onCreatingRowCancel: () => setValidationErrors({}),
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveTimesheet,
    positionActionsColumn: 'last',
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ textAlign: 'left', ml: 2 }}>
        <Typography variant="h6" gutterBottom>
          Wprowadź dane
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'left', gap: 2 }}>
          <UploadPopUp />
          <Button
            variant="contained"
            onClick={() => {
              table.setCreatingRow(true);
            }}>
            Ręcznie
          </Button>
        </Box>
      </Box>
    ),
    renderCreateRowDialogContent: ({ table }) => (
      <CustomCreateRowDialog table={table} fetchData={fetchTimesheets} />
    ),
    state: {
      isLoading: isLoadingTimesheets,
      isSaving,
      showAlertBanner: isLoadingTimesheetsError,
      columnVisibility: { id: false }
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
      <MaterialReactTable table={table} />
    </LocalizationProvider>
  );
}

const validateRequired = (value) => !!value.length;

function validateTimesheet(timesheet) {
  return {
    firstName: !validateRequired(timesheet.firstName) ? 'First Name is Required' : '',
    lastName: !validateRequired(timesheet.lastName) ? 'Last Name is Required' : ''
  };
}

export const UploadPopUp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpenModal}>
        Import
      </Button>
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogContent>
          <FileUpload />
        </DialogContent>
      </Dialog>
    </>
  );
};

const CustomCreateRowDialog = ({ table, fetchData }) => {
  const [formValues, setFormValues] = useState({});
  const requestWithNotification = useRequestWithNotification();
  const [employee, setEmployee] = useState();
  const [date, setDate] = useState();

  const handleEmployeeSelect = (employee) => {
    setEmployee(employee);
  };

  const handleChange = (field) => (event) => {
    setFormValues({ ...formValues, [field]: event.target.value });
  };

  const handleSave = async () => {
    const employeeDto = {
      id: employee.id
    };

    const timesheetDto = {
      date: date,
      workedWeekends: formValues.workedWeekends,
      workedHours: formValues.workedHours
    };

    await requestWithNotification(
      'post',
      `/timesheet/create`,
      {
        timesheetDto,
        employeeDto
      },
      true
    );
    table.setCreatingRow(false);
    fetchData();
  };

  return (
    <>
      <DialogTitle>Nowy czas pracy</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <EmployeeSearch onEmployeeSelect={handleEmployeeSelect} />
        <DatePicker
          label="Miesiąc i rok"
          views={['month', 'year']}
          onChange={(newValue) => setDate(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true
              }}
            />
          )}
        />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Godziny"
              type="number"
              fullWidth
              value={formValues.workedHours}
              onChange={handleChange('workedHours')}
              margin="normal"
              InputProps={{
                inputProps: { min: 0, max: 280 }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Dni weekendowe"
              type="number"
              fullWidth
              value={formValues.workedWeekends}
              onChange={handleChange('workedWeekends')}
              margin="normal"
              InputProps={{
                inputProps: { min: 0, max: 10 }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => table.setCreatingRow(false)}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </>
  );
};

function setUpDayJs() {
  const localeData = require('dayjs/plugin/localeData');
  dayjs.locale('pl');
  dayjs.extend(localeData);
}
