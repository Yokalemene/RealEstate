import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Link, Grid, Paper } from '@mui/material';
import InputMask from 'react-input-mask';

const RegistrationPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phoneNumber: '',
        firstName: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/registration', formData);
            console.log(response.data);
            // Дополнительная обработка результата
            navigate('/login');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Grid container justifyContent="center" alignItems="center" sx={{ height: '80vh' }}>
            <Grid item xs={10} sm={6} md={4}>
                <Paper elevation={3} sx={{ padding: '20px' }}>
                    <Typography variant="h5" gutterBottom align="center">Регистрация</Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            type="email"
                            name="email"
                            label="Email"
                            margin="normal"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            fullWidth
                            type="password"
                            name="password"
                            label="Пароль"
                            margin="normal"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <InputMask
                            mask="+7 (999)-999-99-99"
                            maskChar="_"
                            name="phoneNumber"
                            label="Номер телефона"
                            margin="normal"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        >
                            {(inputProps) => <TextField fullWidth {...inputProps} />}
                        </InputMask>
                        <TextField
                            fullWidth
                            type="text"
                            name="firstName"
                            label="Ваше имя"
                            margin="normal"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth>Зарегистрироваться</Button>
                    </form>
                    <Typography variant="body2" align="center" sx={{ marginTop: '20px' }}>
                        Уже зарегистрированы? <Link href="/login">Войти в аккаунт</Link>
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default RegistrationPage;
