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
import { useRequestWithNotification } from '../service/AxiosService';
import PositionDuty from './PositionDuty';
import List from '@mui/material/List';
import { MRT_Localization_PL } from 'material-react-table/locales/pl';
import dayjs from 'dayjs';

export default function Position() {
  const [validationErrors, setValidationErrors] = useState({});
  const [fetchedPositions, setFetchedPositions] = useState([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);
  const [isLoadingPositionsError, setIsLoadingPositionsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dutyList, setDutyList] = useState([]);
  const [newDuty, setNewDuty] = useState('');

  const requestWithNotification = useRequestWithNotification();
  const positionStatus = ['Aktywne', 'Nieaktywne'];

  const fetchPositions = async () => {
    try {
      setIsLoadingPositions(true);
      const data = await requestWithNotification('get', '/positions');
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
      { accessorKey: 'positionId', header: 'ID', enableEditing: false },
      {
        accessorKey: 'name',
        header: 'Stanowisko',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          onFocus: () => setValidationErrors({ ...validationErrors, name: undefined })
        }
      },
      {
        accessorKey: 'createdAt',
        header: 'Utworzony',
        enableEditing: false,
        Cell: ({ cell }) => <span>{dayjs(cell.getValue()).format('DD.MM.YYYY')}</span>
      },
      {
        accessorKey: 'status',
        header: 'Status',
        editVariant: 'select',
        editSelectOptions: positionStatus,
        muiEditTextFieldProps: {
          select: true,
          error: !!validationErrors?.status,
          helperText: validationErrors?.status
        }
      },
      {
        accessorFn: (row) => row.dutyList.map((duty) => duty.description).join(', '),
        id: 'dutyList',
        header: '',
        enableEditing: false
      }
    ],
    [validationErrors]
  );

  const validateRequired = (value) => !!value.length;

  const validatePosition = (position) => ({
    name: !validateRequired(position.name) ? 'Stanowisko jest wymagane' : '',
    status: !validateRequired(position.status) ? 'Status jest wymagany' : ''
  });

  const handleSavePosition = async ({ row, values, table, isNew = false }) => {
    const newValidationErrors = validatePosition(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);
    try {
      const positionDto = {
        positionId: row.original.positionId,
        name: values.name,
        status: values.status,
        dutyList: dutyList
      };

      const method = isNew ? 'post' : 'put';
      const url = isNew ? '/positions' : `/positions`;
      const newPosition = await requestWithNotification(method, url, { ...positionDto }, true);
      if (isNew) {
        setFetchedPositions((prev) => [...prev, newPosition]);
        table.setCreatingRow(null);
      } else {
        setFetchedPositions((prev) =>
          prev.map((position) =>
            position.positionId === positionDto.positionId ? positionDto : position
          )
        );
        table.setEditingRow(null);
      }
    } catch (error) {
      /* empty */
    }
    setIsSaving(false);
  };

  const table = useMaterialReactTable({
    columns,
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
      columnPinning: { left: [], right: ['mrt-row-actions'] },
      columnVisibility: { dutyList: false, positionId: false },
      expanded: true
    },
    localization: MRT_Localization_PL,
    mrtTheme: () => ({
      baseBackgroundColor: '#1b1d1e'
    }),
    muiDetailPanelProps: {
      sx: { padding: '0px 50px' }
    },
    muiExpandButtonProps: ({ row }) => ({
      sx: {
        display:
          Array.isArray(row.original.dutyList) && row.original.dutyList.length > 0 ? 'flex' : 'none'
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
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => {
      useEffect(() => {
        setDutyList([]);
      }, []);

      return (
        <>
          <DialogTitle variant="h5">Nowe stanowisko</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {internalEditComponents.filter(
              (component) =>
                !['positionId', 'createdAt'].includes(
                  component.props.cell.column.columnDef.accessorKey
                ) && !['dutyList'].includes(component.props.cell.column.columnDef.id)
            )}
            <PositionDuty
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
    renderDetailPanel: ({ row }) => (
      <List sx={{ listStyleType: 'disc' }}>
        {Array.isArray(row.original.dutyList) && row.original.dutyList.length > 0 ? (
          row.original.dutyList.map((duty, index) => (
            <Box key={index}>
              <ListItem sx={{ display: 'list-item' }}>
                <ListItemText primary={duty.description} />
              </ListItem>
            </Box>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No dutyList available" />
          </ListItem>
        )}
      </List>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => {
      useEffect(() => {
        if (row?.original?.dutyList) setDutyList(row.original.dutyList);
      }, [row]);
      return (
        <>
          <DialogTitle variant="h5">Edycja stanowiska</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {internalEditComponents.filter(
              (component) =>
                !['positionId', 'createdAt'].includes(
                  component.props.cell.column.columnDef.accessorKey
                ) && !['dutyList'].includes(component.props.cell.column.columnDef.id)
            )}
            <PositionDuty
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
        <Tooltip name="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="contained" onClick={() => table.setCreatingRow(true)} sx={{ m: 2 }}>
        Stwórz stanowisko
      </Button>
    ),
    state: {
      isLoading: isLoadingPositions,
      isSaving,
      showAlertBanner: isLoadingPositionsError
    }
  });

  return <MaterialReactTable table={table} />;
}
