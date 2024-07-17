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
      lastName: 'Ferreiro',
      firstName: 'Pauly',
      month: '2023-07-18',
      workedHours: 189,
      workedWeekends: 1
    },
    {
      id: 2,
      lastName: 'Nairn',
      firstName: 'Marwin',
      month: '2022-11-20',
      workedHours: 159,
      workedWeekends: 2
    },
    {
      id: 3,
      lastName: 'McAlarney',
      firstName: 'Malanie',
      month: '2023-04-14',
      workedHours: 81,
      workedWeekends: 2
    },
    {
      id: 4,
      lastName: 'Fennessy',
      firstName: 'Ronda',
      month: '2022-08-09',
      workedHours: 167,
      workedWeekends: 5
    },
    {
      id: 5,
      lastName: 'Streeter',
      firstName: 'Gillan',
      month: '2024-02-24',
      workedHours: 192,
      workedWeekends: 9
    },
    {
      id: 6,
      lastName: 'Witcherley',
      firstName: 'Fanchon',
      month: '2022-05-14',
      workedHours: 145,
      workedWeekends: 5
    },
    {
      id: 7,
      lastName: 'Gipp',
      firstName: 'Anitra',
      month: '2024-05-19',
      workedHours: 128,
      workedWeekends: 2
    },
    {
      id: 8,
      lastName: 'Crowd',
      firstName: 'Vilma',
      month: '2024-04-03',
      workedHours: 186,
      workedWeekends: 8
    },
    {
      id: 9,
      lastName: 'Lines',
      firstName: 'Nessy',
      month: '2023-04-01',
      workedHours: 110,
      workedWeekends: 9
    },
    {
      id: 10,
      lastName: 'Chidzoy',
      firstName: 'Zedekiah',
      month: '2024-02-11',
      workedHours: 86,
      workedWeekends: 8
    },
    {
      id: 11,
      lastName: 'Tieraney',
      firstName: 'Cortney',
      month: '2022-12-05',
      workedHours: 135,
      workedWeekends: 6
    },
    {
      id: 12,
      lastName: 'Titchard',
      firstName: 'Jilly',
      month: '2023-01-23',
      workedHours: 167,
      workedWeekends: 9
    },
    {
      id: 13,
      lastName: 'Hanbidge',
      firstName: 'Demetris',
      month: '2023-09-29',
      workedHours: 176,
      workedWeekends: 9
    },
    {
      id: 14,
      lastName: 'Roffe',
      firstName: 'Bevin',
      month: '2023-03-15',
      workedHours: 154,
      workedWeekends: 3
    },
    {
      id: 15,
      lastName: 'Dixie',
      firstName: 'Donnell',
      month: '2023-12-20',
      workedHours: 107,
      workedWeekends: 4
    },
    {
      id: 16,
      lastName: 'Dunican',
      firstName: 'Eddi',
      month: '2023-09-15',
      workedHours: 155,
      workedWeekends: 8
    },
    {
      id: 17,
      lastName: 'Barsby',
      firstName: 'Danika',
      month: '2024-03-05',
      workedHours: 104,
      workedWeekends: 4
    },
    {
      id: 18,
      lastName: 'Blannin',
      firstName: 'Rafaello',
      month: '2023-09-14',
      workedHours: 93,
      workedWeekends: 3
    },
    {
      id: 19,
      lastName: "O'Nowlan",
      firstName: 'Fran',
      month: '2024-04-01',
      workedHours: 178,
      workedWeekends: 6
    },
    {
      id: 20,
      lastName: 'Lathom',
      firstName: 'Templeton',
      month: '2023-10-06',
      workedHours: 142,
      workedWeekends: 4
    },
    {
      id: 21,
      lastName: 'Lortzing',
      firstName: 'Aaron',
      month: '2024-02-22',
      workedHours: 171,
      workedWeekends: 7
    },
    {
      id: 22,
      lastName: 'McRoberts',
      firstName: 'Hinda',
      month: '2023-09-03',
      workedHours: 195,
      workedWeekends: 2
    },
    {
      id: 23,
      lastName: 'Martin',
      firstName: 'Raymund',
      month: '2023-09-10',
      workedHours: 190,
      workedWeekends: 7
    },
    {
      id: 24,
      lastName: 'Grinnell',
      firstName: 'Laurice',
      month: '2023-11-01',
      workedHours: 172,
      workedWeekends: 10
    },
    {
      id: 25,
      lastName: 'Schriren',
      firstName: 'Melissa',
      month: '2023-12-31',
      workedHours: 98,
      workedWeekends: 4
    },
    {
      id: 26,
      lastName: 'Pehrsson',
      firstName: 'Laryssa',
      month: '2024-05-14',
      workedHours: 119,
      workedWeekends: 1
    },
    {
      id: 27,
      lastName: 'Peggs',
      firstName: 'Ennis',
      month: '2023-04-11',
      workedHours: 116,
      workedWeekends: 3
    },
    {
      id: 28,
      lastName: 'Plampeyn',
      firstName: 'Francyne',
      month: '2023-09-15',
      workedHours: 171,
      workedWeekends: 10
    },
    {
      id: 29,
      lastName: 'Gazzard',
      firstName: 'Rockey',
      month: '2022-07-04',
      workedHours: 134,
      workedWeekends: 6
    },
    {
      id: 30,
      lastName: 'Mapledoram',
      firstName: 'Minda',
      month: '2023-11-18',
      workedHours: 109,
      workedWeekends: 10
    },
    {
      id: 31,
      lastName: 'Iacoviello',
      firstName: 'Susana',
      month: '2023-04-01',
      workedHours: 122,
      workedWeekends: 3
    },
    {
      id: 32,
      lastName: 'Vaillant',
      firstName: 'Kurt',
      month: '2022-08-24',
      workedHours: 88,
      workedWeekends: 7
    },
    {
      id: 33,
      lastName: 'Oldershaw',
      firstName: 'Janessa',
      month: '2022-04-27',
      workedHours: 139,
      workedWeekends: 8
    },
    {
      id: 34,
      lastName: 'Kellert',
      firstName: 'Gerta',
      month: '2023-10-21',
      workedHours: 172,
      workedWeekends: 2
    },
    {
      id: 35,
      lastName: 'Dybell',
      firstName: 'Kalie',
      month: '2022-08-21',
      workedHours: 162,
      workedWeekends: 5
    },
    {
      id: 36,
      lastName: 'Maile',
      firstName: 'Heidie',
      month: '2022-09-16',
      workedHours: 99,
      workedWeekends: 7
    },
    {
      id: 37,
      lastName: 'Wilkerson',
      firstName: 'Rafaello',
      month: '2023-05-17',
      workedHours: 172,
      workedWeekends: 1
    },
    {
      id: 38,
      lastName: 'Phillins',
      firstName: 'Joseph',
      month: '2023-07-10',
      workedHours: 129,
      workedWeekends: 1
    },
    {
      id: 39,
      lastName: 'Randles',
      firstName: 'Lyman',
      month: '2024-02-11',
      workedHours: 154,
      workedWeekends: 6
    },
    {
      id: 40,
      lastName: 'Marflitt',
      firstName: 'Zackariah',
      month: '2023-05-20',
      workedHours: 155,
      workedWeekends: 6
    },
    {
      id: 41,
      lastName: 'Roscoe',
      firstName: 'Janice',
      month: '2022-08-12',
      workedHours: 143,
      workedWeekends: 10
    },
    {
      id: 42,
      lastName: 'Grayland',
      firstName: 'Aigneis',
      month: '2023-07-09',
      workedHours: 103,
      workedWeekends: 0
    },
    {
      id: 43,
      lastName: 'Keerl',
      firstName: 'Giffer',
      month: '2023-06-15',
      workedHours: 147,
      workedWeekends: 0
    },
    {
      id: 44,
      lastName: 'Earry',
      firstName: 'Tremayne',
      month: '2022-04-22',
      workedHours: 186,
      workedWeekends: 0
    },
    {
      id: 45,
      lastName: 'Wildin',
      firstName: 'Normand',
      month: '2023-03-05',
      workedHours: 88,
      workedWeekends: 1
    },
    {
      id: 46,
      lastName: 'Zanicchelli',
      firstName: 'Michelina',
      month: '2023-12-21',
      workedHours: 148,
      workedWeekends: 9
    },
    {
      id: 47,
      lastName: 'Lope',
      firstName: 'Charlena',
      month: '2022-10-13',
      workedHours: 169,
      workedWeekends: 4
    },
    {
      id: 48,
      lastName: 'Oag',
      firstName: 'Tobie',
      month: '2023-05-26',
      workedHours: 88,
      workedWeekends: 7
    },
    {
      id: 49,
      lastName: 'Berrygun',
      firstName: 'Neils',
      month: '2023-09-19',
      workedHours: 131,
      workedWeekends: 0
    },
    {
      id: 50,
      lastName: 'Dwane',
      firstName: 'Scarlett',
      month: '2022-05-10',
      workedHours: 102,
      workedWeekends: 5
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
        filterVariant: 'multi-select'
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        editable: false,
        filterVariant: 'multi-select'
      },
      {
        accessorFn: (row) => dayjs(row.month).format('MMMM').toString(),
        id: 'month',
        header: 'Miesiąc',
        editable: false,
        filterVariant: 'multi-select'
      },
      {
        accessorFn: (row) => dayjs(row.year).year().toString(),
        id: 'year',
        header: 'Rok',
        editable: false,
        filterVariant: 'multi-select'
      },
      {
        accessorKey: 'workedHours',
        header: 'Godziny',
        filterVariant: 'range'
      },
      {
        accessorKey: 'workedWeekends',
        header: 'Dni weekendowe',
        filterVariant: 'range'
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
    enableGlobalFilter: false,
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
