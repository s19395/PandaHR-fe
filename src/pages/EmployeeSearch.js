import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

const EmployeeSearch = ({ onEmployeeSelect, sx }) => {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedEmployee, setSelectedEmployee] = React.useState(null);

  const flattenData = (data) => {
    return data.map((item) => ({
      label: `${item.firstName} ${item.lastName}`,
      original: item
    }));
  };

  const fetchOptions = async (value) => {
    if (!value) return; // Ensure fetchOptions is called only with a valid value
    setLoading(true);
    try {
      const response = await axios.get(`/employees/search?value=${value}`);
      if (response.data.httpStatus === 'OK') {
        setOptions(flattenData(response.data.data));
      } else {
        console.error('Error fetching data:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event, value) => {
    if (value === '') {
      setOptions([]); // Clear options when input value is empty
    } else {
      fetchOptions(value); // Fetch options based on input value
    }
  };

  const handleChange = (event, value) => {
    const selected = value ? value.original : null;
    setSelectedEmployee(selected);
    onEmployeeSelect(selected);
  };

  return (
    <Autocomplete
      id="asynchronous-demo"
      sx={{ width: 300, mt: 2, ...sx }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      options={options}
      loading={loading}
      onInputChange={handleInputChange}
      onChange={handleChange}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Pracownik"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            )
          }}
        />
      )}
    />
  );
};

export default EmployeeSearch;
