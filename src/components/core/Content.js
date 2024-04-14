import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const Content = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:8080/messages')
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      <h3>This is a response from the backend</h3>
      <Typography paragraph>{data}</Typography>
      <h3>This is not a response from the backend</h3>
      <Typography paragraph>
        Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper eget nulla
        facilisi etiam dignissim diam. Pulvinar elementum integer enim neque volutpat ac tincidunt.
        Ornare suspendisse sed nisi lacus sed viverra tellus. Purus sit amet volutpat consequat
        mauris. Elementum eu facilisis sed odio morbi. Euismod lacinia at quis risus sed vulputate
        odio. Morbi tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
        hendrerit gravid rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem et
        Habitant morbi tristique senectus et. Adipiscing elit duis tristique sollicitudin nibh sit.
        Ornare aenean euismod elementum nisi quis eleifend. Commodo viverra maecenas accumsan lacus
        vel facilisis. Nulla posuere sollicitudin aliquam ultrices sagittis orci a.
      </Typography>
    </Box>
  );
};

export default Content;
