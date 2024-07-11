import { useState } from 'react';
import MuiCheckbox from '@mui/material/Checkbox';
import * as React from 'react';
import { NumericFormat } from 'react-number-format';
import TextField from '@mui/material/TextField';

export const dateFieldProps = () => ({
  required: true,
  type: 'date',
  InputLabelProps: { shrink: true },
  inputProps: {
    min: '1900-01-01'
  },
  defaultValue: new Date().toISOString().split('T')[0]
});

export const CustomCheckbox = ({ column, row }) => {
  const [checked, setChecked] = useState(row._valuesCache[column.id] || false);

  const onChange = (event) => {
    const newChecked = event.target.checked;
    setChecked(newChecked);
    row._valuesCache[column.id] = newChecked;
  };

  return <MuiCheckbox checked={checked} onChange={onChange} />;
};

export const CustomNumericEdit = ({ column, row, suffix }) => {
  const [value, setValue] = useState(row._valuesCache[column.id] || 0);

  const handleChange = (values) => {
    const newValue = values.floatValue;
    setValue(newValue);
    row._valuesCache[column.id] = newValue;
  };

  return (
    <NumericFormat
      value={value}
      onValueChange={handleChange}
      customInput={TextField}
      variant="standard"
      suffix={suffix}
      // Add other props specific to NumericFormat, e.g., formatting options
    />
  );
};
