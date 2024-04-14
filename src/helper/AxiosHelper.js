import axios from 'axios';
import { useAlert } from './AlertProvider';

//axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.baseURL = 'https://pandahr.azurewebsites.net';
axios.defaults.headers.post['Content-Type'] = 'application/json';

export const useRequestWithNotification = () => {
  const { setAlert } = useAlert();

  return async (endpoint, method, data = {}, showAlert = false) => {
    try {
      const response = await axios(endpoint, {
        method,
        data: data
      });

      if (showAlert) {
        setAlert({
          open: true,
          severity: 'success',
          message: 'Operation successful'
        });
      }

      return response.data;
    } catch (error) {
      console.error(error);

      setAlert({
        open: true,
        severity: 'error',
        message: 'HTTP ' + error.response.status + ': ' + error.response.data.message
      });

      throw error;
    }
  };
};

export const getAuthToken = () => {
  return window.localStorage.getItem('token');
};

export const request = (method, url, data) => {
  let headers = {};

  if (getAuthToken() !== null && getAuthToken() !== 'null') {
    headers = { Authorization: `Bearer ${getAuthToken()}` };
  }

  return axios({
    method: method,
    url: url,
    headers: headers,
    data: data
  });
};
