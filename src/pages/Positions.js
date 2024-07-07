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
  ListItem,
  List
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import positionsTheme from './themes/positionsTheme';
import { ThemeProvider } from '@mui/material/styles';
import { useRequestWithNotification } from '../helper/AxiosHelper';
import moment from 'moment';
import Duties from './Duties';

export default function Positions() {
  const [validationErrors, setValidationErrors] = useState({});
  const [fetchedPositions, setFetchedPositions] = useState([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);
  const [isLoadingPositionsError, setIsLoadingPositionsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dutyList, setDutyList] = useState([]);
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
      { accessorKey: 'pid', header: 'ID', enableEditing: false, size: 80 },
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
      }
    ],
    [validationErrors]
  );

  const validateRequired = (value) => !!value.length;

  const validatePosition = (position) => ({
    title: !validateRequired(position.title) ? 'Stanowisko jest wymagane' : ''
  });

  const handleSavePosition = async ({ values, table, isNew = false }) => {
    const newValidationErrors = validatePosition(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);
    try {
      const method = isNew ? 'post' : 'put';
      const url = isNew ? '/positions' : `/positions/${values.pid}`;
      const newPosition = await requestWithNotification(method, url, { ...values, dutyList }, true);
      if (isNew) {
        setFetchedPositions((prev) => [...prev, newPosition]);
        table.setCreatingRow(null);
        fetchPositions();
      } else {
        setFetchedPositions((prev) =>
          prev.map((position) => (position.pid === values.pid ? values : position))
        );
        table.setEditingRow(null);
        fetchPositions();
      }
    } catch (error) {
      /* empty */
    }
    setIsSaving(false);
  };

  const handleDeletePosition = async (id) => {
    setIsSaving(true);
    try {
      await requestWithNotification('delete', `/positions/${id}`, {}, true);
      setFetchedPositions((prev) => prev.filter((position) => position.pid !== id));
    } catch (error) {
      /* empty */
    }
    setIsSaving(false);
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedPositions,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingPositionsError
      ? { color: 'error', children: 'Error loading data' }
      : undefined,
    muiTableContainerProps: { sx: { minHeight: '500px' } },
    renderDetailPanel: ({ row }) => (
      <Box sx={{ mb: 1 }}>
        <List>
          {Array.isArray(row.original.dutyList) ? (
            row.original.dutyList.map((duty, index) => (
              <Box key={index} sx={{ marginBottom: '1px' }}>
                <ListItem>
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
      </Box>
    ),
    enableFullScreenToggle: false,
    enableExpandAll: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableDensityToggle: false,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: (props) => handleSavePosition({ ...props, isNew: true }),
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSavePosition,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Utwórz stanowisko</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {internalEditComponents.filter(
            (component) =>
              !['pid', 'createdAt'].includes(component.props.cell.column.columnDef.accessorKey)
          )}
          <Duties
            dutyList={dutyList}
            setDutyList={setDutyList}
            newDuty={newDuty}
            setNewDuty={setNewDuty}
          />
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => {
      useEffect(() => {
        if (row?.original?.dutyList) setDutyList(row.original.dutyList);
      }, [row]);
      return (
        <>
          <DialogTitle variant="h5">Edytuj stanowisko</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {internalEditComponents.filter(
              (component) =>
                !['pid', 'createdAt'].includes(component.props.cell.column.columnDef.accessorKey)
            )}
            <Duties
              dutyList={dutyList}
              setDutyList={setDutyList}
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
        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={() =>
              window.confirm('Are you sure you want to delete this position?') &&
              handleDeletePosition(row.original.pid)
            }>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    positionActionsColumn: 'last',
    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
        Utwórz stanowisko
      </Button>
    ),
    state: { isLoading: isLoadingPositions, isSaving, showAlertBanner: isLoadingPositionsError }
  });

  return (
    <ThemeProvider theme={positionsTheme}>
      <MaterialReactTable table={table} />
    </ThemeProvider>
  );
}
