import React, { useState } from 'react';
import { TextField, Button, Typography, Link, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Отправляем запрос на сервер для аутентификации
            const response = await axios.post('http://localhost:5000/api/login', formData);

            // Если запрос выполнен успешно, сохраняем токен доступа в локальное хранилище
            localStorage.setItem('accessToken', response.data.accessToken);

            // Перенаправляем пользователя на страницу профиля
            navigate('/profile');
        } catch (error) {
            console.error(error);
            // Обработка ошибок аутентификации, например, вывод сообщения об ошибке
        }
    };

    return (
        <Grid container justifyContent="center" alignItems="center" sx={{ height: '80vh' }}>
            <Grid item xs={10} sm={6} md={4}>
                <Paper elevation={3} sx={{ padding: '20px' }}>
                    <Typography variant="h5" gutterBottom align="center">Вход</Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            type="email"
                            name="email"
                            label="Email"
                            margin="normal"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            name="password"
                            label="Пароль"
                            margin="normal"
                            required
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth>Войти</Button>
                    </form>
                    <Typography variant="body2" align="center" sx={{ marginTop: '20px' }}>
                        Нет аккаунта? <Link href="/registration">Зарегистрируйтесь!</Link>
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default LoginPage;
