import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Card, CardContent, Typography, CardMedia, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './FavoriteListingsPage.css';

const FavoriteListingsPage = () => {
    const [favorites, setFavorites] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavoriteListings = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/favorites', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                setFavorites(response.data);
            } catch (error) {
                console.error('Ошибка при получении понравившихся объявлений:', error);
            }
        };

        fetchFavoriteListings();
    }, []);

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Понравившиеся объявления
            </Typography>
            <Grid container spacing={4}>
                {favorites.map(listing => (
                    <Grid item key={listing._id} xs={12} sm={6} md={4}>
                        <Card>
                            <CardMedia
                                component="img"
                                alt={listing.propertyType}
                                height="140"
                                image={listing.photos[0]}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {listing.propertyType}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {listing.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {listing.price} &#8381;
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={() => navigate(`/listings/${listing._id}`)}
                                >
                                    Подробнее
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default FavoriteListingsPage;
