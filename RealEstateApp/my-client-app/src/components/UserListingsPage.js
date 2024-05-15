import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Grid, TextField, Button, MenuItem, Typography } from '@mui/material';
import './UserListingsPage.css';

const UserListingsPage = () => {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get('http://localhost:5000/api/mylistings', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
        setListings(response.data);
      } catch (error) {
        console.error('Ошибка загрузки объявлений:', error);
      }
    };

    fetchListings();
  }, []);

  const handleDeleteListing = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/deletelisting/${id}`);
      // Обновляем список объявлений после удаления
      const updatedListings = listings.filter(listing => listing._id !== id);
      setListings(updatedListings);
    } catch (error) {
      console.error('Ошибка при удалении объявления:', error);
    }
  };

  return (
    <div>
      <h2>Мои объявления</h2>
      <div className="listings-container">
        {listings.length > 0 ? (
          listings.map(listing => (
            <div key={listing._id} className="listing">
              <img src={listing.photos[0]} alt="Photo" />
              <div className="listing-info">
                <Typography variant="h6">{listing.propertyType}</Typography>
                <Typography>{listing.location}</Typography>
                <Typography>{listing.price}</Typography>
                <Button variant="contained" color="secondary" onClick={() => handleDeleteListing(listing._id)}>
                  Удалить
                </Button>
              </div>
            </div>
          ))
        ) : (
          <Typography variant="body1">Нет объявлений</Typography>
        )}
      </div>
    </div>
  );
}

export default UserListingsPage;
