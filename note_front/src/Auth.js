import { useLocation, Navigate } from 'react-router-dom';

export const setToken = (token) => {
  console.log(token);
  localStorage.setItem('token', token);
};

export const fetchToken = (token) => {
  return localStorage.getItem('token');
};

export function RequireToken({ children }) {
  let auth = fetchToken();
  console.log(typeof auth);
  let location = useLocation();

  if (!auth || auth == 'undefined') {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
}
