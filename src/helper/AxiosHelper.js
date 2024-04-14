import axios from 'axios';
import { useAlert } from './AlertProvider';

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

export const request = async (method, url, data) => {
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
