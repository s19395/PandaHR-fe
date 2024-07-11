import * as React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { MaterialReactTable, createRow, useMaterialReactTable } from 'material-react-table';
import { Box, Button, IconButton, Tooltip, darken, lighten } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRequestWithNotification } from '../helper/AxiosHelper';
import moment from 'moment';
import { MRT_Localization_PL } from 'material-react-table/locales/pl';
import { CustomNumericEdit, CustomCheckbox, dateFieldProps } from './mrtEditHelper';
import Checkbox from '@mui/material/Checkbox';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const ContractsData = () => {
  const [contracts, setContracts] = useState([]);
  const [creatingRowIndex, setCreatingRowIndex] = useState();
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);
  const [isLoadingContractsError, setIsLoadingContractsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const requestWithNotification = useRequestWithNotification();

  const fetchContracts = async () => {
    try {
      setIsLoadingContracts(true);
      const data = await requestWithNotification('get', '/contracts/findAll');
      setContracts(data);
      setIsLoadingContracts(false);
    } catch (error) {
      setIsLoadingContractsError(true);
      setIsLoadingContracts(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleCreateContract = async ({ values, row, table }) => {
    const newValidationErrors = validateConracts(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);

    try {
      const pandaContractDto = transformValuesToPandaContractDto(values);

      // Fake API call or actual API call to create a new contract
      const newContract = await requestWithNotification('post', '/contracts', {
        ...pandaContractDto,
        parentContractId: row.original.contractId
      });

      // Optimistically update the state
      setContracts((prevContracts) => {
        const newContracts = JSON.parse(JSON.stringify(prevContracts)); // deep copy
        newContract.subRows = [];

        if (newContract.parentContractId) {
          const parentContract = findContractInTree(newContract.parentContractId, newContracts);
          if (parentContract) {
            parentContract.subRows = [...(parentContract.subRows || []), newContract];
          }
        } else {
          newContracts.push(newContract);
        }

        return newContracts;
      });

      // Exit creating mode
      table.setCreatingRow(null);
    } catch (error) {
      console.error('Error creating contract:', error);
      // Handle error accordingly
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContract = async ({ values, table }) => {
    const newValidationErrors = validateConracts(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);
    try {
      await requestWithNotification('put', `/contracts/${values.id}`, values);
      setContracts((prev) => {
        const newContracts = JSON.parse(JSON.stringify(prev));
        let contract = findContractInTree(values.id, newContracts);
        // eslint-disable-next-line no-unused-vars
        contract = { ...contract, ...values };
        return newContracts;
      });
      table.setEditingRow(null);
    } catch (error) {
      /* empty */
    }
    setIsSaving(false);
  };

  const handleDeleteContract = async (contractId) => {
    setIsSaving(true);
    try {
      await requestWithNotification('delete', `/contracts/${contractId}`);
      setContracts((prev) => {
        const newContracts = JSON.parse(JSON.stringify(prev));
        const contract = findContractInTree(contractId, newContracts);
        if (contract) {
          const manager = findContractInTree(contract.managerId, newContracts);
          if (manager) {
            manager.subRows = manager.subRows?.filter(
              (subContract) => subContract.id !== contract.id
            );
          } else {
            return newContracts.filter((contract) => contract.id !== contractId);
          }
        }
        return newContracts;
      });
    } catch (error) {
      /* empty */
    }
    setIsSaving(false);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false
      },
      {
        accessorKey: 'name',
        header: 'Dokument',
        enableEditing: false
      },
      {
        accessorFn: (row) => moment(row.validFrom).format('DD.MM.YYYY'),
        header: 'Data od',
        id: 'validFrom',
        filterVariant: 'date-range',
        muiEditTextFieldProps: dateFieldProps
      },
      {
        accessorFn: (row) => moment(row.validTo).format('DD.MM.YYYY'),
        id: 'validTo',
        header: 'Data do',
        filterVariant: 'date-range',
        muiEditTextFieldProps: dateFieldProps
      },
      {
        accessorFn: (row) => moment(row.signedAt).format('DD.MM.YYYY'),
        header: 'Data zawarcia',
        id: 'signedAt',
        filterVariant: 'date-range',
        muiEditTextFieldProps: dateFieldProps
      },
      {
        accessorKey: 'position',
        header: 'Stanowisko',
        enableEditing: false
      },
      {
        accessorKey: 'earningConditionsDto.hourlyRate',
        header: 'Stawka/h',
        filterVariant: 'autocomplete',
        Edit: (props) => <CustomNumericEdit {...props} suffix=" zł/h" />
      },
      {
        accessorKey: 'earningConditionsDto.bonusEnabled',
        header: 'Premia',
        filterVariant: 'checkbox',
        Cell: ({ cell }) => <Checkbox disabled checked={cell.getValue()} />,
        Edit: CustomCheckbox
      },
      {
        accessorKey: 'earningConditionsDto.bonus',
        id: 'bonus',
        header: 'Stawka premii',
        Cell: ({ cell }) => <span> {cell.getValue()} </span>,
        Edit: (props) => <CustomNumericEdit {...props} suffix=" zł" />
      },
      {
        accessorKey: 'earningConditionsDto.bonusThreshold',
        header: 'Warunek premii',
        Edit: (props) => <CustomNumericEdit {...props} suffix=" dni" />
      }
    ],
    [validationErrors]
  );

  const table = useMaterialReactTable({
    columns,
    createDisplayMode: 'row',
    data: contracts,
    defaultColumn: {
      minSize: 20,
      maxSize: 9001,
      size: 50
    },
    filterFromLeafRows: true, //search for child rows and preserve parent rows
    editDisplayMode: 'row',
    enableColumnPinning: true,
    enableDensityToggle: false,
    enableEditing: true,
    enableExpanding: true,
    enableRowNumbers: true,
    initialState: {
      columnPinning: { left: [], right: ['mrt-row-actions'] },
      expanded: false,
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
          lighten(theme.palette.background.paper, 0.1),
          row.depth * (theme.palette.mode === 'dark' ? 0.2 : 0.1)
        )
      })
    }),
    muiTableContainerProps: {
      sx: {
        minHeight: '500px'
      }
    },
    muiToolbarAlertBannerProps: isLoadingContractsError
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateContract,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveContract,
    positionCreatingRow: creatingRowIndex,
    renderRowActions: ({ row, staticRowIndex, table }) => (
      <Box sx={{ display: 'flex' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => handleDeleteContract(row.original.id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        {row.depth === 0 && (
          <Tooltip title="Stwórz aneks">
            <IconButton
              onClick={() => {
                setCreatingRowIndex((staticRowIndex || 0) + 1);
                table.setCreatingRow(
                  createRow(
                    table,
                    {
                      contractId: row.original.id,
                      subRows: []
                    },
                    -1,
                    row.depth + 1
                  )
                );
              }}>
              <PersonAddAltIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        startIcon={<PersonAddAltIcon />}
        variant="contained"
        onClick={() => {
          setCreatingRowIndex(table.getRowModel().rows.length);
          table.setCreatingRow(true);
        }}>
        Create New Contract
      </Button>
    ),
    state: {
      isLoading: isLoadingContracts,
      isSaving,
      showAlertBanner: isLoadingContractsError,
      columnVisibility: { id: false },
      density: 'compact'
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MaterialReactTable table={table} />;
    </LocalizationProvider>
  );
};

// const validateRequired = (value) => !!value.length;

// eslint-disable-next-line no-unused-vars
function validateConracts(contract) {
  return {
    // firstName: !validateRequired(contract.firstName) ? 'First Name is Required' : '',
    // lastName: !validateRequired(contract.lastName) ? 'Last Name is Required' : ''
  };
}

function findContractInTree(contractId, contracts) {
  for (let i = 0; i < contracts.length; i++) {
    if (contracts[i].id === contractId) {
      return contracts[i];
    }
    if (contracts[i].subRows) {
      const found = findContractInTree(contractId, contracts[i].subRows);
      if (found) return found;
    }
  }
  return null;
}

function transformValuesToPandaContractDto(values) {
  const earningConditionsDto = {
    hourlyRate: values.hourlyRate,
    bonus: values.bonus,
    bonusEnabled: values.bonusEnabled,
    bonusThreshold: values.bonusThreshold
  };

  return {
    id: values.id,
    parentContractId: values.parentContractId,
    name: values.name,
    signedAt: values.signedAt,
    validFrom: values.validFrom,
    validTo: values.validTo,
    earningConditionsDto: earningConditionsDto,
    subRows: values.subRows
  };
}

export default ContractsData;
