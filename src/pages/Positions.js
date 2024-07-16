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
  Tooltip,
  ListItemText,
  ListItem
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import materialReactTableTheme from './themes/MaterialReactTableTheme';
import { ThemeProvider } from '@mui/material/styles';
import { useRequestWithNotification } from '../helper/AxiosHelper';
import moment from 'moment';
import Duties from './Duties';
import List from '@mui/material/List';
import { MRT_Localization_PL } from 'material-react-table/locales/pl';

export default function Positions() {
  const [validationErrors, setValidationErrors] = useState({});
  const [fetchedPositions, setFetchedPositions] = useState([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);
  const [isLoadingPositionsError, setIsLoadingPositionsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [duties, setDuties] = useState([]);
  const [newDuty, setNewDuty] = useState('');

  const requestWithNotification = useRequestWithNotification();
  const statuses = ['ACTIVE', 'INACTIVE'];

  const fetchPositions = async () => {
    try {
      setIsLoadingPositions(true);
      const data = await requestWithNotification('get', '/positions/findAll');
      setFetchedPositions(data);
      setIsLoadingPositions(false);
    } catch (error) {
      setIsLoadingPositionsError(true);
      setIsLoadingPositions(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: 'pid', header: 'ID', enableEditing: false },
      {
        accessorKey: 'title',
        header: 'Stanowisko',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.title,
          helperText: validationErrors?.title,
          onFocus: () => setValidationErrors({ ...validationErrors, title: undefined })
        }
      },
      {
        accessorKey: 'createdAt',
        header: 'Utworzony',
        enableEditing: false,
        Cell: ({ cell }) => <span>{moment(cell.getValue()).format('DD.MM.YYYY')}</span>
      },
      {
        accessorKey: 'status',
        header: 'Status',
        editVariant: 'select',
        editSelectOptions: statuses,
        muiEditTextFieldProps: {
          select: true,
          error: !!validationErrors?.status,
          helperText: validationErrors?.status
        }
      },
      {
        accessorFn: (row) => row.duties.map((duty) => duty.description).join(', '),
        id: 'duties',
        header: '',
        enableEditing: false
      }
    ],
    [validationErrors]
  );

  const validateRequired = (value) => !!value.length;

  const validatePosition = (position) => ({
    title: !validateRequired(position.title) ? 'Stanowisko jest wymagane' : ''
  });

  function transformValuesToPandaContractDto(values) {
    return {
      posId: values.pid,
      title: values.title,
      status: values.status,
      dutyList: duties
    };
  }

  const handleSavePosition = async ({ values, table, isNew = false }) => {
    const newValidationErrors = validatePosition(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);
    try {
      values = transformValuesToPandaContractDto(values);
      const method = isNew ? 'post' : 'put';
      const url = isNew ? '/positions' : `/positions`;
      const newPosition = await requestWithNotification(method, url, { ...values }, true);
      if (isNew) {
        setFetchedPositions((prev) => [...prev, newPosition]);
        table.setCreatingRow(null);
      } else {
        setFetchedPositions((prev) =>
          prev.map((position) => (position.pid === values.pid ? values : position))
        );
        table.setEditingRow(null);
      }
      fetchPositions();
    } catch (error) {
      /* empty */
    }
    setIsSaving(false);
  };

  const table = useMaterialReactTable({
    columns,
    muiDetailPanelProps: {
      sx: { padding: '0px 50px' }
    },
    createDisplayMode: 'modal',
    data: fetchedPositions,
    editDisplayMode: 'modal',
    enableColumnPinning: true,
    enableDensityToggle: false,
    enableEditing: true,
    enableExpandAll: true,
    enableFullScreenToggle: false,
    enableStickyFooter: true,
    enableStickyHeader: true,
    initialState: {
      columnPinning: { left: [], right: ['mrt-row-actions'] }
    },
    localization: MRT_Localization_PL,
    muiExpandButtonProps: ({ row }) => ({
      sx: {
        display:
          Array.isArray(row.original.duties) && row.original.duties.length > 0 ? 'flex' : 'none'
      }
    }),
    muiTableContainerProps: { sx: { minHeight: '500px' } },
    muiToolbarAlertBannerProps: isLoadingPositionsError
      ? { color: 'error', children: 'Error loading data' }
      : undefined,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: (props) => handleSavePosition({ ...props, isNew: true }),
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSavePosition,
    positionActionsColumn: 'last',
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Nowe stanowisko</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {internalEditComponents.filter(
            (component) =>
              !['pid', 'createdAt'].includes(component.props.cell.column.columnDef.accessorKey) &&
              !['duties'].includes(component.props.cell.column.columnDef.id)
          )}
          <Duties duties={duties} setDuties={setDuties} newDuty={newDuty} setNewDuty={setNewDuty} />
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderDetailPanel: ({ row }) => (
      <List sx={{ listStyleType: 'disc' }}>
        {Array.isArray(row.original.duties) && row.original.duties.length > 0 ? (
          row.original.duties.map((duty, index) => (
            <Box key={index}>
              <ListItem sx={{ display: 'list-item' }}>
                <ListItemText primary={duty.description} />
              </ListItem>
            </Box>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No duties available" />
          </ListItem>
        )}
      </List>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => {
      useEffect(() => {
        if (row?.original?.duties) setDuties(row.original.duties);
      }, [row]);
      return (
        <>
          <DialogTitle variant="h5">Edycja stanowiska</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {internalEditComponents.filter(
              (component) =>
                !['pid', 'createdAt'].includes(component.props.cell.column.columnDef.accessorKey) &&
                !['duties'].includes(component.props.cell.column.columnDef.id)
            )}
            <Duties
              duties={duties}
              setDuties={setDuties}
              newDuty={newDuty}
              setNewDuty={setNewDuty}
            />
          </DialogContent>
          <DialogActions>
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </DialogActions>
        </>
      );
    },
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
        Stwórz stanowisko
      </Button>
    ),
    state: {
      isLoading: isLoadingPositions,
      isSaving,
      showAlertBanner: isLoadingPositionsError,
      columnVisibility: { duties: false }
    }
  });

  return (
    <ThemeProvider theme={materialReactTableTheme}>
      <MaterialReactTable table={table} />
    </ThemeProvider>
  );
}
