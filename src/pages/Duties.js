import React from 'react';
import {
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Duties = ({ dutyList, setDutyList, newDuty, setNewDuty }) => {
  const handleAddDuty = () => {
    if (newDuty.trim()) {
      setDutyList((prev) => [...prev, { description: newDuty }]);
      setNewDuty('');
    }
  };

  const handleRemoveDuty = (index) => setDutyList((prev) => prev.filter((_, i) => i !== index));

  return (
    <>
      <TextField
        variant="standard"
        label="Obowiązki"
        value={newDuty}
        onChange={(e) => setNewDuty(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAddDuty()}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleAddDuty} aria-label="add">
                <AddIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      <List>
        {dutyList.map((duty, index) => (
          <ListItem key={index}>
            <ListItemText primary={duty.description} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveDuty(index)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default Duties;
