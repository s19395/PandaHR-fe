import { useMemo, useState, useEffect } from 'react';
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable
} from 'material-react-table';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRequestWithNotification } from '../helper/AxiosHelper';
import moment from 'moment/moment';
import { ThemeProvider } from '@mui/material/styles';
import muiDialogTheme from './themes/muiDialogTheme';

export default function Employees() {
  const [validationErrors, setValidationErrors] = useState({});
  const [fetchedEmployees, setFetchedEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoadingEmployeesError, setIsLoadingEmployeesError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const requestWithNotification = useRequestWithNotification();

  const employmentContracts = ['Pełny etat', 'Zlecenie', 'Brak umowy'];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        const data = await requestWithNotification('get', '/employees/findAll');
        setFetchedEmployees(data);
        setIsLoadingEmployees(false);
      } catch (error) {
        setIsLoadingEmployeesError(true);
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false,
        maxSize: 30
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.firstName,
          helperText: validationErrors?.firstName,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              firstName: undefined
            })
        }
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.lastName,
          helperText: validationErrors?.lastName,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              lastName: undefined
            })
        }
      },
      {
        accessorFn: (row) => moment().diff(row.dateOfBirth, 'years'),
        header: 'Wiek',
        maxSize: 30
      },
      {
        accessorKey: 'dateOfBirth',
        header: 'Data urodzenia',
        Cell: ({ cell }) => <span>{moment(cell.getValue()).format('DD.MM.YYYY')}</span>,
        muiEditTextFieldProps: {
          variant: 'standard',
          type: 'date',
          InputLabelProps: { shrink: true },
          inputProps: {
            min: '1900-01-01',
            max: moment().format('YYYY-MM-DD') //
          }
        }
      },
      {
        accessorKey: 'employmentContract',
        header: 'Forma zatrudnienia',
        editVariant: 'select',
        editSelectOptions: employmentContracts,
        muiEditTextFieldProps: {
          select: true,
          error: !!validationErrors?.fetchedEmploymentContracts,
          helperText: validationErrors?.fetchedEmploymentContracts
        }
      },
      {
        accessorFn: (row) => {
          const parts = [
            row.street,
            row.city ? ', ' + row.city : '',
            row.zipCode ? ' ' + row.zipCode : '',
            row.country ? ', ' + row.country : ''
          ];
          return parts.filter(Boolean).join('');
        },
        header: 'Adres zamieszkania'
      },
      {
        accessorKey: 'street',
        header: 'Ulica'
      },
      {
        accessorKey: 'city',
        header: 'Miasto'
      },
      {
        accessorKey: 'zipCode',
        header: 'Kod pocztowy'
      }
    ],
    [validationErrors]
  );

  const handleCreateEmployee = async ({ values, table }) => {
    const newValidationErrors = validateEmployee(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);
    try {
      const newEmployee = await requestWithNotification('post', '/employees', values, true);
      setFetchedEmployees((prev) => [...prev, newEmployee]);
      table.setCreatingRow(null);
    } catch (error) {
      // Error handling is done in requestWithNotification
    }
    setIsSaving(false);
  };

  const handleSaveEmployee = async ({ values, table }) => {
    const newValidationErrors = validateEmployee(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);
    try {
      await requestWithNotification('put', `/employees`, values, true);
      setFetchedEmployees((prev) =>
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
      handleDeleteEmployee(row.original.id);
    }
  };

  const handleDeleteEmployee = async (id) => {
    setIsSaving(true);
    try {
      await requestWithNotification('delete', `/employees/${id}`, {}, true);
      setFetchedEmployees((prev) => prev.filter((employee) => employee.id !== id));
    } catch (error) {
      // Error handling is done in requestWithNotification
    }
    setIsSaving(false);
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedEmployees,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingEmployeesError
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px'
      }
    },
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    positionActionsColumn: 'last',
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateEmployee,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveEmployee,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Nowy pracownik</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {internalEditComponents.filter(
            (component) =>
              !['id', 'age'].includes(component.props.cell.column.columnDef.accessorKey) &&
              !['Wiek', 'Adres zamieszkania'].includes(component.props.cell.column.columnDef.header)
          )}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Edycja pracownika</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {internalEditComponents.filter(
            (component) =>
              !['id', 'age'].includes(component.props.cell.column.columnDef.accessorKey) &&
              !['Wiek', 'Adres zamieszkania'].includes(component.props.cell.column.columnDef.header)
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
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}>
        Stwórz pracownika
      </Button>
    ),
    state: {
      isLoading: isLoadingEmployees,
      isSaving,
      showAlertBanner: isLoadingEmployeesError,
      columnVisibility: { street: false, city: false, zipCode: false, country: false }
    }
  });

  return (
    <ThemeProvider theme={muiDialogTheme}>
      <MaterialReactTable table={table} />
    </ThemeProvider>
  );
}

const validateRequired = (value) => !!value.length;

function validateEmployee(employee) {
  return {
    firstName: !validateRequired(employee.firstName) ? 'First Name is Required' : '',
    lastName: !validateRequired(employee.lastName) ? 'Last Name is Required' : ''
  };
}
