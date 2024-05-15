import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Grid, TextField, Button, MenuItem, Typography } from '@mui/material';
import './RealEstatePage.css';
import Autocomplete from '@mui/material/Autocomplete';

const RealEstatePage = () => {
  const [listings, setListings] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    propertyType: '',
    location: '',
    priceFrom: '',
    priceTo: ''
  });
  const navigate = useNavigate();
  const [uniqueLocations, setUniqueLocations] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/listings');
        setListings(response.data);
      } catch (error) {
        console.error('Ошибка загрузки объявлений:', error);
      }
    };

    fetchListings();
    fetchUniqueLocations();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const criteria = {
      ...(searchCriteria.propertyType && { propertyType: searchCriteria.propertyType }),
      ...(searchCriteria.location && { location: searchCriteria.location }),
      ...(searchCriteria.priceFrom && { priceFrom: searchCriteria.priceFrom }),
      ...(searchCriteria.priceTo && { priceTo: searchCriteria.priceTo }),
    };

    try {
      const response = await axios.get('http://localhost:5000/api/listings', {
        params: criteria
      });
      setListings(response.data);
    } catch (error) {
      console.error('Ошибка поиска объявлений:', error);
    }
  };

  const openListing = (id) => {
    navigate(`/listings/${id}`);
  };

  const fetchUniqueLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/listings/unique-locations');
      setUniqueLocations(response.data);
    } catch (error) {
      console.error('Ошибка загрузки уникальных местоположений:', error);
    }
  };

  return (
    <div>
      <h2>Поиск недвижимости</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Выберите тип недвижимости"
              value={searchCriteria.propertyType}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, propertyType: e.target.value })}
              fullWidth
            >
              <MenuItem value="">Любой</MenuItem>
              <MenuItem value="Квартира">Квартира</MenuItem>
              <MenuItem value="Комната">Комната</MenuItem>
              <MenuItem value="Дом, дача, коттедж">Дом, дача, коттедж</MenuItem>
              <MenuItem value="Земельный участок">Земельный участок</MenuItem>
              <MenuItem value="Гараж и машиноместо">Гараж и машиноместо</MenuItem>
              <MenuItem value="Другое">Другое</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={uniqueLocations}
              value={searchCriteria.location}
              onChange={(event, newValue) => setSearchCriteria({ ...searchCriteria, location: newValue })}
              renderInput={(params) => <TextField {...params} label="Введите местоположение" fullWidth />}
              noOptionsText={"Ничего не найдено"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              label="Цена от"
              value={searchCriteria.priceFrom}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, priceFrom: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              label="Цена до"
              value={searchCriteria.priceTo}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, priceTo: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Искать
            </Button>
          </Grid>
        </Grid>
      </form>
      <div className="listings-container">
        {listings.length > 0 ? (
          listings.map(listing => (
            <div key={listing._id} className="listing" onClick={() => openListing(listing._id)}>
              <img src={listing.photos[0]} alt="Photo" />
              <div className="listing-info">
                <Typography variant="h6">{listing.propertyType}</Typography>
                <Typography>{listing.location}</Typography>
                <Typography>{listing.price} &#8381;</Typography> {/* Добавлен знак рубля */}
              </div>
            </div>
          ))
        ) : (
          <Typography variant="body1">Нет доступных объявлений</Typography>
        )}
      </div>
    </div>
  );
}

export default RealEstatePage;
