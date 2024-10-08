import * as React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { MaterialReactTable, createRow, useMaterialReactTable } from 'material-react-table';
import { Box, Button, IconButton, Tooltip, darken, lighten, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRequestWithNotification } from '../service/AxiosService';
import { MRT_Localization_PL } from 'material-react-table/locales/pl';
import { CustomCheckbox } from './CustomFields';
import Checkbox from '@mui/material/Checkbox';
import 'dayjs/locale/pl';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import EmployeeSearch from './EmployeeSearch';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';

const Contracts = () => {
  const [employee, setEmployee] = useState();
  const [positions, setPositions] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [creatingRowIndex, setCreatingRowIndex] = useState();
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);
  const [isLoadingContractsError, setIsLoadingContractsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const requestWithNotification = useRequestWithNotification();

  const fetchPositions = async () => {
    const positionsData = await requestWithNotification('get', '/positions/active');
    setPositions(positionsData);
  };

  const fetchData = async () => {
    try {
      if (!employee) {
        setContracts([]);
      } else {
        const contractsData = await requestWithNotification(
          'get',
          `/contracts/employee/${employee.id}`
        );
        setContracts(contractsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoadingContractsError(true);
    } finally {
      setIsLoadingContracts(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [employee]);

  const handleCreateContract = async ({ values, row, table }) => {
    const newValidationErrors = validateContracts(values, row);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);

    try {
      const pandaContractDto = transformValuesToPandaContractDto(values);

      const newContract = await requestWithNotification('post', '/contracts', {
        ...pandaContractDto,
        parentContractId: row.original.contractId,
        employeeId: employee.id
      });

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

      table.setCreatingRow(null);
    } catch (error) {
      console.error('Error creating contract:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContract = async ({ values, table, row }) => {
    const newValidationErrors = validateContracts(values, row);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    setIsSaving(true);
    try {
      const pandaContractDto = transformValuesToPandaContractDto(values);

      await requestWithNotification('put', `/contracts`, {
        ...pandaContractDto,
        id: row.original.id
      });
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
    } finally {
      await fetchData();
      setIsSaving(false);
    }
  };

  const handleDeleteContract = async (contractId) => {
    setIsSaving(true);
    try {
      await requestWithNotification('delete', `/contracts/${contractId}`);
      setContracts((prev) => {
        const newContracts = JSON.parse(JSON.stringify(prev));
        const contract = findContractInTree(contractId, newContracts);
        if (contract) {
          const parentContract = findContractInTree(contract.parentContractId, newContracts);
          if (parentContract) {
            parentContract.subRows = parentContract.subRows?.filter(
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

  const generateDocument = async (values) => {
    try {
      const response = await axios.get(`/contracts/generate/${values.id}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition.split('filename=')[1].split(';')[0].replace(/"/g, '');
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error('Error generating document:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setEmployee(employee);
  };

  function transformValuesToPandaContractDto(values) {
    const positionDto = positions.find((position) => position.name === values.positionName);

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
      signedAt: dayjs(values.signedAt).format('YYYY-MM-DD'),
      validFrom: dayjs(values.validFrom).format('YYYY-MM-DD'),
      validTo: values.validTo ? dayjs(values.validTo).format('YYYY-MM-DD') : null,
      terminationDate: values.terminationDate
        ? dayjs(values.terminationDate).format('YYYY-MM-DD')
        : null,
      earningConditionsDto: earningConditionsDto,
      positionDto: positionDto,
      subRows: values.subRows
    };
  }

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
        accessorKey: 'validFrom',
        id: 'validFrom',
        header: 'Data od',
        Cell: ({ row }) => (
          <span>
            {row.original.validFrom
              ? dayjs(row.original.validFrom).format('DD.MM.YYYY').toString()
              : ''}
          </span>
        ),
        Edit: ({ column, row }) => {
          return (
            <DatePicker
              label="Data od"
              defaultValue={dayjs(row._valuesCache.validFrom)}
              onChange={(newValue) => (row._valuesCache[column.id] = newValue)}
              slotProps={{
                textField: {
                  variant: 'standard',
                  error: !!validationErrors?.validFrom,
                  helperText: validationErrors?.validFrom
                }
              }}
            />
          );
        }
      },
      {
        accessorKey: 'validTo',
        id: 'validTo',
        header: 'Data do',
        Cell: ({ row }) => (
          <span>
            {row.original.validTo && employee?.employmentContract === 'Umowa Zlecenie'
              ? dayjs(row.original.validTo).format('DD.MM.YYYY').toString()
              : ''}
          </span>
        ),
        Edit: ({ column, row }) => {
          return employee?.employmentContract === 'Umowa Zlecenie' && row.depth === 0 ? (
            <DatePicker
              label="Data do"
              defaultValue={dayjs(row._valuesCache.validTo)}
              onChange={(newValue) => (row._valuesCache[column.id] = newValue)}
              slotProps={{
                textField: {
                  variant: 'standard',
                  error: !!validationErrors?.validTo,
                  helperText: validationErrors?.validTo
                }
              }}
            />
          ) : null;
        }
      },
      {
        accessorKey: 'signedAt',
        id: 'signedAt',
        header: 'Data zawarcia',
        Cell: ({ row }) => (
          <span>
            {row.original.signedAt
              ? dayjs(row.original.signedAt).format('DD.MM.YYYY').toString()
              : ''}
          </span>
        ),
        Edit: ({ column, row }) => {
          return (
            <DatePicker
              label="Data zawarcia"
              defaultValue={dayjs(row._valuesCache.signedAt)}
              onChange={(newValue) => (row._valuesCache[column.id] = newValue)}
              slotProps={{
                textField: {
                  variant: 'standard',
                  error: !!validationErrors?.signedAt,
                  helperText: validationErrors?.signedAt
                }
              }}
            />
          );
        }
      },
      {
        accessorKey: 'terminationDate',
        id: 'terminationDate',
        header: 'Data zakończenia',
        Cell: ({ row }) => (
          <span>
            {row.original.terminationDate
              ? dayjs(row.original.terminationDate).format('DD.MM.YYYY').toString()
              : ''}
          </span>
        ),
        Edit: ({ column, row }) => {
          return row.depth === 0 ? (
            <DatePicker
              label="Data zakończenia"
              defaultValue={dayjs(row._valuesCache.terminationDate)}
              onChange={(newValue) => (row._valuesCache[column.id] = newValue)}
              slotProps={{
                textField: {
                  variant: 'standard',
                  error: !!validationErrors?.terminationDate,
                  helperText: validationErrors?.terminationDate
                }
              }}
            />
          ) : null;
        }
      },
      {
        accessorFn: (row) => row.positionDto?.name || '',
        header: 'Stanowisko',
        id: 'positionName',
        editSelectOptions: positions.map((item) => item.name),
        muiEditTextFieldProps: ({ row }) => ({
          select: true,
          sx: {
            mt: 3,
            display: row.depth === 0 ? 'flex' : 'none'
          }
        })
      },
      {
        accessorFn: (row) => row.earningConditionsDto?.hourlyRate,
        header: 'Stawka/h',
        id: 'hourlyRate',
        filterVariant: 'autocomplete',
        Cell: ({ cell }) => (cell.getValue() ? cell.getValue() + ' zł/h' : ''),
        Edit: ({ column, row }) => {
          return (
            <TextField
              error={!!validationErrors.hourlyRate}
              helperText={validationErrors.hourlyRate}
              sx={{
                'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none'
                },
                'input[type=number]': {
                  MozAppearance: 'textfield'
                }
              }}
              variant="standard"
              label="Stawka godzinowa"
              type="number"
              fullWidth
              defaultValue={row._valuesCache[column.id]}
              onChange={(newValue) => (row._valuesCache[column.id] = Number(newValue.target.value))}
              margin="normal"
              InputProps={{
                inputProps: { min: 0, max: 280 },
                endAdornment: 'zł/h '
              }}
            />
          );
        }
      },
      {
        accessorFn: (row) => row.earningConditionsDto?.bonusEnabled || false,
        header: 'Premia',
        id: 'bonusEnabled',
        filterVariant: 'checkbox',
        Cell: ({ cell }) => <Checkbox disabled checked={cell.getValue()} />,
        Edit: CustomCheckbox
      },
      {
        accessorFn: (row) => row.earningConditionsDto?.bonus,
        id: 'bonus',
        header: 'Stawka premii',
        Cell: ({ cell }) => (cell.getValue() ? cell.getValue() + ' zł' : ''),
        Edit: ({ column, row }) => {
          return (
            <TextField
              error={!!validationErrors.bonus}
              helperText={validationErrors.bonus}
              sx={{
                'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none'
                },
                'input[type=number]': {
                  MozAppearance: 'textfield'
                }
              }}
              variant="standard"
              label="Stawka premii"
              type="number"
              fullWidth
              defaultValue={row._valuesCache[column.id]}
              onChange={(newValue) => (row._valuesCache[column.id] = Number(newValue.target.value))}
              margin="normal"
              InputProps={{
                inputProps: { min: 0, max: 200 },
                endAdornment: 'zł'
              }}
            />
          );
        }
      },
      {
        accessorFn: (row) => row.earningConditionsDto?.bonusThreshold,
        id: 'bonusThreshold',
        header: 'Warunek premii',
        Cell: ({ cell }) => (cell.getValue() ? cell.getValue() + ' dni' : ''),
        Edit: ({ column, row }) => {
          return (
            <TextField
              error={!!validationErrors.bonusThreshold}
              helperText={validationErrors.bonusThreshold}
              sx={{
                'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none'
                },
                'input[type=number]': {
                  MozAppearance: 'textfield'
                }
              }}
              variant="standard"
              label="Premia za dzień"
              type="number"
              fullWidth
              defaultValue={row._valuesCache[column.id]}
              onChange={(newValue) => (row._valuesCache[column.id] = Number(newValue.target.value))}
              margin="normal"
              InputProps={{
                inputProps: { min: 0, max: 10 },
                endAdornment: 'dni'
              }}
            />
          );
        }
      }
    ],
    [employee, validationErrors]
  );

  const table = useMaterialReactTable({
    columns,
    createDisplayMode: 'row',
    data: contracts,
    defaultColumn: {
      minSize: 50,
      maxSize: 9001,
      size: 150
    },
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 180
      },
      'mrt-row-expand': {
        size: 50
      }
    },
    editDisplayMode: 'row',
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableDensityToggle: false,
    enableEditing: true,
    enableExpanding: true,
    filterFromLeafRows: true,
    initialState: {
      columnPinning: { left: [], right: ['mrt-row-actions'] },
      expanded: true,
      pagination: { pageSize: 20, pageIndex: 0 }
    },
    localization: MRT_Localization_PL,
    mrtTheme: () => ({
      baseBackgroundColor: '#1b1d1e'
    }),
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
        backgroundColor: lighten(
          darken(theme.palette.background.paper, 0.01),
          row.depth * (theme.palette.mode === 'dark' ? 0.05 : 0.1)
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
        {employee?.employmentContract === 'Umowa Zlecenie' && (
          <Tooltip title="Wygeneruj dokument">
            <IconButton onClick={() => generateDocument(row.original)}>
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Edytuj">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Usuń">
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
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbar: () => (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          ml: 2
        }}>
        <EmployeeSearch onEmployeeSelect={handleEmployeeSelect} sx={{ m: 2 }} />
        {employee && (
          <Button variant="contained" onClick={() => table.setCreatingRow(true)} sx={{ m: 2 }}>
            Utwórz nową umowę
          </Button>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          setCreatingRowIndex(table.getRowModel().rows.length);
          table.setCreatingRow(true);
        }}>
        Utwórz umowę
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

const validateRequired = (value) => value !== undefined && !!value.length;

function validateContracts(contract, row) {
  return {
    validFrom: !dayjs(contract.validFrom).isValid() ? 'Niepoprawna data' : '',
    signedAt: !dayjs(contract.signedAt).isValid()
      ? 'Niepoprawna data'
      : dayjs(contract.signedAt).isAfter(contract.validFrom)
        ? 'Data zawarcia nie może być po dacie rozpoczęcia'
        : '',
    validTo:
      row.depth === 0 &&
      dayjs(contract.validTo).isValid() &&
      dayjs(contract.validTo).isBefore(contract.validFrom)
        ? 'Data zakończenia nie może być przed datą rozpoczęcia'
        : '',
    hourlyRate:
      validateRequired(contract.hourlyRate) || contract.hourlyRate <= 0
        ? 'Stawka godzinowa musi być większa niż 0'
        : '',
    bonus:
      contract.bonusEnabled === true && (validateRequired(contract.bonus) || contract.bonus <= 0)
        ? 'Stawka premii musi być większa niż 0'
        : '',
    bonusThreshold:
      contract.bonusEnabled === true &&
      (validateRequired(contract.bonusThreshold) || contract.bonusThreshold <= 0)
        ? 'Liczba dni do premii musi być większa niż 0'
        : contract.bonusThreshold > 10 || validateRequired(contract.bonusThreshold)
          ? 'Liczba dni do premii nie może być większa niż 10'
          : ''
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

export default Contracts;
