import axios from 'axios';

// Создаем экземпляр axios с базовым URL и включенными cookie
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
});



// Интерцептор запроса для добавления токена доступа в заголовки
api.interceptors.request.use(config => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Интерцептор ответа для обновления токена доступа
api.interceptors.response.use(response => {
    return response;
}, async error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            const response = await axios.get('http://localhost:5000/api/refresh', { withCredentials: true });
            localStorage.setItem('accessToken', response.data.accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
            return api(originalRequest);
        } catch (err) {
            console.log('Токен обновления истёк или недействителен');
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

export default api;

