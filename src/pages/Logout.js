import { useNavigate } from 'react-router-dom';
import { useAuth } from '../service/AuthService';
import Button from '@mui/material/Button';

const Logout = () => {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // remove token from local storage because backend isn't smart enough yet
    localStorage.removeItem('token');
    setToken();
    navigate('/', { replace: true });
  };

  setTimeout(() => {
    handleLogout();
  }, 3 * 1000);

  return (
    <>
      <Button onClick={handleLogout}>Logout</Button>
    </>
  );
};

export default Logout;
