import { useEffect, useMemo, useState } from 'react';
import { useRequestWithNotification } from '../helper/AxiosHelper';
import { createRow, MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { MRT_Localization_PL } from 'material-react-table/locales/pl';
import { Box, darken, IconButton, lighten, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import * as React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const Payroll = () => {
  const [filterDate, setFilterDate] = useState(dayjs());
  const [payroll, setPayroll] = useState([]);
  const [creatingRowIndex, setCreatingRowIndex] = useState();
  const [isLoadingPayroll, setIsLoadingPayroll] = useState(true);
  const [isLoadingPayrollError, setIsLoadingPayrollError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const requestWithNotification = useRequestWithNotification();

  const fetchPayroll = async () => {
    try {
      const normalizedDate = filterDate.format('YYYY-MM-DD');
      const payroll = await requestWithNotification(
        'get',
        `/payroll?date=${encodeURIComponent(normalizedDate)}`
      );
      console.log(payroll);
      setPayroll(payroll);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoadingPayrollError(true);
    } finally {
      setIsLoadingPayroll(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [filterDate]);

  const handleCreateBonus = async ({ values, row, table }) => {
    setIsSaving(true);
    try {
      await requestWithNotification('post', '/payroll/bonus', {
        employeeId: row.original.id,
        date: filterDate,
        comment: values.comment,
        bonus: values.bonus
      });

      table.setCreatingRow(null);
    } catch (error) {
      console.error('Error creating bonus:', error);
    } finally {
      setIsSaving(false);
      fetchPayroll();
    }
  };

  const handleSaveBonus = async ({ values, table, row }) => {
    setIsSaving(true);
    try {
      await requestWithNotification('put', `/payroll/bonus`, {
        comment: values.comment,
        bonus: values.bonus,
        id: row.original.id
      });

      table.setEditingRow(null);
    } catch (error) {
      console.error('Error saving bonus:', error);
    } finally {
      setIsSaving(false);
      fetchPayroll();
    }
  };

  const handleDeleteBonus = async (bonusId) => {
    setIsSaving(true);
    try {
      await requestWithNotification('delete', `/payroll/bonus/${bonusId}`);
    } catch (error) {
      console.error('Error deleting bonus:', error);
    }
    setIsSaving(false);
    fetchPayroll();
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'employeeId',
        header: 'Id pracownika'
      },
      {
        accessorKey: 'lastName',
        header: 'Nazwisko',
        enableEditing: false
      },
      {
        accessorKey: 'firstName',
        header: 'Imię',
        enableEditing: false
      },
      {
        accessorKey: 'employmentContract',
        header: 'Umowa',
        enableEditing: false
      },
      {
        accessorKey: 'hourlyRate',
        header: 'Stawka zł/h',
        enableEditing: false,
        Cell: ({ cell }) => (
          <>
            {cell.getValue()?.toLocaleString?.('pl-PL', {
              style: 'currency',
              currency: 'PLN',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </>
        )
      },
      {
        accessorKey: 'workedHours',
        header: 'Liczba godzin',
        enableEditing: false,
        Cell: ({ cell }) => (
          <>
            {cell.getValue()
              ? `${cell.getValue().toLocaleString({
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                })} h`
              : ''}
          </>
        )
      },
      {
        accessorKey: 'grossPay',
        header: 'Do wypłaty - godziny',
        enableEditing: false,
        Cell: ({ cell }) => (
          <>
            <Box sx={{ color: 'success.main', fontWeight: 'bold' }}>
              {cell.getValue()?.toLocaleString?.('pl-PL', {
                style: 'currency',
                currency: 'PLN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Box>
          </>
        )
      },
      {
        accessorKey: 'workedWeekends',
        header: 'Liczba weekendów',
        enableEditing: false,
        Cell: ({ cell }) => (
          <>
            {cell.getValue()
              ? `${cell.getValue().toLocaleString({
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })} dni`
              : ''}
          </>
        )
      },
      {
        accessorKey: 'bonusAmount',
        header: 'Premia weekendowa',
        enableEditing: false,
        Cell: ({ cell }) => (
          <>
            {cell.getValue()?.toLocaleString?.('pl-PL', {
              style: 'currency',
              currency: 'PLN',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </>
        )
      },
      {
        accessorKey: 'bonusPay',
        header: 'Do wypłaty - weekendy',
        enableEditing: false,
        Cell: ({ cell }) => (
          <>
            <Box sx={{ color: 'success.main', fontWeight: 'bold' }}>
              {cell.getValue()?.toLocaleString?.('pl-PL', {
                style: 'currency',
                currency: 'PLN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Box>
          </>
        )
      },
      {
        accessorKey: 'bonus',
        header: 'Premia',
        Cell: ({ cell }) => (
          <>
            {cell.getValue()?.toLocaleString?.('pl-PL', {
              style: 'currency',
              currency: 'PLN',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </>
        )
      },
      {
        accessorKey: 'bonusTotal',
        header: 'Premia razem',
        enableEditing: false,
        Cell: ({ cell }) => (
          <>
            <Box sx={{ color: 'success.main', fontWeight: 'bold' }}>
              {cell.getValue()?.toLocaleString?.('pl-PL', {
                style: 'currency',
                currency: 'PLN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Box>
          </>
        )
      },
      {
        accessorKey: 'comment',
        header: 'Komentarz',
        Cell: ({ cell }) => (
          <>
            <Tooltip
              title={
                <div style={{ whiteSpace: 'pre-line' }}>
                  {cell.getValue()?.split(';').join('\n')}
                </div>
              }>
              <span>{cell.getValue()}</span>
            </Tooltip>
          </>
        )
      },
      {
        accessorKey: 'totalPay',
        header: 'Do wypłaty',
        enableEditing: false,
        Cell: ({ cell }) => (
          <>
            <Box sx={{ color: 'success.main', fontWeight: 'bold' }}>
              {cell.getValue()?.toLocaleString?.('pl-PL', {
                style: 'currency',
                currency: 'PLN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Box>
          </>
        )
      }
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    createDisplayMode: 'row',
    data: payroll,
    defaultColumn: {
      minSize: 100,
      maxSize: 400,
      size: 150
    },
    filterFromLeafRows: true, //search for child rows and preserve parent rows
    editDisplayMode: 'row',
    enableColumnResizing: true,
    enableEditing: true,
    enableDensityToggle: false,
    enableExpanding: true,
    initialState: {
      columnPinning: { left: [], right: ['mrt-row-actions'] },
      expanded: true,
      pagination: { pageSize: 20, pageIndex: 0 }
    },
    localization: MRT_Localization_PL,
    muiExpandButtonProps: ({ row }) => ({
      sx: {
        display:
          row.depth === 0 && row.original.subRows && row.original.subRows.length > 0
            ? 'flex'
            : 'none'
      }
    }),
    muiTableBodyRowProps: ({ row }) => ({
      sx: (theme) => ({
        backgroundColor: darken(
          lighten(theme.palette.background.paper, 1),
          row.depth * (theme.palette.mode === 'dark' ? 0.05 : 0.05)
        )
      })
    }),
    muiTableContainerProps: {
      sx: {
        minHeight: '500px'
      }
    },
    muiToolbarAlertBannerProps: isLoadingPayrollError
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    onCreatingRowSave: handleCreateBonus,
    onEditingRowSave: handleSaveBonus,
    positionCreatingRow: creatingRowIndex,
    renderRowActions: ({ row, staticRowIndex, table }) => (
      <Box sx={{ display: 'flex' }}>
        {row.depth === 1 && (
          <>
            <Tooltip title="Edytuj">
              <IconButton onClick={() => table.setEditingRow(row)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Usuń">
              <IconButton color="error" onClick={() => handleDeleteBonus(row.original.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
        {row.depth === 0 && (
          <>
            <Tooltip title="Dodaj premię">
              <IconButton
                onClick={() => {
                  setCreatingRowIndex((staticRowIndex || 0) + 1);
                  table.setCreatingRow(
                    createRow(
                      table,
                      { id: row.original.employeeId, subRows: [] },
                      -1,
                      row.depth + 1
                    )
                  );
                  console.log('Creating row for employee:', row.original.employeeId);
                }}>
                <PersonAddAltIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <DatePicker
        label="Data rozliczenia"
        views={['month', 'year']}
        defaultValue={filterDate}
        onChange={(newValue) => setFilterDate(newValue)}
        sx={{ m: 2 }}
      />
    ),
    state: {
      isLoading: isLoadingPayroll,
      isSaving,
      showAlertBanner: isLoadingPayrollError,
      columnVisibility: { employeeId: false },
      density: 'compact'
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
      <MaterialReactTable table={table} />
    </LocalizationProvider>
  );
};

export default Payroll;
