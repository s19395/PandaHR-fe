import axios from 'axios';
import { useAlert } from './AlertService';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.baseURL = process.env.REACT_APP_ENDPOINT;

export const useRequestWithNotification = () => {
  const { setAlert } = useAlert();

  return async (method, endpoint, data = {}, showAlert = false) => {
    try {
      const response = await request(method, endpoint, data);

      if (showAlert) {
        setAlert({
          open: true,
          severity: 'success',
          message: response.data.message
        });
      }

      return response.data.data;
    } catch (error) {
      if (error.response.data.trace?.includes('com.auth0.jwt.exceptions.TokenExpiredException')) {
        setAlert({
          open: true,
          severity: 'error',
          message: 'Sesja wygasła. Zaloguj się ponownie.'
        });
        window.localStorage.removeItem('token');
      } else {
        setAlert({
          open: true,
          severity: 'error',
          message: 'HTTP ' + error.response.status + ': ' + error.response.data.message
        });
      }

      throw error;
    }
  };
};

export const getAuthToken = () => {
  return window.localStorage.getItem('token');
};

export const request = async (method, url, data, token = getAuthToken()) => {
  let headers = {};

  if (token !== null && token !== 'null') {
    headers = { Authorization: `Bearer ${token}` };
  }

  return axios({
    method: method,
    url: url,
    headers: headers,
    data: data
  });
};
