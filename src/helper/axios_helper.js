import axios from 'axios';

// axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.baseURL = 'https://pandahr.azurewebsites.net';
axios.defaults.headers.post['Content-Type'] = 'application/json';

export const request = async (method, url, data) => {
  return axios({
    method: method,
    url: url,
    data: data
  });
};
