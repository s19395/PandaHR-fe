import { useMemo, useState, useEffect } from 'react';
import { MaterialReactTable, createRow, useMaterialReactTable } from 'material-react-table';
import { Box, Button, IconButton, Tooltip, darken, lighten } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRequestWithNotification } from '../helper/AxiosHelper';
import moment from 'moment';
import Checkbox from '@mui/material/Checkbox';

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
      // Fake API call or actual API call to create a new contract
      const newContract = await requestWithNotification('post', '/contracts', {
        ...values,
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
        muiEditTextFieldProps: {
          variant: 'standard',
          type: 'date',
          InputLabelProps: { shrink: true },
          inputProps: {
            min: '1900-01-01'
          }
        }
      },
      {
        accessorFn: (row) => moment(row.validTo).format('DD.MM.YYYY'),
        id: 'validTo',
        header: 'Data do',
        muiEditTextFieldProps: {
          variant: 'standard',
          type: 'date',
          InputLabelProps: { shrink: true },
          inputProps: {
            min: '1900-01-01'
          }
        }
      },
      {
        accessorFn: (row) => moment(row.signedAt).format('DD.MM.YYYY'),
        header: 'Data zawarcia',
        id: 'signedAt',
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
        accessorKey: 'position',
        header: 'Stanowisko',
        enableEditing: false
      },
      {
        accessorKey: 'hourlyRate',
        header: 'Stawka/h',
        muiEditTextFieldProps: {
          required: true,
          type: 'number'
        }
      },
      {
        accessorKey: 'bonus',
        header: 'Premia',
        Cell: ({ cell }) => (
          <Box display="flex" justifyContent="center" alignItems="center">
            <Checkbox disabled checked={cell.getValue()} />
          </Box>
        ),
        Edit: ({ value, onChange }) => (
          <Box display="flex" justifyContent="center" alignItems="center">
            <Checkbox checked={value} onChange={(e) => onChange(e.target.checked)} />
          </Box>
        )
      },
      {
        accessorKey: 'bonus',
        header: 'Stawka premii',
        muiEditTextFieldProps: {
          required: true,
          type: 'number'
        }
      },
      {
        accessorKey: 'bonusThreshold',
        header: 'Warunek premii',
        muiEditTextFieldProps: {
          required: true,
          type: 'number'
        }
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
    editDisplayMode: 'row',
    enableExpanding: true,
    enableColumnPinning: true,
    enableEditing: true,
    enableDensityToggle: false,
    enableRowNumbers: true,
    initialState: {
      columnPinning: { left: [], right: ['mrt-row-actions'] },
      expanded: false,
      pagination: { pageSize: 20, pageIndex: 0 }
    },
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
        <Tooltip title="Add Subordinate">
          <IconButton
            onClick={() => {
              setCreatingRowIndex((staticRowIndex || 0) + 1);
              table.setCreatingRow(
                createRow(
                  table,
                  {
                    id: null,
                    firstName: '',
                    lastName: '',
                    city: '',
                    state: '',
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

  return <MaterialReactTable table={table} />;
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

export default ContractsData;
