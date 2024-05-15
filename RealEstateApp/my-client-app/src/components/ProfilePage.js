import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Grid } from '@mui/material';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [editedUser, setEditedUser] = useState(null);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    window.location.href = '/login';
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/profile', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                setUser(response.data);
                setEditedUser(response.data);
            } catch (error) {
                if (error.response.status === 401) {
                    // Если получен статус 401, перенаправляем пользователя на страницу входа
                    localStorage.removeItem('accessToken');
                    navigate('/login');
                    
                } else {
                   console.error('Ошибка при получении профиля:', error);
                setError('Ошибка при загрузке профиля');
                }
            }
        };

        fetchUserProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser({ ...editedUser, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.put('http://localhost:5000/api/profile', editedUser, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setUser(response.data);
            console.log('Профиль успешно обновлен');
        } catch (error) {
            if (error.response.status === 401) {
                // Если получен статус 401, перенаправляем пользователя на страницу входа
                localStorage.removeItem('accessToken');
                navigate('/login');
                
            } else {
                console.error('Ошибка при обновлении профиля:', error);
                setError('Ошибка при обновлении профиля');
            }
        }
    };

    const handleLogout = () => {
        // Удаление текущего токена доступа из localStorage и перенаправление на страницу входа
        localStorage.removeItem('accessToken');
        navigate('/login');
    };


    const handleViewListings = () => {
        navigate('/mylistings');
    };


    return (
        <div>
        {error && <p>{error}</p>}
        {user && (
           <Container maxWidth="sm" style={{ marginTop: '20px' }}>
           <Typography variant="h4" gutterBottom>
               Редактирование профиля
           </Typography>
           {error && <Typography color="error">{error}</Typography>}
           {user && (
               <form>
                   <Grid container spacing={2}>
                       <Grid item xs={12}>
                           <TextField
                               fullWidth
                               label="Email"
                               name="email"
                               required
                               value={editedUser.email}
                               onChange={handleInputChange}
                           />
                       </Grid>
                       <Grid item xs={12}>
                             <TextField
                                        fullWidth
                                        label="Номер телефона"
                                        name="phoneNumber"
                                        value={editedUser.phoneNumber}
                                        onChange={handleInputChange}
                                        required
                                        InputProps={{
                                            inputComponent: PhoneNumberMask
                                        }}
                                    />
                       </Grid>
                       <Grid item xs={12}>
                           <TextField
                               fullWidth
                               label="Имя"
                               name="firstName"
                               required
                               value={editedUser.firstName}
                               onChange={handleInputChange}
                           />
                       </Grid>
                       <Grid item xs={12}>
                           <TextField
                               fullWidth
                               label="Фамилия"
                               name="lastName"
                               value={editedUser.lastName}
                               onChange={handleInputChange}
                           />
                       </Grid>
                       <Grid item xs={12}>
                           <TextField
                               fullWidth
                               label="Отчество"
                               name="middleName"
                               value={editedUser.middleName}
                               onChange={handleInputChange}
                           />
                       </Grid>
                       <Grid item xs={12}>
                           <Button variant="contained" color="primary" onClick={handleSubmit}>
                               Сохранить
                           </Button>
                       </Grid>
                       <Grid item xs={12}>
                                    <Button variant="contained" color="secondary" onClick={handleLogout}>
                                        Выйти из профиля
                                    </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" onClick={handleViewListings}>
                                Просмотреть объявления
                            </Button>
                        </Grid>
                   </Grid>
               </form>
           )}
       </Container>
        )}
    </div>
    );
};

const PhoneNumberMask = (props) => (
    <InputMask mask="+7 (999)-999-99-99" maskChar={null} {...props} />
);

export default ProfilePage;
