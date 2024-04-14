import { useAuth } from '../helper/AuthProvider';
import { Container } from '@mui/material';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import * as React from 'react';
import { useRequestWithNotification } from '../helper/AxiosHelper';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Login = () => {
  const { token, setToken } = useAuth();
  const requestWithNotification = useRequestWithNotification();
  const navigate = useNavigate();

  // Use the useState hook to manage state
  const [login, setLogin] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);

  useEffect(() => {
    if (token) {
      navigate('/', {
        replace: true
      });
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await requestWithNotification('POST', '/login', {
        login,
        password
      });
      setToken(data.token);
    } catch (error) {
      setToken();
      setLoginError(true);
      setPasswordError(true);
      console.error(error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            error={loginError}
            margin="normal"
            required
            fullWidth
            id="loginName"
            label="Login"
            name="login"
            autoComplete="login"
            autoFocus
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <TextField
            error={passwordError}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={(e) => handleLogin(e)}>
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2">
                No account? Sign up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
