import React from 'react';
import FileUpload from '../components/common/FileUpload';
import { useMemo, useState, useEffect } from 'react';
import {
  MaterialReactTable,
  MRT_EditActionButtons,
  useMaterialReactTable
} from 'material-react-table';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRequestWithNotification } from '../service/AxiosService';
import { MRT_Localization_PL } from 'material-react-table/locales/pl';
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
      const timesheet = data.map((timesheet) => ({
        id: timesheet.timesheetDto?.id || '',
        date: timesheet.timesheetDto?.date || '',
        workedHours: timesheet.timesheetDto?.workedHours || 0,
        workedWeekends: timesheet.timesheetDto?.workedWeekends || 0,
        firstName: timesheet.employeeDto?.firstName || '',
        lastName: timesheet.employeeDto?.lastName || ''
      }));
      setFetchedTimesheets(timesheet);
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
        accessorKey: 'id',
        header: '',
        editable: false
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        editable: false,
        filterVariant: 'multi-select'
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        editable: false,
        filterVariant: 'multi-select'
      },
      {
        accessorFn: (row) => (row.date ? dayjs(row.date).format('MMMM').toString() : ''),
        id: 'month',
        header: 'Miesiąc',
        editable: false,
        filterVariant: 'multi-select'
      },
      {
        accessorFn: (row) => (row.date ? dayjs(row.date).year().toString() : ''),
        id: 'year',
        header: 'Rok',
        editable: false,
        filterVariant: 'multi-select'
      },
      {
        accessorKey: 'date',
        id: 'date',
        header: 'date',
        Edit: ({ column, row }) => {
          return (
            <DatePicker
              label="Miesiąc i rok"
              views={['month', 'year']}
              defaultValue={dayjs(row._valuesCache.date)}
              onChange={(newValue) => (row._valuesCache[column.id] = newValue)}
              sx={{ mt: 2 }}
            />
          );
        }
      },
      {
        accessorKey: 'workedHours',
        header: 'Godziny',
        filterVariant: 'range',
        Edit: ({ column, row }) => {
          return (
            <TextField
              error={!!validationErrors.workedHours}
              helperText={validationErrors.workedHours}
              label="Godziny"
              type="number"
              fullWidth
              defaultValue={row._valuesCache.workedHours}
              onChange={(newValue) => (row._valuesCache[column.id] = Number(newValue.target.value))}
              margin="normal"
              InputProps={{
                inputProps: { min: 0, max: 280 }
              }}
            />
          );
        }
      },
      {
        // accessorFn: (row) => (row.timesheetDto ? row.timesheetDto.workedWeekends : ''),
        accessorKey: 'workedWeekends',
        header: 'Dni weekendowe',
        filterVariant: 'range',
        Edit: ({ column, row }) => {
          return (
            <TextField
              error={!!validationErrors.workedWeekends}
              helperText={validationErrors.workedWeekends}
              label="Dni weekendowe"
              type="number"
              fullWidth
              defaultValue={row._valuesCache.workedWeekends}
              onChange={(newValue) => (row._valuesCache[column.id] = Number(newValue.target.value))}
              margin="normal"
              InputProps={{
                inputProps: { min: 0, max: 10 }
              }}
            />
          );
        }
      }
    ],
    [validationErrors]
  );

  const handleCreateTimesheet = async ({ row, values, table }) => {
    const newValidationErrors = validateTimesheet(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);
    try {
      const timesheetDto = {
        date: values.date,
        workedWeekends: values.workedWeekends,
        workedHours: values.workedHours
      };

      const employeeDto = {
        id: row.original.employeeId.id
      };

      const timesheet = {
        id: values?.id || '',
        date: values?.date || '',
        workedHours: values?.workedHours || 0,
        workedWeekends: values?.workedWeekends || 0,
        firstName: row?.original.employeeId.firstName || '',
        lastName: row?.original.employeeId.lastName || ''
      };

      await requestWithNotification(
        'post',
        `/timesheet/create`,
        { timesheetDto, employeeDto },
        true
      );

      setFetchedTimesheets((prev) => [...prev, timesheet]);
      table.setCreatingRow(null);
    } catch (error) {
      // Error handling is done in requestWithNotification
    }
    setIsSaving(false);
  };

  const handleSaveTimesheet = async ({ row, values, table }) => {
    const newValidationErrors = validateTimesheet(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);
    values = {
      ...values,
      id: row.original.id
    };
    try {
      await requestWithNotification('put', `/timesheet`, values, true);
      setFetchedTimesheets((prev) =>
        prev.map((timesheet) => (timesheet.id === row.original.id ? values : timesheet))
      );
      table.setEditingRow(null);
    } catch (error) {
      // Error handling is done in requestWithNotification
    }
    setIsSaving(false);
  };

  const openDeleteConfirmModal = (row) => {
    if (window.confirm('Czy napewno chcesz usunąć tę ewidencje?')) {
      handleDeleteTimesheet(row.original.id);
    }
  };

  const handleDeleteTimesheet = async (timesheetId) => {
    setIsSaving(true);
    try {
      await requestWithNotification('delete', `/timesheet/${timesheetId}`, {}, true);
      setFetchedTimesheets((prev) => prev.filter((timesheet) => timesheet.id !== timesheetId));
    } catch (error) {
      // Error handling is done in requestWithNotification
    }
    setIsSaving(false);
  };

  const table = useMaterialReactTable({
    columns,
    createDisplayMode: 'modal',
    data: fetchedTimesheets,
    editDisplayMode: 'modal',
    enableColumnPinning: true,
    enableDensityToggle: false,
    enableEditing: true,
    enableFacetedValues: true,
    enableFullScreenToggle: false,
    enableGlobalFilter: false,
    enableGrouping: true,
    initialState: {
      columnPinning: { left: [], right: ['mrt-row-actions'] }
    },
    localization: MRT_Localization_PL,
    mrtTheme: () => ({
      baseBackgroundColor: '#1b1d1e'
    }),
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
    onCreatingRowSave: handleCreateTimesheet,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveTimesheet,
    positionActionsColumn: 'last',
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Dodaj ewidencje</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <EmployeeSearch onEmployeeSelect={(newValue) => (row.original.employeeId = newValue)} />
          {internalEditComponents.filter(
            (component) =>
              !['id', 'lastName', 'firstName'].includes(
                component.props.cell.column.columnDef.accessorKey
              ) && !['month', 'year'].includes(component.props.cell.column.columnDef.id)
          )}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Edycja ewidencji</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {internalEditComponents.filter(
            (component) =>
              !['id', 'lastName', 'firstName'].includes(
                component.props.cell.column.columnDef.accessorKey
              ) && !['month', 'year'].includes(component.props.cell.column.columnDef.id)
          )}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
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
      <Box sx={{ textAlign: 'left', m: 2 }}>
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
    state: {
      isLoading: isLoadingTimesheets,
      isSaving,
      showAlertBanner: isLoadingTimesheetsError,
      columnVisibility: { id: false, date: false }
    }
  });

  return <MaterialReactTable table={table} />;
}

function validateTimesheet(timesheet) {
  return {
    workedHours:
      timesheet.workedHours <= 0 ? 'Liczba przepracowanych godzin musi być dodatnia' : '',
    workedWeekends:
      timesheet.workedWeekends < 0
        ? 'Liczba przepracowanych dni weekendowych musi być dodatnia'
        : timesheet.workedWeekends > 10
          ? 'Liczba przepracowanych dni weekendowych nie może przekraczać 10'
          : ''
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
          <FileUpload maxFiles={50} url={'/timesheet/upload'} />
        </DialogContent>
      </Dialog>
    </>
  );
};

function setUpDayJs() {
  const localeData = require('dayjs/plugin/localeData');
  dayjs.locale('pl');
  dayjs.extend(localeData);
}
