import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import { Link } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

const drawerWidth = 240;

const items = [
  { text: 'Nowy pracownik', icon: <PersonAddAlt1Icon /> },
  { text: 'Pracownicy', icon: <PersonIcon />, link: '/employees' },
  { text: 'Stanowiska', icon: <WorkIcon />, link: '/positions' },
  { text: 'Umowy', icon: <DescriptionIcon />, link: '/contracts' }
];

export default function LeftDrawer() {
  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' }
        }}>
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {items.map(({ text, icon, link }) => (
              <ListItem key={text} disablePadding>
                <ListItemButton component={Link} to={link} key={text}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
