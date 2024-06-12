import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Snackbar, Alert } from '@mui/material';
import './UserListingsPage.css';

const UserListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [applications, setApplications] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          navigate('/login');
          return;
        }
        const response = await axios.get('http://localhost:5000/api/mylistings', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        const listingsData = response.data;
        setListings(listingsData);

        const applicationStatus = {};
        for (const listing of listingsData) {
          const applicationResponse = await axios.get(`http://localhost:5000/api/checkapplication/${listing._id}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          applicationStatus[listing._id] = applicationResponse.data.exists;
        }
        setApplications(applicationStatus);
      } catch (error) {
        console.error('Ошибка загрузки объявлений:', error);
      }
    };

    fetchListings();
  }, []);

  const handleDeleteListing = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/deletelisting/${id}`);
      const updatedListings = listings.filter(listing => listing._id !== id);
      setListings(updatedListings);

      await axios.post('http://localhost:5000/api/activitylog', {
        action: 'Удаление объявления',
        details: { listingId: id }
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
    } catch (error) {
      console.error('Ошибка при удалении объявления:', error);
    }
  };

  const handleCreateApplication = async (id) => {
    if (applications[id]) {
      setNotification({ open: true, message: 'Заявка уже создана', severity: 'warning' });
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      await axios.post('http://localhost:5000/api/createapplication', { listingId: id }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setNotification({ open: true, message: 'Заявка на одобрение создана', severity: 'success' });

      await axios.post('http://localhost:5000/api/activitylog', {
        action: 'Создание заявки',
        details: { listingId: id }
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Update application status
      setApplications(prev => ({ ...prev, [id]: true }));
    } catch (error) {
      console.error('Ошибка при создании заявки:', error);
      setNotification({ open: true, message: 'Ошибка при создании заявки', severity: 'error' });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ open: false, message: '', severity: '' });
  };

  return (
    <div style={{ padding: '0 20px', marginBottom: '100px' }}>
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleCreateApplication(listing._id)}
                  disabled={applications[listing._id]}
                >
                  Экспертная оценка
                </Button>
              </div>
            </div>
          ))
        ) : (
          <Typography variant="body1">Нет объявлений</Typography>
        )}
      </div>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default UserListingsPage;
