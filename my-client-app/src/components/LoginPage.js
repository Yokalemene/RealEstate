import React, { useState } from 'react';
import { TextField, Button, Typography, Link, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [emailForReset, setEmailForReset] = useState('');
    const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleResetEmailChange = (e) => {
        setEmailForReset(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Отправляем запрос на сервер для аутентификации
            const response = await axios.post('http://localhost:5000/api/login', formData);

            // Если запрос выполнен успешно, сохраняем токен доступа в локальное хранилище
            localStorage.setItem('accessToken', response.data.accessToken);
             // Записываем действие входа в журнал
            await axios.post('http://localhost:5000/api/activitylog', {
                action: 'Вход в аккаунт',
                details: { email: formData.email }
            }, {
                headers: { Authorization: `Bearer ${response.data.accessToken}` }
            });
            // Перенаправляем пользователя на страницу профиля
            navigate('/profile');
        } catch (error) {
            console.error(error);
            // Обработка ошибок аутентификации, например, вывод сообщения об ошибке
        }
        try {
            
            // Отправляем запрос на сервер для аутентификации администратора
            const response = await axios.post('http://localhost:5000/api/employee/login', formData);

            // Если запрос выполнен успешно, сохраняем токен доступа в локальное хранилище
            localStorage.setItem('accessToken', response.data.token);
            const verifyResponse = await axios.get('http://localhost:5000/api/employee/verify-employee', {
                headers: {
                    Authorization: `Bearer ${response.data.token}`
                }
            });
    
            console.log('Статус сотрудника:', verifyResponse.data);
            // Перенаправляем администратора на страницу администратора
            navigate('/employee');
        } catch (error) {
            console.error(error);
        }
            try {
            
            // Отправляем запрос на сервер для аутентификации администратора
            const response = await axios.post('http://localhost:5000/api/admin/login', formData);

            // Если запрос выполнен успешно, сохраняем токен доступа в локальное хранилище
            localStorage.setItem('accessToken', response.data.token);
            const verifyResponse = await axios.get('http://localhost:5000/api/admin/verify-admin', {
                headers: {
                    Authorization: `Bearer ${response.data.token}`
                }
            });
    
            console.log('Статус администратора:', verifyResponse.data);
            // Перенаправляем администратора на страницу администратора
            navigate('/admin');
        } catch (error) {
            console.error(error);
        }
        };
        

    const handleForgotPassword = async () => {
        try {
            await axios.post('http://localhost:5000/api/forgot-password', { email: emailForReset });
            alert('Ссылка для сброса пароля отправлена на вашу почту');
            setShowResetPasswordForm(false);
        } catch (error) {
            console.error(error);
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
                    <Typography variant="body2" align="center" sx={{ marginTop: '10px' }}>
                        <Link onClick={() => setShowResetPasswordForm(true)} style={{ cursor: 'pointer' }}>
                            Забыли пароль?
                        </Link>
                    </Typography>
                    {showResetPasswordForm && (
                        <div>
                            <TextField
                                fullWidth
                                type="email"
                                label="Введите ваш email"
                                margin="normal"
                                value={emailForReset}
                                onChange={handleResetEmailChange}
                            />
                            <Button variant="contained" color="primary" fullWidth onClick={handleForgotPassword}>
                                Отправить ссылку для сброса пароля
                            </Button>
                        </div>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default LoginPage;
