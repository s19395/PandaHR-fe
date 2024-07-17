import React from 'react';
import FileUpload from '../components/common/FileUpload';
import { useMemo, useState, useEffect } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Button, Dialog, DialogContent, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRequestWithNotification } from '../helper/AxiosHelper';
import { MRT_Localization_PL } from 'material-react-table/locales/pl';
import Typography from '@mui/material/Typography';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export default function Timesheet() {
  const [validationErrors, setValidationErrors] = useState({});
  const [fetchedTimesheets, setFetchedTimesheets] = useState([]);
  const [isLoadingTimesheets, setIsLoadingTimesheets] = useState(true);
  const [isLoadingTimesheetsError, setIsLoadingTimesheetsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const requestWithNotification = useRequestWithNotification();

  setUpDayJs();

  const data = [
    {
      id: 1,
      lastName: 'Kowalski',
      firstName: 'Jan',
      month: new Date('2024-07-12'),
      workedHours: 160,
      workedWeekends: 4
    },
    {
      id: 2,
      lastName: 'Nowak',
      firstName: 'Anna',
      month: new Date('2024-07-12'),
      workedHours: 160,
      workedWeekends: 4
    },
    {
      id: 3,
      lastName: 'Wiśniewski',
      firstName: 'Piotr',
      month: new Date('2024-05-12'),
      workedHours: 160,
      workedWeekends: 4
    }
  ];

  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        setIsLoadingTimesheets(true);
        //const data = await requestWithNotification('get', '/employees/findAll');
        setFetchedTimesheets(data);
        setIsLoadingTimesheets(false);
      } catch (error) {
        setIsLoadingTimesheetsError(true);
        setIsLoadingTimesheets(false);
      }
    };

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
        filterVariant: 'multi-select',
        filter: 'includesSome'
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        editable: false,
        filterVariant: 'multi-select',
        filter: 'includesSome'
      },
      {
        accessorFn: (row) => dayjs(row.month).format('MMMM'),
        id: 'month',
        header: 'Miesiąc',
        editable: false,
        filterVariant: 'multi-select',
        filter: 'includesSome'
      },
      {
        accessorFn: (row) => dayjs(row.year).year(),
        id: 'year',
        header: 'Rok',
        editable: false,
        filterVariant: 'multi-select',
        filter: 'includesSome'
      },
      {
        accessorKey: 'workedHours',
        header: 'Godziny',
        filterVariant: 'range',
        filterFn: 'between'
      },
      {
        accessorKey: 'workedWeekends',
        header: 'Dni weekendowe',
        filterVariant: 'range',
        filterFn: 'between'
      }
    ],
    [validationErrors]
  );

  const handleSaveTimesheet = async ({ values, table }) => {
    const newValidationErrors = validateTimesheet(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);
    try {
      await requestWithNotification('put', `/employees`, values, true);
      setFetchedTimesheets((prev) =>
        prev.map((employee) => (employee.id === values.id ? values : employee))
      );
      table.setEditingRow(null);
    } catch (error) {
      // Error handling is done in requestWithNotification
    }
    setIsSaving(false);
  };

  const openDeleteConfirmModal = (row) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      handleDeleteTimesheet(row.original);
    }
  };

  const handleDeleteTimesheet = async (deletedTimesheet) => {
    setIsSaving(true);
    try {
      await requestWithNotification('delete', `/timesheet`, deletedTimesheet, true);
      setFetchedTimesheets((prev) =>
        prev.filter((timesheet) => timesheet.id !== deletedTimesheet.id)
      );
    } catch (error) {
      // Error handling is done in requestWithNotification
    }
    setIsSaving(false);
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedTimesheets,
    enableGrouping: true,
    enableFacetedValues: true,
    createDisplayMode: 'row',
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
    // onCreatingRowSave: handleCreateEmployee,
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

function setUpDayJs() {
  const localeData = require('dayjs/plugin/localeData');
  dayjs.locale('pl');
  dayjs.extend(localeData);
}
