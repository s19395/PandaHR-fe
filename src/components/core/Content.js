import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import Box from '@mui/material/Box';
import { request } from '../../helper/axios_helper';

export default class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    request('get', '/messages')
      .then((response) => {
        console.log(response.data);
        this.setState({ data: response.data });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    return (
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <h3>This is a response from the backend</h3>
        {this.state.data &&
          this.state.data.map((line) => <Typography paragraph>{line}</Typography>)}
        <h3>This is not a response from the backend</h3>
        <Typography paragraph>
          Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper eget nulla
          facilisi etiam dignissim diam. Pulvinar elementum integer enim neque volutpat ac
          tincidunt. Ornare suspendisse sed nisi lacus sed viverra tellus. Purus sit amet volutpat
          consequat mauris. Elementum eu facilisis sed odio morbi. Euismod lacinia at quis risus sed
          vulputate odio. Morbi tincidunt ornare massa eget egestas purus viverra accumsan in. In
          hendrerit hendrerit gravid rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam
          sem et Habitant morbi tristique senectus et. Adipiscing elit duis tristique sollicitudin
          nibh sit. Ornare aenean euismod elementum nisi quis eleifend. Commodo viverra maecenas
          accumsan lacus vel facilisis. Nulla posuere sollicitudin aliquam ultrices sagittis orci a.
        </Typography>
      </Box>
    );
  }
}
