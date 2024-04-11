import { useNavigate } from 'react-router-dom';
import { useAuth } from '../helper/authProvider';
import { Button } from 'baseui/button';

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
