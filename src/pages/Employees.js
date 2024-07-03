import * as React from 'react';
import MUIDataTable from 'mui-datatables';
import { useEffect, useState } from 'react';
import { request } from '../helper/AxiosHelper';
import { useAuth } from '../helper/AuthProvider';

export default function Employees() {
  const columns = ['Imię', 'Nazwisko', 'Date of Birth'];
  const [data, setData] = useState([]);
  const { token } = useAuth(); // Get the token from the AuthProvider

  useEffect(() => {
    request('GET', '/employees/findAll', null, token)
      .then((response) => {
        const transformedData = response.data.map((employee) => [
          employee.firstName,
          employee.lastName,
          employee.dateOfBirth
        ]);
        setData(transformedData);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  const options = {
    filterType: 'checkbox'
  };

  return (
    <MUIDataTable title={'Lista pracowników'} data={data} columns={columns} options={options} />
  );
}
