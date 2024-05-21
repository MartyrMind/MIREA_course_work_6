import axios from 'axios';

export function connectBackend(endpoint, method, body, content_type, setter) {
  console.log('request to', endpoint, 'for', method);
  //   console.log('ENV_IP', process.env.REACT_APP_EXTERNAL_IP);
  //   var backend_address = process.env.REACT_APP_EXTERNAL_IP;
  //   if (typeof backend_address === 'undefined') backend_address = 'localhost';
  const backend_address = '51.250.0.94';
  axios({
    method: method,
    url: `http://${backend_address}:8000/${endpoint}`,
    data: body,
    headers: {
      'Content-Type': content_type,
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(function (response) {
      console.log(response.data);
      if (setter != null) setter(response.data);
      else return response.data;
    })
    .catch(function (error) {
      if (error.response && error.response.status == 401)
        localStorage.removeItem('token');
      if (setter != null) setter([]);
      else return null;
    });
}
