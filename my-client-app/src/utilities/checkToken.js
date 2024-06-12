import { jwtDecode } from 'jwt-decode';

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; 

    return decoded.exp < currentTime;
  } catch (err) {
    console.error('Ошибка декодирования токена:', err);
    return true;
  }
};

export default isTokenExpired;