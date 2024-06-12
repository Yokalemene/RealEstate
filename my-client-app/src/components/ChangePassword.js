import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            await axios.patch('http://localhost:5000/api/change-password',
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setSuccess('Пароль успешно изменен');
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (error) {
            setError('Ошибка при изменении пароля: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Изменение пароля
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            {success && <Typography color="primary">{success}</Typography>}
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Старый пароль"
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Новый пароль"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Подтвердите новый пароль"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" type="submit">
                            Изменить пароль
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Container>
    );
};

export default ChangePassword;
