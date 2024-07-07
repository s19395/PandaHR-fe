import axios from 'axios';
import { useAlert } from './AlertProvider';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.baseURL = process.env.REACT_APP_ENDPOINT;

/**
 * Custom hook for making HTTP requests with notifications.
 * This hook uses the useAlert hook to display notifications based on the result of the HTTP request.
 */
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
