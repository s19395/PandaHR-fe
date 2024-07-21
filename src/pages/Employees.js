import React, { useMemo, useState, useEffect } from 'react';
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
import { MRT_Localization_PL } from 'material-react-table/locales/pl';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import CreateEmployee from './EmployeeForm';

export default function Employees() {
  const [validationErrors, setValidationErrors] = useState({});
  const [fetchedEmployees, setFetchedEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoadingEmployeesError, setIsLoadingEmployeesError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const requestWithNotification = useRequestWithNotification();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const employmentContracts = ['', 'Umowa Zlecenie', 'Umowa o Pracę'];

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
        editable: false
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
        accessorFn: (row) => (row.dateOfBirth ? dayjs().diff(row.dateOfBirth, 'years') : ''),
        id: 'age',
        header: 'Wiek',
        maxSize: 30
      },
      {
        accessorKey: 'dateOfBirth',
        id: 'dateOfBirth',
        header: 'Data urodzenia',
        Cell: ({ row }) => (
          <span>
            {row.original.dateOfBirth
              ? dayjs(row.original.dateOfBirth).format('DD.MM.YYYY').toString()
              : ''}
          </span>
        ),
        Edit: ({ column, row }) => {
          return (
            <DatePicker
              label="Data urodzenia"
              defaultValue={dayjs(row._valuesCache.dateOfBirth)}
              onChange={(newValue) => (row._valuesCache[column.id] = newValue)}
              sx={{ mt: 2 }}
              slotProps={{
                textField: {
                  error: !!validationErrors?.dateOfBirth,
                  helperText: validationErrors?.dateOfBirth
                }
              }}
            />
          );
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
          if (!row) return ''; // Ensure row is defined
          const parts = [
            row.street,
            row.city ? ', ' + row.city : '',
            row.zipCode ? ' ' + row.zipCode : '',
            row.country ? ', ' + row.country : ''
          ];
          return parts.filter(Boolean).join('');
        },
        id: 'adress',
        header: 'Adres zamieszkania'
      },
      {
        accessorKey: 'street',
        header: 'Ulica',
        muiEditTextFieldProps: {
          error: !!validationErrors?.street,
          helperText: validationErrors?.street
        }
      },
      {
        accessorKey: 'city',
        header: 'Miasto',
        muiEditTextFieldProps: {
          error: !!validationErrors?.city,
          helperText: validationErrors?.city
        }
      },
      {
        accessorKey: 'zipCode',
        header: 'Kod pocztowy',
        muiEditTextFieldProps: {
          error: !!validationErrors?.zipCode,
          helperText: validationErrors?.zipCode
        }
      }
    ],
    [validationErrors]
  );

  const handleCreateEmployee = async ({ employeeDto }) => {
    setFetchedEmployees((prev) => [...prev, employeeDto]);
    setIsSaving(false);
  };

  const handleSaveEmployee = async ({ row, values, table }) => {
    const newValidationErrors = validateEmployee(values);
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
      handleDeleteEmployee(row.original);
    }
  };

  const handleDeleteEmployee = async (deletedEmployee) => {
    setIsSaving(true);
    try {
      await requestWithNotification('delete', `/employees`, deletedEmployee, true);
      setFetchedEmployees((prev) => prev.filter((employee) => employee.id !== deletedEmployee.id));
    } catch (error) {
      // Error handling is done in requestWithNotification
    }
    setIsSaving(false);
  };

  const table = useMaterialReactTable({
    columns,
    createDisplayMode: 'modal',
    data: fetchedEmployees,
    editDisplayMode: 'modal',
    enableColumnPinning: true,
    enableDensityToggle: false,
    enableEditing: true,
    enableFullScreenToggle: false,
    initialState: {
      columnPinning: { left: [], right: ['mrt-row-actions'] }
    },
    localization: MRT_Localization_PL,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px'
      }
    },
    muiToolbarAlertBannerProps: isLoadingEmployeesError
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    onCreatingRowCancel: () => setValidationErrors({}),
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveEmployee,
    positionActionsColumn: 'last',
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Edycja pracownika</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {internalEditComponents.filter(
            (component) =>
              !['id'].includes(component.props.cell.column.columnDef.accessorKey) &&
              !['age', 'adress', 'dateOfBirthDisplay'].includes(
                component.props.cell.column.columnDef.id
              )
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
      <Button variant="contained" onClick={handleOpen} sx={{ m: 2 }}>
        Stwórz pracownika
      </Button>
    ),
    state: {
      isLoading: isLoadingEmployees,
      isSaving,
      showAlertBanner: isLoadingEmployeesError,
      columnVisibility: {
        id: false,
        street: false,
        city: false,
        zipCode: false,
        country: false
        // dateOfBirth: false
      }
    }
  });

  return (
    <>
      <CreateEmployee
        open={open}
        onClose={handleClose}
        onEmployeeCreated={handleCreateEmployee}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
        <MaterialReactTable table={table} />
      </LocalizationProvider>
    </>
  );
}

function validateEmployee(employee) {
  let dateOfBirth = '';
  let city = '';
  let zipCode = '';
  let street = '';

  if (employee.employmentContract === 'Umowa Zlecenie') {
    dateOfBirth = !employee.dateOfBirth
      ? `Data urodzenia jest wymagana dla ${employee.employmentContract}`
      : '';
    city = !employee.city ? `Miasto jest wymagane dla ${employee.employmentContract}` : '';
    zipCode = !employee.zipCode ? `Kod pocztowy wymagany dla ${employee.employmentContract}` : '';
    street = !employee.street ? `Ulica jest wymagana dla ${employee.employmentContract}` : '';
  }

  return {
    firstName: !employee.firstName ? 'Imię jest wymagane' : '',
    lastName: !employee.lastName ? 'Nazwisko jest wymagane' : '',
    dateOfBirth,
    city,
    zipCode,
    street
  };
}
